import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image and PDF files are allowed!'), false);
  }
};

// Upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Specific upload configurations
export const uploadAvatar = upload.single('avatar');
export const uploadIdentityDocs = upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'tourismLicense', maxCount: 1 },
  { name: 'trainingCertificate', maxCount: 1 },
  { name: 'policeVerification', maxCount: 1 },
  { name: 'governmentIdProof', maxCount: 1 }
]);
