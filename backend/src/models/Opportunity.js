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
  deadline: {
    type: Date,
    default: null
  },
  minCgpa: {
    type: Number,
    default: null
  },
  eligibleBranches: {
    type: [String],
    default: []
  },
  eligibleYears: {
    type: [String],
    default: []
  },
  isPlacementDrive: {
    type: Boolean,
    default: false
  },
  driveName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'approved', 'rejected', 'suspended'],
    default: 'open'
  }
}, {
  timestamps: true
});

OpportunitySchema.index({ companyId: 1, status: 1 });
OpportunitySchema.index({ status: 1, type: 1, createdAt: -1 });
OpportunitySchema.index({ requiredSkills: 1 });

export default mongoose.model('Opportunity', OpportunitySchema);
