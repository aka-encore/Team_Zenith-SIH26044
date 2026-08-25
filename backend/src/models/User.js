import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email address'
    ]
  },

  // Optional — not required for OAuth-only accounts
  passwordHash: {
    type: String,
    required: false,
    minlength: 6,
    select: false // By default, do not return password in queries
  },

  role: {
    type: String,
    enum: ['student', 'company', 'academician', 'institution', 'admin'],
    required: [true, 'Please specify a user role']
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },

  // OAuth provider identities (Google, LinkedIn, etc.)
  authProviders: [
    {
      provider: {
        type: String,
        enum: ['google', 'linkedin'],
        required: true
      },
      providerId: {
        type: String,
        required: true
      },
      _id: false
    }
  ],

  // Profile avatar URL (from OAuth provider or uploaded)
  avatarUrl: {
    type: String,
    default: null
  },

  // Whether the user's email has been verified
  emailVerified: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Encrypt password using bcrypt before saving user
UserSchema.pre('save', async function(next) {

  // Only hash if passwordHash is present AND has been modified (or is new)
  if (!this.passwordHash || !this.isModified('passwordHash')) {
    return next();
  }

  // Skip if already hashed (60-char bcrypt hash starts with $2b$)
  if (this.passwordHash.startsWith('$2b$') || this.passwordHash.startsWith('$2a$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};


// Post-save hook to auto-initialize student or company profiles
UserSchema.post('save', async function(doc) {

  if (doc.role === 'student') {
    try {
      const StudentProfile = mongoose.model('StudentProfile');
      const profileExists = await StudentProfile.findOne({ userId: doc._id });

      if (!profileExists) {
        await StudentProfile.create({ userId: doc._id });
        console.log(`Auto-created StudentProfile for user: ${doc._id}`);
      }
    } catch (error) {
      console.error('Error auto-creating student profile in post-save hook:', error.message);
    }


  } else if (doc.role === 'company') {
    try {
      const Company = mongoose.model('Company');
      const profileExists = await Company.findOne({ userId: doc._id });

      if (!profileExists) {
        await Company.create({ 
          userId: doc._id,
          companyName: doc.name // Use the user's name initially
        });
        console.log(`Auto-created Company Profile for user: ${doc._id}`);
      }
    } catch (error) {
      console.error('Error auto-creating company profile in post-save hook:', error.message);
    }
  }
});


export default mongoose.model('User', UserSchema);
