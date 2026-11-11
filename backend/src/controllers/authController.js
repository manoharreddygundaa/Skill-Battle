import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Badge } from '../models/Badge.js';
import { config } from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    // Check existing email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    // Create user (default student role)
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: 'student'
    });

    // Check for welcome badge
    const welcomeBadge = await Badge.findOne({ slug: 'welcome' });
    if (welcomeBadge) {
      user.badges.push({ badge: welcomeBadge._id });
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating,
        streak: user.streak,
        battleStats: user.battleStats
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating,
        streak: user.streak,
        battleStats: user.battleStats,
        solvedCount: user.solvedProblems?.length || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user session
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('badges.badge')
      .populate('solvedProblems.problem', 'title difficulty slug');

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        rating: user.rating,
        streak: user.streak,
        battleStats: user.battleStats,
        solvedProblems: user.solvedProblems,
        badges: user.badges,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile information
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar) user.avatar = avatar.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (err) {
    next(err);
  }
};

