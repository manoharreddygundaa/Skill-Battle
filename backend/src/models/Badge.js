import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'Award' // Lucide icon name
  },
  category: {
    type: String,
    enum: ['problems', 'streaks', 'battles', 'special'],
    default: 'problems'
  },
  criteriaType: {
    type: String,
    enum: ['solved_count', 'streak_days', 'battle_wins', 'daily_challenge_count'],
    required: true
  },
  criteriaThreshold: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export const Badge = mongoose.model('Badge', badgeSchema);

