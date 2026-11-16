import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Badge } from '../models/Badge.js';
import { TokenBlacklist } from '../models/TokenBlacklist.js';
import { config } from '../config/env.js';
import { extractToken } from '../middleware/auth.js';

const getCookieOptions = () => ({
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  path: '/'
});

const generateToken = (id) => {
  return jwt.sign(
    {
      id,
      jti: crypto.randomUUID() // Unique JWT ID to prevent collisions on rapid re-authentication
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All registration fields are required.'
      });
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const cleanEmail = String(email).toLowerCase().trim();

    // Check existing email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username: cleanUsername });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    // Create user (student role is enforced)
    const user = await User.create({
      name: String(name).trim(),
      username: cleanUsername,
      email: cleanEmail,
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

    // Set HttpOnly Secure Cookie
    res.cookie('token', token, getCookieOptions());

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

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

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

    // Set HttpOnly Secure Cookie
    res.cookie('token', token, getCookieOptions());

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
 * @route   POST /api/auth/logout
 * @desc    Logout user & invalidate session token
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.token || extractToken(req);

    if (token && req.user) {
      // Invalidate token server-side via blacklist with automatic TTL expiry
      await TokenBlacklist.create({
        token,
        userId: req.user._id,
        expiresAt: req.tokenExp || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: 'logout'
      }).catch(() => {});
    }

    // Clear HttpOnly authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      path: '/'
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Session invalidated.'
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session not found.'
      });
    }

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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = String(name).trim().slice(0, 50);
    if (bio !== undefined) user.bio = String(bio).trim().slice(0, 200);
    if (avatar) {
      // Validate avatar url or seed to prevent javascript: or malformed URI injection
      const cleanAvatar = String(avatar).trim();
      if (/^https?:\/\//i.test(cleanAvatar)) {
        user.avatar = cleanAvatar;
      }
    }

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
