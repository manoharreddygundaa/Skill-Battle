import jwt from 'jsonwebtoken';
import { Battle } from '../models/Battle.js';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { executeCode } from '../services/codeExecutionService.js';
import { checkAndAwardBadges } from '../services/badgeService.js';
import { config } from '../config/env.js';

// In-memory active battle countdown intervals
const battleTimers = new Map();

/**
 * Resilient lookup helper to find battle by room code
 */
const findBattleByCode = async (rawCode) => {
  if (!rawCode) return null;
  const raw = decodeURIComponent(rawCode).trim().toUpperCase();
  const withDash = raw.replace(/\s+/g, '-');
  const withoutDash = raw.replace(/[\s-]+/g, '');

  return await Battle.findOne({
    $or: [
      { roomCode: raw },
      { roomCode: withDash },
      { roomCode: withoutDash },
      { roomCode: `SB-${withoutDash.replace(/^SB/, '')}` },
      { roomCode: `SB${withoutDash.replace(/^SB/, '')}` }
    ]
  });
};

/**
 * Socket.IO authentication middleware
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('name username avatar rating role isSuspended');

    if (!user || user.isSuspended) {
      return next(new Error('User not authorized'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid socket authentication'));
  }
};

/**
 * Setup battle socket event listeners
 */
