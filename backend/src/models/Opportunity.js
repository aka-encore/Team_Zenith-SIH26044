import mongoose from 'mongoose';

export const RequiredSkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  importance: {
    type: String,
    enum: ['required', 'preferred'],
    default: 'required'
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'intermediate'
  },
  weight: {
    type: Number,
    default: 20
  }
}, { _id: false });

export const normalizeRequiredSkills = (skills) => {
  if (!skills) return [];
  const rawList = Array.isArray(skills)
    ? skills
    : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : [skills]);

  const total = rawList.length || 1;
  const defaultWeight = Math.max(5, Math.round(100 / total));

  return rawList.map(item => {
    if (typeof item === 'string') {
      return {
        name: item.trim(),
        importance: 'required',
        proficiency: 'intermediate',
        weight: defaultWeight
      };
    } else if (item && typeof item === 'object') {
      const profLower = (item.proficiency || 'intermediate').toLowerCase();
      const validProf = ['beginner', 'intermediate', 'advanced', 'expert'].includes(profLower)
        ? profLower
        : 'intermediate';
      const impLower = (item.importance || 'required').toLowerCase();
      const validImp = ['required', 'preferred'].includes(impLower) ? impLower : 'required';

      return {
        name: (item.name || '').trim(),
        importance: validImp,
        proficiency: validProf,
        weight: Number(item.weight) > 0 ? Number(item.weight) : defaultWeight
      };
    }
    return null;
  }).filter(s => s && s.name);
};

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
    type: [RequiredSkillSchema],
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

OpportunitySchema.pre('validate', function(next) {
  if (this.requiredSkills) {
    this.requiredSkills = normalizeRequiredSkills(this.requiredSkills);
  }
  next();
});

OpportunitySchema.index({ companyId: 1, status: 1 });
OpportunitySchema.index({ status: 1, type: 1, createdAt: -1 });
OpportunitySchema.index({ 'requiredSkills.name': 1 });

export default mongoose.model('Opportunity', OpportunitySchema);
