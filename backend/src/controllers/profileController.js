import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { Battle } from '../models/Battle.js';

/**
 * @route   GET /api/profile/:username
 * @desc    Get complete LeetCode-inspired profile data
 * @access  Public
 */
export const getStudentProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() })
      .populate('badges.badge')
      .populate('solvedProblems.problem', 'title slug difficulty');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // 1. Get total problem counts in database by difficulty
    const [totalProblems, totalEasy, totalMedium, totalHard] = await Promise.all([
      Problem.countDocuments({ isActive: true }),
      Problem.countDocuments({ difficulty: 'Easy', isActive: true }),
      Problem.countDocuments({ difficulty: 'Medium', isActive: true }),
      Problem.countDocuments({ difficulty: 'Hard', isActive: true })
    ]);

    // 2. Count solved by difficulty
    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;

    user.solvedProblems.forEach(sp => {
      if (sp.difficulty === 'Easy') solvedEasy++;
      else if (sp.difficulty === 'Medium') solvedMedium++;
      else if (sp.difficulty === 'Hard') solvedHard++;
    });

    const totalSolved = user.solvedProblems.length;

    // 3. Real MongoDB Submission Activity Heatmap (Last 365 Days)
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const submissionHeatmapRaw = await Submission.aggregate([
      {
        $match: {
          user: user._id,
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Convert to dictionary: { "2026-03-15": { count: 4, accepted: 2 } }
    const heatmapData = {};
    submissionHeatmapRaw.forEach(item => {
      heatmapData[item._id] = {
        count: item.count,
        acceptedCount: item.acceptedCount
      };
    });

    // 4. Recent Submissions
    const recentSubmissions = await Submission.find({ user: user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 5. Recent Battles
    const recentBattles = await Battle.find({
      $or: [{ creator: user._id }, { opponent: user._id }],
      status: { $in: ['completed', 'draw'] }
    })
      .populate('creator', 'name username avatar')
      .populate('opponent', 'name username avatar')
      .populate('winner', 'name username avatar')
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedBattles = recentBattles.map(b => {
      const isCreator = b.creator._id.toString() === user._id.toString();
      const opp = isCreator ? b.opponent : b.creator;
      let outcome = 'Draw';
      if (b.winner) {
        outcome = b.winner._id.toString() === user._id.toString() ? 'Victory' : 'Defeat';
      }

      return {
        id: b._id,
        roomCode: b.roomCode,
        problem: b.problem,
        opponent: opp,
        outcome,
        createdAt: b.createdAt
      };
    });

    // 6. Win rate calculation
    const totalBattles = user.battleStats?.totalBattles || 0;
    const wins = user.battleStats?.wins || 0;
    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        rating: user.rating,
        createdAt: user.createdAt,
        streak: user.streak,
        stats: {
          totalSolved,
          totalProblems,
          solvedEasy,
          totalEasy,
          solvedMedium,
          totalMedium,
          solvedHard,
          totalHard,
          acceptanceRate: totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0
        },
        battleStats: {
          ...user.battleStats,
          winRate
        },
        heatmap: heatmapData,
        badges: user.badges,
        recentSubmissions,
        recentBattles: formattedBattles
      }
    });
  } catch (err) {
    next(err);
  }
};

