import express from 'express';
import multer from 'multer';
import path from 'path';
import { asyncHandler, createError } from '../middleware/errorHandler';
import type { ApiResponse } from '../types/index';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/upload - Upload image file
router.post('/', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  // Generate the URL for the uploaded file
  const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;

  const response: ApiResponse<{ url: string; filename: string }> = {
    success: true,
    data: {
      url: imageUrl,
      filename: req.file.filename
    },
    message: 'Image uploaded successfully'
  };

  res.json(response);
}));

export = router;