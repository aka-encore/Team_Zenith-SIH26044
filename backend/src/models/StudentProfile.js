import mongoose from 'mongoose';

const CertificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  issuer: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String, // String to support formats like "MM/YYYY" or "YYYY"
    trim: true
  }
});

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  technologies: {
    type: [String],
    default: []
  },
  link: {
    type: String,
    trim: true
  }
});

const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One-to-one relationship between User and StudentProfile
  },
  academicInformation: {
    college: {
      type: String,
      default: '',
      trim: true
    },
    degree: {
      type: String,
      default: '',
      trim: true
    },
    branch: {
      type: String,
      default: '',
      trim: true
    },
    year: {
      type: Number,
      default: null
    },
    cgpa: {
      type: Number,
      default: null
    }
  },
  skills: {
    type: [String], // Technical skills
    default: []
  },
  softSkills: {
    type: [String],
    default: []
  },
  careerInterests: {
    type: [String],
    default: []
  },
  certifications: {
    type: [CertificationSchema],
    default: []
  },
  projects: {
    type: [ProjectSchema],
    default: []
  },
  achievements: {
    type: [String],
    default: []
  },
  resumeUrl: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true // Automatically create createdAt and updatedAt
});

export default mongoose.model('StudentProfile', StudentProfileSchema);