export const setupBattleSocket = (io) => {
  const battleNamespace = io.of('/battle');

  battleNamespace.use(socketAuthMiddleware);

  battleNamespace.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] User connected: ${user.username} (${socket.id})`);

    /**
     * Join battle room
     */
    socket.on('battle:join', async ({ roomCode }, callback) => {
      try {
        if (!roomCode) {
          return callback?.({ success: false, message: 'Room code is required' });
        }

        const battleDoc = await findBattleByCode(roomCode);
        if (!battleDoc) {
          return callback?.({ success: false, message: 'Battle room not found' });
        }

        const normalizedCode = battleDoc.roomCode;
        const battle = await Battle.findById(battleDoc._id)
          .populate('creator', 'name username avatar rating')
          .populate('opponent', 'name username avatar rating')
          .populate({
            path: 'problem',
            select: '-hiddenTestCases'
          });

        const userIdStr = user._id.toString();
        const isCreator = battle.creator._id.toString() === userIdStr;
        let isOpponent = battle.opponent && battle.opponent._id.toString() === userIdStr;

        // If not creator and no opponent yet, assign as opponent
        if (!isCreator && !battle.opponent && battle.status === 'waiting') {
          battle.opponent = user._id;
          await battle.save();
          isOpponent = true;
        } else if (!isCreator && !isOpponent && battle.status !== 'completed') {
          return callback?.({ success: false, message: 'Battle room is full (maximum 2 participants).' });
        }

        const roomName = `room_${normalizedCode}`;
        socket.join(roomName);

        // Fetch freshly populated battle
        const updatedBattle = await Battle.findById(battle._id)
          .populate('creator', 'name username avatar rating')
          .populate('opponent', 'name username avatar rating')
          .populate('winner', 'name username avatar rating')
          .populate({
            path: 'problem',
            select: '-hiddenTestCases'
          });

        // Broadcast to everyone in room that state changed
        battleNamespace.to(roomName).emit('battle:state_update', {
          battle: updatedBattle,
          message: `${user.username} joined the lobby`
        });

        callback?.({
          success: true,
          battle: updatedBattle,
          isCreator,
          isOpponent
        });
      } catch (err) {
        console.error('[Socket battle:join error]', err);
        callback?.({ success: false, message: err.message });
      }
    });

    /**
     * Toggle Ready state
     */
    socket.on('battle:ready', async ({ roomCode, ready }, callback) => {
      try {
        const battle = await findBattleByCode(roomCode);
        if (!battle || battle.status !== 'waiting') return;
        const normalizedCode = battle.roomCode;

        const userIdStr = user._id.toString();
        if (battle.creator.toString() === userIdStr) {
          battle.creatorReady = !!ready;
        } else if (battle.opponent && battle.opponent.toString() === userIdStr) {
          battle.opponentReady = !!ready;
        }

        await battle.save();

        const roomName = `room_${normalizedCode}`;
        battleNamespace.to(roomName).emit('battle:ready_status', {
          creatorReady: battle.creatorReady,
          opponentReady: battle.opponentReady
        });

        callback?.({ success: true, creatorReady: battle.creatorReady, opponentReady: battle.opponentReady });
      } catch (err) {
        console.error('[Socket battle:ready error]', err);
        callback?.({ success: false, message: err.message });
      }
    });

    /**
     * Start the Battle
     */
    socket.on('battle:start', async ({ roomCode }, callback) => {
      try {
        const battleDoc = await findBattleByCode(roomCode);
        if (!battleDoc) {
          return callback?.({ success: false, message: 'Battle not found' });
        }

        const normalizedCode = battleDoc.roomCode;
        const battle = await Battle.findById(battleDoc._id)
          .populate('creator', 'name username avatar rating')
          .populate('opponent', 'name username avatar rating');

        if (!battle) {
          return callback?.({ success: false, message: 'Battle not found' });
        }

        if (battle.creator._id.toString() !== user._id.toString()) {
          return callback?.({ success: false, message: 'Only the room creator can start the battle' });
        }

        if (!battle.opponent) {
          return callback?.({ success: false, message: 'Waiting for an opponent to join' });
        }

        // Ensure problem is selected
        if (!battle.problem) {
          const problems = await Problem.find({ difficulty: battle.difficulty, isActive: true });
          if (problems.length > 0) {
            const random = problems[Math.floor(Math.random() * problems.length)];
            battle.problem = random._id;
          }
        }

        const problem = await Problem.findById(battle.problem).select('-hiddenTestCases');

        battle.status = 'in_progress';
        battle.startTime = new Date();
        const durationSec = battle.duration || 600;
        battle.endTime = new Date(Date.now() + durationSec * 1000);

        battle.creatorProgress = {
          testCasesPassed: 0,
          totalTestCases: problem.sampleTestCases.length + 5, // estimated total
          status: 'coding'
        };

        battle.opponentProgress = {
          testCasesPassed: 0,
          totalTestCases: problem.sampleTestCases.length + 5,
          status: 'coding'
        };

        await battle.save();

        const roomName = `room_${normalizedCode}`;
        battleNamespace.to(roomName).emit('battle:started', {
          battleId: battle._id,
          roomCode: normalizedCode,
          problem,
          duration: durationSec,
          startTime: battle.startTime,
          endTime: battle.endTime
        });

        // Start authoritative server timer
        if (battleTimers.has(normalizedCode)) {
          clearInterval(battleTimers.get(normalizedCode));
        }

        let remainingSeconds = durationSec;
        const intervalId = setInterval(async () => {
          remainingSeconds -= 1;

          if (remainingSeconds % 5 === 0 || remainingSeconds <= 10) {
            battleNamespace.to(roomName).emit('battle:timer_tick', { remainingSeconds });
          }

          if (remainingSeconds <= 0) {
            clearInterval(intervalId);
            battleTimers.delete(normalizedCode);
            await handleTimeExpired(normalizedCode, battleNamespace);
          }
        }, 1000);

        battleTimers.set(normalizedCode, intervalId);
        callback?.({ success: true });
      } catch (err) {
        console.error('[Socket battle:start error]', err);
        callback?.({ success: false, message: err.message });
      }
    });

    /**
     * Submit progress update during coding (e.g. running tests)
     */
    socket.on('battle:progress', async ({ roomCode, status, testCasesPassed, totalTestCases }) => {
      try {
        const normalizedCode = roomCode.toUpperCase().trim();
        const roomName = `room_${normalizedCode}`;

        socket.to(roomName).emit('battle:opponent_progress', {
          userId: user._id,
          username: user.username,
          status: status || 'coding',
          testCasesPassed: testCasesPassed || 0,
          totalTestCases: totalTestCases || 0
        });
      } catch (err) {
        console.error('[Socket battle:progress error]', err);
      }
    });

    /**
     * Submit Final Code in Battle
     */
    socket.on('battle:submit', async ({ roomCode, code, language }, callback) => {
      try {
        const battle = await findBattleByCode(roomCode);
        if (!battle || battle.status !== 'in_progress') {
          return callback?.({ success: false, message: 'Battle is not in progress.' });
        }
        const normalizedCode = battle.roomCode;

        const problem = await Problem.findById(battle.problem);
        if (!problem) {
          return callback?.({ success: false, message: 'Problem not found.' });
        }

        const isCreator = battle.creator.toString() === user._id.toString();
        const isOpponent = battle.opponent && battle.opponent.toString() === user._id.toString();

        if (!isCreator && !isOpponent) {
          return callback?.({ success: false, message: 'Not an active participant in this battle.' });
        }

        // Run full evaluation (sample + hidden test cases)
        const allTestCases = [
          ...problem.sampleTestCases.map(tc => ({ input: tc.input, output: tc.output })),
          ...problem.hiddenTestCases.map(tc => ({ input: tc.input, output: tc.output }))
        ];

        const executionResult = await executeCode({
          code,
          language,
          functionName: problem.functionName,
          testCases: allTestCases
        });

        // Save submission record
        const submission = await Submission.create({
          user: user._id,
          problem: problem._id,
          battle: battle._id,
          code,
          language,
          status: executionResult.status,
          testCasesPassed: executionResult.testCasesPassed,
          totalTestCases: executionResult.totalTestCases,
          executionTime: executionResult.executionTime,
          memory: executionResult.memory
        });

        const solveTimeSeconds = Math.round((Date.now() - new Date(battle.startTime).getTime()) / 1000);

        // Update participant progress in battle document
        const progressData = {
          testCasesPassed: executionResult.testCasesPassed,
          totalTestCases: executionResult.totalTestCases,
          submittedAt: new Date(),
          submissionTimeSeconds: solveTimeSeconds,
          submission: submission._id,
          status: executionResult.passed ? 'solved' : 'submitted_partial'
        };

        if (isCreator) {
          battle.creatorProgress = progressData;
        } else {
          battle.opponentProgress = progressData;
        }

        await battle.save();

        const roomName = `room_${normalizedCode}`;

        // Notify opponent of test results count (without code or hidden test cases!)
        socket.to(roomName).emit('battle:opponent_progress', {
          userId: user._id,
          username: user.username,
          status: executionResult.passed ? 'solved' : 'submitted_partial',
          testCasesPassed: executionResult.testCasesPassed,
          totalTestCases: executionResult.totalTestCases
        });

        // If this participant passed all test cases -> WE HAVE A WINNER!
        if (executionResult.passed) {
          // Double check if battle is still marked in_progress (handles race condition)
          const freshBattle = await Battle.findById(battle._id);
          if (freshBattle.status === 'in_progress') {
            freshBattle.status = 'completed';
            freshBattle.winner = user._id;
            freshBattle.endTime = new Date();
            freshBattle.resultSummary = {
              reason: 'solved_first',
              creatorPointsAwarded: isCreator ? 100 : -25,
              opponentPointsAwarded: isCreator ? -25 : 100
            };
            await freshBattle.save();

            // Stop server countdown timer
            if (battleTimers.has(normalizedCode)) {
              clearInterval(battleTimers.get(normalizedCode));
              battleTimers.delete(normalizedCode);
            }

            // Update user battle statistics and ratings
            await finalizeBattleStats(freshBattle);

            // Emit battle end to room
            battleNamespace.to(roomName).emit('battle:ended', {
              winnerId: user._id,
              winnerUsername: user.username,
              reason: 'solved_first',
              solveTimeSeconds,
              battle: await Battle.findById(freshBattle._id)
                .populate('creator', 'name username avatar rating')
                .populate('opponent', 'name username avatar rating')
                .populate('winner', 'name username avatar rating')
            });
          }
        }

        callback?.({
          success: true,
          executionResult: {
            status: executionResult.status,
            passed: executionResult.passed,
            testCasesPassed: executionResult.testCasesPassed,
            totalTestCases: executionResult.totalTestCases,
            executionTime: executionResult.executionTime,
            sampleResults: executionResult.results.slice(0, problem.sampleTestCases.length)
          }
        });
      } catch (err) {
        console.error('[Socket battle:submit error]', err);
        callback?.({ success: false, message: err.message });
      }
    });

    /**
     * Rematch request
     */
    socket.on('battle:rematch', async ({ roomCode }, callback) => {
      try {
        const normalizedCode = roomCode.toUpperCase().trim();
        const oldBattle = await Battle.findOne({ roomCode: normalizedCode });
        if (!oldBattle) return;

        // Select a new random problem of same difficulty
        const problems = await Problem.find({ difficulty: oldBattle.difficulty, isActive: true });
        const randomProblem = problems[Math.floor(Math.random() * problems.length)];

        oldBattle.status = 'waiting';
        oldBattle.winner = null;
        oldBattle.problem = randomProblem._id;
        oldBattle.creatorReady = false;
        oldBattle.opponentReady = false;
        oldBattle.creatorProgress = {};
        oldBattle.opponentProgress = {};
        oldBattle.startTime = null;
        oldBattle.endTime = null;
        oldBattle.resultSummary = {};
        await oldBattle.save();

        const roomName = `room_${normalizedCode}`;
        battleNamespace.to(roomName).emit('battle:rematch_ready', {
          battle: await Battle.findById(oldBattle._id)
            .populate('creator', 'name username avatar rating')
            .populate('opponent', 'name username avatar rating')
            .populate({ path: 'problem', select: '-hiddenTestCases' })
        });

        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${user.username}`);
    });
  });
};

