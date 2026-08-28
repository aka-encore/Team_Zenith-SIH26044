import mongoose from 'mongoose';


const SkillItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    default: 'Frontend',
    trim: true
  },
  proficiency: {
    type: String,
    required: [true, 'Proficiency level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  }
}, {
  timestamps: true
});


const CertificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Certificate name is required'],
    trim: true
  },
  issuer: {
    type: String,
    required: [true, 'Issuing organization is required'],
    trim: true
  },
  issueDate: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: String,
    trim: true,
    default: ''
  },
  credentialId: {
    type: String,
    trim: true,
    default: ''
  },
  credentialUrl: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});


const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  technologies: {
    type: [String],
    default: []
  },
  githubUrl: {
    type: String,
    trim: true,
    default: ''
  },
  liveUrl: {
    type: String,
    trim: true,
    default: ''
  },
  link: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});


const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Personal Information
  phone: {
    type: String,
    default: '',
    trim: true
  },
  dateOfBirth: {
    type: String,
    default: '',
    trim: true
  },
  profilePhoto: {
    type: String,
    default: '',
    trim: true
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },

  // Academic Information
  academicInformation: {
    college: {
      type: String,
      default: '',
      trim: true
    },
    department: {
      type: String,
      default: '',
      trim: true
    },
    course: {
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
      type: String,
      default: '',
      trim: true
    },
    cgpa: {
      type: Number,
      default: null
    }
  },

  // Structured Skills with Category and Proficiency
  skillsList: {
    type: [SkillItemSchema],
    default: []
  },

  // Flat string array of skills (for backward compatibility)
  skills: {
    type: [String],
    default: []
  },
  softSkills: {
    type: [String],
    default: []
  },

  // Projects
  projects: {
    type: [ProjectSchema],
    default: []
  },

  // Certifications
  certifications: {
    type: [CertificationSchema],
    default: []
  },

  // Resume PDF Storage
  resumeUrl: {
    type: String,
    default: '',
    trim: true
  },
  resumeName: {
    type: String,
    default: '',
    trim: true
  },
  resumeUploadDate: {
    type: String,
    default: '',
    trim: true
  },
  resumeSize: {
    type: String,
    default: '',
    trim: true
  },

  // Social Links
  socialLinks: {
    github: {
      type: String,
      default: '',
      trim: true
    },
    linkedin: {
      type: String,
      default: '',
      trim: true
    },
    portfolio: {
      type: String,
      default: '',
      trim: true
    }
  },

  achievements: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

StudentProfileSchema.index({ skills: 1 });
StudentProfileSchema.index({ 'academicInformation.college': 1 });
StudentProfileSchema.index({ 'academicInformation.cgpa': -1 });
StudentProfileSchema.index({ overallScore: -1 });

export default mongoose.model('StudentProfile', StudentProfileSchema);
