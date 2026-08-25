import mongoose from 'mongoose';

const OpportunitySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a position title'],
    trim: true
  },
  type: {
    type: String,
    enum: ['internship', 'job', 'fdp', 'research'],
    required: [true, 'Please specify the opportunity type (internship, job, fdp, or research)']
  },
  description: {
    type: String,
    required: [true, 'Please add an opportunity description'],
    trim: true
  },
  requiredSkills: {
    type: [String],
    required: [true, 'Please add at least one required skill'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'An opportunity must require at least one skill.'
    }
  },
  location: {
    type: String,
    default: 'Remote',
    trim: true
  },
  stipend: {
    type: String,
    default: 'Competitive',
    trim: true
  },
  duration: {
    type: String,
    default: '', // Optional for jobs, highly relevant for internships
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true
});

export default mongoose.model('Opportunity', OpportunitySchema);
