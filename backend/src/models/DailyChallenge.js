import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }
}, { _id: false });

const dailyChallengeSchema = new mongoose.Schema({
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true,
    unique: true,
    index: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  bonusPoints: {
    type: Number,
    default: 50
  },
  completions: [completionSchema]
}, {
  timestamps: true
});

export const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