/**
 * Handle time expiration authoritative check
 */
const handleTimeExpired = async (roomCode, namespace) => {
  try {
    const battle = await Battle.findOne({ roomCode });
    if (!battle || battle.status !== 'in_progress') return;

    const creatorPassed = battle.creatorProgress?.testCasesPassed || 0;
    const opponentPassed = battle.opponentProgress?.testCasesPassed || 0;

    let winnerId = null;
    let reason = 'time_expired_draw';

    if (creatorPassed > opponentPassed) {
      winnerId = battle.creator;
      reason = 'time_expired_most_tests';
    } else if (opponentPassed > creatorPassed) {
      winnerId = battle.opponent;
      reason = 'time_expired_most_tests';
    } else {
      // Both equal
      reason = 'time_expired_draw';
    }

    battle.status = winnerId ? 'completed' : 'draw';
    battle.winner = winnerId;
    battle.endTime = new Date();
    battle.resultSummary = {
      reason,
      creatorPointsAwarded: winnerId ? (winnerId.toString() === battle.creator.toString() ? 75 : -20) : 25,
      opponentPointsAwarded: winnerId ? (winnerId.toString() === battle.opponent.toString() ? 75 : -20) : 25
    };

    await battle.save();
    await finalizeBattleStats(battle);

    const roomName = `room_${roomCode}`;
    const populated = await Battle.findById(battle._id)
      .populate('creator', 'name username avatar rating')
      .populate('opponent', 'name username avatar rating')
      .populate('winner', 'name username avatar rating');

    namespace.to(roomName).emit('battle:ended', {
      winnerId,
      winnerUsername: populated.winner ? populated.winner.username : null,
      reason,
      battle: populated
    });
  } catch (err) {
    console.error('[handleTimeExpired error]', err);
  }
};

