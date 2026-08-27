import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Options array is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: 'A question must have at least 2 options.'
    }
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer option index is required'],
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
    required: [true, 'Difficulty level is required'],
    index: true
  },
  explanation: {
    type: String,
    default: '',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Question', QuestionSchema);
