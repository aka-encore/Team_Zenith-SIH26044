import mongoose from 'mongoose';

const UserAnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  selectedOption: { type: Number, required: true },
  correctOption: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

const AssessmentResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  scorePercentage: {
    type: Number,
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  proficiencyEarned: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  userAnswers: {
    type: [UserAnswerSchema],
    default: []
  },
  timeTakenSeconds: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('AssessmentResult', AssessmentResultSchema);
