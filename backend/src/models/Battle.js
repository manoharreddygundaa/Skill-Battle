import mongoose from 'mongoose';

const participantProgressSchema = new mongoose.Schema({
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  submittedAt: { type: Date, default: null },
  submissionTimeSeconds: { type: Number, default: null },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    default: null
  },
  status: {
    type: String,
    enum: ['coding', 'testing', 'submitted_partial', 'solved', 'forfeited'],
    default: 'coding'
  }
}, { _id: false });

const battleSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    default: null
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  duration: {
    type: Number, // in seconds (e.g. 600 for 10 minutes)
    required: true,
    default: 600
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'draw', 'abandoned'],
    default: 'waiting',
    index: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  creatorReady: {
    type: Boolean,
    default: false
  },
  opponentReady: {
    type: Boolean,
    default: false
  },
  creatorProgress: {
    type: participantProgressSchema,
    default: () => ({})
  },
  opponentProgress: {
    type: participantProgressSchema,
    default: () => ({})
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  resultSummary: {
    reason: { type: String, default: null },
    creatorPointsAwarded: { type: Number, default: 0 },
    opponentPointsAwarded: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

battleSchema.index({ creator: 1, createdAt: -1 });
battleSchema.index({ opponent: 1, createdAt: -1 });

export const Battle = mongoose.model('Battle', battleSchema);

