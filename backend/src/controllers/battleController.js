import { Battle } from '../models/Battle.js';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';

/**
 * Generate a clean uppercase alphanumeric room code (e.g. SB7G7A)
 */
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SB';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Resilient lookup helper to find battle by room code
 * Handles both SB7G7A, SB-7G7A, and SB 7G7A seamlessly
 */
export const findBattleByCode = async (rawCode) => {
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
 * @route   POST /api/battles/create
 * @desc    Create a new battle room
 * @access  Private
 */
export const createBattleRoom = async (req, res, next) => {
  try {
    const { difficulty = 'Easy', duration = 600 } = req.body;

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be Easy, Medium, or Hard'
      });
    }

    // Select a random problem of the chosen difficulty
    const problems = await Problem.find({ difficulty, isActive: true });
    if (problems.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active problems found for ${difficulty} difficulty`
      });
    }
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];

    let roomCode = generateRoomCode();
    // Ensure room code uniqueness
    let existing = await Battle.findOne({ roomCode });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await Battle.findOne({ roomCode });
    }

    const battle = await Battle.create({
      roomCode,
      creator: req.user._id,
      problem: randomProblem._id,
      difficulty,
      duration: parseInt(duration, 10) || 600,
      status: 'waiting',
      creatorReady: false,
      opponentReady: false
    });

    const populated = await Battle.findById(battle._id)
      .populate('creator', 'name username avatar rating')
      .populate('problem', 'title slug difficulty');

    res.status(201).json({
      success: true,
      message: 'Battle room created successfully!',
      battle: populated,
      roomCode: battle.roomCode
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/battles/:roomCode
 * @desc    Get battle room state & participants
 * @access  Private
 */
export const getBattleRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const rawMatch = await findBattleByCode(roomCode);
    if (!rawMatch) {
      return res.status(404).json({
        success: false,
        message: 'Battle room not found'
      });
    }

    const battle = await Battle.findById(rawMatch._id)
      .populate('creator', 'name username avatar rating')
      .populate('opponent', 'name username avatar rating')
      .populate('winner', 'name username avatar rating')
      .populate({
        path: 'problem',
        select: '-hiddenTestCases' // Do not leak hidden test cases!
      });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle room not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isCreator = battle.creator._id.toString() === userIdStr;
    const isOpponent = battle.opponent && battle.opponent._id.toString() === userIdStr;

    // Check if user is authorized to view this battle (creator, opponent, or if room is waiting for opponent)
    if (!isCreator && !isOpponent && battle.status !== 'waiting' && battle.status !== 'completed') {
      return res.status(403).json({
        success: false,
        message: 'This battle is in progress between two other participants.'
      });
    }

    res.status(200).json({
      success: true,
      battle,
      isCreator,
      isOpponent
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/battles/history/user
 * @desc    Get past battles for authenticated user
 * @access  Private
 */
export const getUserBattleHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { creator: req.user._id },
        { opponent: req.user._id }
      ],
      status: { $in: ['completed', 'draw'] }
    };

    const [battles, total] = await Promise.all([
      Battle.find(query)
        .populate('creator', 'name username avatar rating')
        .populate('opponent', 'name username avatar rating')
        .populate('winner', 'name username avatar rating')
        .populate('problem', 'title slug difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Battle.countDocuments(query)
    ]);

    // Format battles for easy UI display
    const formatted = battles.map(b => {
      // Determine if the logged-in user is the creator or opponent
      const isCreator = b.creator && b.creator._id.toString() === req.user._id.toString();
      // Identify opponent (the other participant)
      const opponentUser = isCreator ? b.opponent : b.creator;
      // Compute outcome specific to the requesting user
      let outcome = 'Draw';
      if (b.winner) {
        const winnerId = b.winner._id.toString();
        outcome = winnerId === req.user._id.toString() ? 'Victory' : 'Defeat';
      }
      // Return formatted battle record
      return {
        id: b._id,
        roomCode: b.roomCode,
        problem: b.problem,
        difficulty: b.difficulty,
        duration: b.duration,
        opponent: opponentUser,
        outcome,
        winner: b.winner,
        myProgress: isCreator ? b.creatorProgress : b.opponentProgress,
        opponentProgress: isCreator ? b.opponentProgress : b.creatorProgress,
        resultSummary: b.resultSummary,
        createdAt: b.createdAt
      };

    });

    res.status(200).json({
      success: true,
      battles: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/battles/leaderboard
 * @desc    Get top battle warriors
 * @access  Public
 */
export const getBattleLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await User.find({ isSuspended: false, 'battleStats.totalBattles': { $gt: 0 } })
      .select('name username avatar rating battleStats')
      .sort({ 'battleStats.wins': -1, rating: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      leaderboard: topUsers
    });
  } catch (err) {
    next(err);
  }
};