/**
 * Update user battle statistics, ratings, and award badges
 */
const finalizeBattleStats = async (battle) => {
  try {
    const creator = await User.findById(battle.creator);
    const opponent = await User.findById(battle.opponent);
    if (!creator || !opponent) return;

    creator.battleStats.totalBattles += 1;
    opponent.battleStats.totalBattles += 1;

    if (battle.winner) {
      const isCreatorWinner = battle.winner.toString() === creator._id.toString();
      if (isCreatorWinner) {
        creator.battleStats.wins += 1;
        creator.rating += 100;
        opponent.battleStats.losses += 1;
        opponent.rating = Math.max(800, opponent.rating - 25);
      } else {
        opponent.battleStats.wins += 1;
        opponent.rating += 100;
        creator.battleStats.losses += 1;
        creator.rating = Math.max(800, creator.rating - 25);
      }
    } else {
      creator.battleStats.draws += 1;
      opponent.battleStats.draws += 1;
      creator.rating += 25;
      opponent.rating += 25;
    }

    // Recalculate win rates
    creator.battleStats.winRate = Math.round((creator.battleStats.wins / creator.battleStats.totalBattles) * 100);
    opponent.battleStats.winRate = Math.round((opponent.battleStats.wins / opponent.battleStats.totalBattles) * 100);

    await checkAndAwardBadges(creator);
    await checkAndAwardBadges(opponent);

    await creator.save();
    await opponent.save();
  } catch (err) {
    console.error('[finalizeBattleStats error]', err);
  }
};

