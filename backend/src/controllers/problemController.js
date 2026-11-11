import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { executeCode } from '../services/codeExecutionService.js';
import { updateUserStreak } from '../services/streakService.js';
import { checkAndAwardBadges } from '../services/badgeService.js';

/**
 * @route   GET /api/problems
 * @desc    Get paginated problem list with search and filters
 * @access  Public (Optional Auth for solved status)
 */
export const getProblems = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty,
      tag,
      search,
      status
    } = req.query;

    const query = { isActive: true };

    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by solved/attempted/unsolved if user is authenticated
    if (req.user && status) {
      const user = await User.findById(req.user._id);
      const solvedIds = user.solvedProblems.map(sp => sp.problem.toString());
      const attemptedIds = user.attemptedProblems.map(ap => ap.toString());

      if (status === 'solved') {
        query._id = { $in: solvedIds };
      } else if (status === 'attempted') {
        // Attempted but not yet solved
        const onlyAttempted = attemptedIds.filter(id => !solvedIds.includes(id));
        query._id = { $in: onlyAttempted };
      } else if (status === 'unsolved') {
        query._id = { $nin: [...solvedIds, ...attemptedIds] };
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Do NOT select hiddenTestCases in public listing
    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select('title slug difficulty tags acceptanceRate totalSubmissions createdAt')
        .sort({ difficulty: 1, title: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Problem.countDocuments(query)
    ]);

    // Attach user status if user is authenticated
    let userSolvedMap = {};
    let userAttemptedMap = {};
    if (req.user) {
      const user = await User.findById(req.user._id).select('solvedProblems attemptedProblems');
      if (user) {
        user.solvedProblems.forEach(sp => {
          userSolvedMap[sp.problem.toString()] = true;
        });
        user.attemptedProblems.forEach(ap => {
          userAttemptedMap[ap.toString()] = true;
        });
      }
    }

    const enhancedProblems = problems.map(p => {
      const idStr = p._id.toString();
      let userStatus = 'unsolved';
      if (userSolvedMap[idStr]) userStatus = 'solved';
      else if (userAttemptedMap[idStr]) userStatus = 'attempted';

      return {
        ...p,
        userStatus
      };
    });

    // Get all available tags for filter pills
    const allTags = await Problem.distinct('tags', { isActive: true });

    res.status(200).json({
      success: true,
      problems: enhancedProblems,
      tags: allTags,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/problems/:slug
 * @desc    Get detailed problem by slug (strips hiddenTestCases for students)
 * @access  Public (Optional Auth)
 */
export const getProblemBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    // Exclude hiddenTestCases
    const problem = await Problem.findOne({ slug: slug.toLowerCase(), isActive: true })
      .select('-hiddenTestCases')
      .lean();

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    let userStatus = 'unsolved';
    let recentSubmissions = [];

    if (req.user) {
      const user = await User.findById(req.user._id).select('solvedProblems attemptedProblems');
      if (user) {
        if (user.solvedProblems.some(sp => sp.problem.toString() === problem._id.toString())) {
          userStatus = 'solved';
        } else if (user.attemptedProblems.some(ap => ap.toString() === problem._id.toString())) {
          userStatus = 'attempted';
        }
      }

      recentSubmissions = await Submission.find({
        user: req.user._id,
        problem: problem._id
      })
        .select('language status testCasesPassed totalTestCases executionTime createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    }

    res.status(200).json({
      success: true,
      problem: {
        ...problem,
        userStatus,
        recentSubmissions
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/problems/:slug/run
 * @desc    Execute code against sample test cases without persisting submission
 * @access  Private
 */
export const runCode = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { code, language, customInput } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    const problem = await Problem.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    let testCasesToRun = problem.sampleTestCases;

    if (customInput && customInput.trim()) {
      testCasesToRun = [{
        input: customInput.trim(),
        output: '',
        explanation: 'Custom Testcase'
      }];
    }

    const executionResult = await executeCode({
      code,
      language,
      functionName: problem.functionName,
      testCases: testCasesToRun
    });

    res.status(200).json({
      success: true,
      result: executionResult
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/problems/:slug/submit
 * @desc    Evaluate code against all test cases (sample + hidden) & save submission
 * @access  Private
 */
export const submitCode = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    const problem = await Problem.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Combine sample and hidden test cases for final evaluation
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

    // Create Submission Record
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

    // Update Problem Statistics
    problem.totalSubmissions += 1;
    if (executionResult.passed) {
      problem.successfulSubmissions += 1;
    }
    problem.updateAcceptanceRate();
    await problem.save();

    // Update User Progress
    const user = await User.findById(req.user._id);
    let newlySolved = false;
    let awardedBadges = [];

    if (executionResult.passed) {
      const alreadySolved = user.solvedProblems.some(
        sp => sp.problem.toString() === problem._id.toString()
      );

      if (!alreadySolved) {
        newlySolved = true;
        user.solvedProblems.push({
          problem: problem._id,
          solvedAt: new Date(),
          difficulty: problem.difficulty
        });

        // Remove from attempted if present
        user.attemptedProblems = user.attemptedProblems.filter(
          ap => ap.toString() !== problem._id.toString()
        );

        // Update streak
        await updateUserStreak(user);

        // Check badges
        awardedBadges = await checkAndAwardBadges(user);
      }
    } else {
      const alreadySolved = user.solvedProblems.some(
        sp => sp.problem.toString() === problem._id.toString()
      );
      const alreadyAttempted = user.attemptedProblems.some(
        ap => ap.toString() === problem._id.toString()
      );
      if (!alreadySolved && !alreadyAttempted) {
        user.attemptedProblems.push(problem._id);
      }
    }

    await user.save();

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
        newlySolved,
        awardedBadges,
        createdAt: submission.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

