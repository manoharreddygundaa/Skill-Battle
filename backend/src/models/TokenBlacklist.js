import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index: automatically deletes document when expiresAt is reached
    },
    reason: {
      type: String,
      default: 'logout'
    }
  },
  {
    timestamps: true
  }
);

export const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
