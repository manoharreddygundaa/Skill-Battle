import mongoose from 'mongoose';

const testCaseResultSchema = new mongoose.Schema({
  testCaseNumber: Number,
  passed: Boolean,
  input: String,
  expectedOutput: String,
  actualOutput: String,
  executionTime: Number,
  error: String
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python'],
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compile Error', 'Pending'],
    default: 'Pending',
    index: true
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  executionTime: {
    type: Number,
    default: 0 // in ms
  },
  memory: {
    type: Number,
    default: 0 // in KB
  },
  errorMessage: {
    type: String,
    default: null
  },
  testResults: [testCaseResultSchema],
  battle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    default: null
  },
  isDailyChallenge: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, status: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);

