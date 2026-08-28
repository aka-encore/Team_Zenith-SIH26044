import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const profileUploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

const resumeUploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(resumeUploadDir)) {
  fs.mkdirSync(resumeUploadDir, { recursive: true });
}

// Profile Photo Storage Configuration
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || req.user?._id || 'user';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanFileName = `profile-${userId}-${Date.now()}${ext}`;
    cb(null, cleanFileName);
  }
});

// Profile Photo Filter: accept only image formats
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimeMatch = allowedTypes.test(file.mimetype.toLowerCase());
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeMatch && extMatch) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'));
};

export const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: imageFilter
});


// Resume PDF Storage Configuration
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeUploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || req.user?._id || 'user';
    const cleanFileName = `resume-${userId}-${Date.now()}.pdf`;
    cb(null, cleanFileName);
  }
});

// Resume PDF Filter: accept ONLY PDF
const pdfFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime || isPdfExt) {
    return cb(null, true);
  }
  cb(new Error('Only PDF documents (.pdf) are allowed for resume upload.'));
};

export const uploadResumePDF = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: pdfFilter
});
