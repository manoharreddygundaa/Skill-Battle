import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const solvedProblemSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  solvedAt: {
    type: Date,
    default: Date.now
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  }
}, { _id: false });

const userBadgeSchema = new mongoose.Schema({
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
    index: true
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${this.username || 'user'}`;
    }
  },
  bio: {
    type: String,
    default: 'Competitive programming enthusiast',
    maxlength: 200
  },
  rating: {
    type: Number,
    default: 1200
  },
  streak: {
    current: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null } // YYYY-MM-DD
  },
  solvedProblems: [solvedProblemSchema],
  attemptedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  battleStats: {
    totalBattles: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 }
  },
  badges: [userBadgeSchema],
  isSuspended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Password hash middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

