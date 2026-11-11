import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    unique: true,
    maxlength: 120
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: [true, 'Difficulty is required'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  examples: [exampleSchema],
  constraints: [{
    type: String,
    trim: true
  }],
  sampleTestCases: [testCaseSchema],
  hiddenTestCases: {
    type: [testCaseSchema],
    required: true,
    validate: [val => val.length > 0, 'Problem must have at least one test case']
  },
  starterCode: {
    javascript: {
      type: String,
      required: true
    },
    python: {
      type: String,
      required: true
    }
  },
  functionName: {
    type: String,
    required: true,
    trim: true
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  successfulSubmissions: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update acceptance rate on save/update
problemSchema.methods.updateAcceptanceRate = function() {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = Math.round((this.successfulSubmissions / this.totalSubmissions) * 100);
  } else {
    this.acceptanceRate = 0;
  }
};

export const Problem = mongoose.model('Problem', problemSchema);

