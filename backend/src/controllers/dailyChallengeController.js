import { DailyChallenge } from '../models/DailyChallenge.js';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';
import { executeCode } from '../services/codeExecutionService.js';
import { updateUserStreak } from '../services/streakService.js';
import { checkAndAwardBadges } from '../services/badgeService.js';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
};

/**
 * @route   GET /api/daily-challenge/today
 * @desc    Get today's daily challenge problem
 * @access  Public (Optional Auth for completion status)
 */
export const getTodayChallenge = async (req, res, next) => {
  try {
    const todayStr = getTodayDateString();

    let dailyChallenge = await DailyChallenge.findOne({ date: todayStr })
      .populate({
        path: 'problem',
        select: '-hiddenTestCases'
      });

    // If today's challenge hasn't been set yet, automatically pick a problem deterministically!
    if (!dailyChallenge) {
      const activeProblems = await Problem.find({ isActive: true });
      if (activeProblems.length > 0) {
        // Hash the date to pick a consistent problem for this date
        let hash = 0;
        for (let i = 0; i < todayStr.length; i++) {
          hash = (hash << 5) - hash + todayStr.charCodeAt(i);
          hash |= 0;
        }
        const index = Math.abs(hash) % activeProblems.length;
        const selectedProblem = activeProblems[index];

        dailyChallenge = await DailyChallenge.create({
          date: todayStr,
          problem: selectedProblem._id,
          bonusPoints: 50
        });

        dailyChallenge = await DailyChallenge.findById(dailyChallenge._id)
          .populate({
            path: 'problem',
            select: '-hiddenTestCases'
          });
      }
    }

    if (!dailyChallenge) {
      return res.status(404).json({
        success: false,
        message: 'No daily challenge available for today'
      });
    }

    let isCompleted = false;
    let completedAt = null;

    if (req.user) {
      const userCompletion = dailyChallenge.completions.find(
        c => c.user.toString() === req.user._id.toString()
      );
      if (userCompletion) {
        isCompleted = true;
        completedAt = userCompletion.completedAt;
      }
    }

    res.status(200).json({
      success: true,
      dailyChallenge: {
        id: dailyChallenge._id,
        date: dailyChallenge.date,
        bonusPoints: dailyChallenge.bonusPoints,
        totalCompletions: dailyChallenge.completions.length,
        isCompleted,
        completedAt,
        problem: dailyChallenge.problem
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/daily-challenge/submit
 * @desc    Submit code solution for today's daily challenge
 * @access  Private
 */
export const submitDailyChallenge = async (req, res, next) => {
  try {
    const todayStr = getTodayDateString();
    const { code, language } = req.body;

    const dailyChallenge = await DailyChallenge.findOne({ date: todayStr });
    if (!dailyChallenge) {
      return res.status(404).json({
        success: false,
        message: 'Today daily challenge not found'
      });
    }

    const problem = await Problem.findById(dailyChallenge.problem);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Challenge problem not found'
      });
    }

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

    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      status: executionResult.status,
      testCasesPassed: executionResult.testCasesPassed,
      totalTestCases: executionResult.totalTestCases,
      executionTime: executionResult.executionTime,
      memory: executionResult.memory,
      isDailyChallenge: true,
      testResults: executionResult.results.map((r, idx) => ({
        testCaseNumber: idx + 1,
        passed: r.passed,
        input: idx < problem.sampleTestCases.length ? r.input : '[Hidden]',
        expectedOutput: idx < problem.sampleTestCases.length ? r.expectedOutput : '[Hidden]',
        actualOutput: idx < problem.sampleTestCases.length ? r.actualOutput : '[Hidden]',
        executionTime: r.executionTime,
        error: r.error
      }))
    });

    const user = await User.findById(req.user._id);
    let newlyCompletedChallenge = false;
    let awardedBadges = [];

    if (executionResult.passed) {
      // Check if already registered in daily challenge completions
      const alreadyDone = dailyChallenge.completions.some(
        c => c.user.toString() === user._id.toString()
      );

      if (!alreadyDone) {
        newlyCompletedChallenge = true;
        dailyChallenge.completions.push({
          user: user._id,
          completedAt: new Date(),
          submission: submission._id
        });
        await dailyChallenge.save();

        user.rating += dailyChallenge.bonusPoints;

        // Also add to solved problems if not already solved
        const alreadySolved = user.solvedProblems.some(
          sp => sp.problem.toString() === problem._id.toString()
        );
        if (!alreadySolved) {
          user.solvedProblems.push({
            problem: problem._id,
            solvedAt: new Date(),
            difficulty: problem.difficulty
          });
        }

        await updateUserStreak(user);
        awardedBadges = await checkAndAwardBadges(user);
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      submission: {
        id: submission._id,
        status: submission.status,
        testCasesPassed: submission.testCasesPassed,
        totalTestCases: submission.totalTestCases,
        executionTime: submission.executionTime,
        memory: submission.memory,
        testResults: submission.testResults,
        newlyCompletedChallenge,
        awardedBadges
      }
    });
  } catch (err) {
    next(err);
  }
};

