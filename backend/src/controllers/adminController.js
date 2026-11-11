import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { Battle } from '../models/Battle.js';
import { Submission } from '../models/Submission.js';
import { DailyChallenge } from '../models/DailyChallenge.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Get aggregate platform metrics
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProblems,
      totalBattles,
      totalSubmissions,
      activeBattlesCount,
      recentSubmissions,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Problem.countDocuments(),
      Battle.countDocuments(),
      Submission.countDocuments(),
      Battle.countDocuments({ status: 'in_progress' }),
      Submission.find()
        .populate('user', 'name username avatar')
        .populate('problem', 'title difficulty slug')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name username email avatar createdAt isSuspended')
        .lean()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProblems,
        totalBattles,
        totalSubmissions,
        activeBattlesCount
      },
      recentSubmissions,
      recentUsers
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get paginated user accounts
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const query = {};

    if (role && ['student', 'admin'].includes(role)) {
      query.role = role;
    }

    if (status === 'suspended') {
      query.isSuspended = true;
    } else if (status === 'active') {
      query.isSuspended = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { username: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name username email role avatar rating streak battleStats isSuspended createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
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
 * @route   PATCH /api/admin/users/:id/toggle-status
 * @desc    Suspend or reactivate user account
 * @access  Private (Admin)
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin' && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own admin account.'
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'reactivated'} successfully`,
      isSuspended: user.isSuspended
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/problems
 * @desc    Get all problems including hidden test cases for management
 * @access  Private (Admin)
 */
export const getAdminProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, difficulty } = req.query;
    const query = {};

    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Problem.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      problems,
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
 * @route   POST /api/admin/problems
 * @desc    Create a new coding problem
 * @access  Private (Admin)
 */
export const createProblem = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      sampleTestCases,
      hiddenTestCases,
      starterCode,
      functionName
    } = req.body;

    const generatedSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingSlug = await Problem.findOne({ slug: generatedSlug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'A problem with this slug or title already exists.'
      });
    }

    const problem = await Problem.create({
      title: title.trim(),
      slug: generatedSlug,
      description,
      difficulty,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      examples: examples || [],
      constraints: constraints || [],
      sampleTestCases: sampleTestCases || [],
      hiddenTestCases: hiddenTestCases || [],
      starterCode,
      functionName: functionName.trim(),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Problem created successfully!',
      problem
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/admin/problems/:id
 * @desc    Update an existing coding problem
 * @access  Private (Admin)
 */
export const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    const problem = await Problem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully!',
      problem
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/admin/problems/:id
 * @desc    Delete a problem
 * @access  Private (Admin)
 */
export const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/admin/daily-challenge
 * @desc    Assign problem to a specific daily challenge date
 * @access  Private (Admin)
 */
export const setDailyChallenge = async (req, res, next) => {
  try {
    const { date, problemId, bonusPoints = 50 } = req.body;

    if (!date || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Date and problemId are required'
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const challenge = await DailyChallenge.findOneAndUpdate(
      { date },
      { problem: problemId, bonusPoints },
      { upsert: true, new: true }
    ).populate('problem', 'title slug difficulty');

    res.status(200).json({
      success: true,
      message: `Daily challenge for ${date} set successfully!`,
      challenge
    });
  } catch (err) {
    next(err);
  }
};

