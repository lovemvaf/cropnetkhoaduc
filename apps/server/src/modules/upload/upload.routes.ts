import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { BadRequestError } from '../../utils/errors';
import crypto from 'crypto';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Multer storage engine configuration with cryptographic file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${randomName}${ext}`);
  }
});

// File filter: accept verified images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new BadRequestError('Chỉ chấp nhận file hình ảnh có đuôi .jpg, .jpeg, .png, .webp!'));
  }
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new BadRequestError('Định dạng MIME không hợp lệ, chỉ chấp nhận ảnh JPEG, PNG, WEBP!'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// POST /api/upload - Protected by authMiddleware
router.post(
  '/', 
  authMiddleware, 
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'Dung lượng ảnh tối đa là 5MB' });
          }
          return res.status(400).json({ success: false, error: err.message });
        }
        return next(err);
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Không tìm thấy file tải lên' });
      }
      
      const appUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${appUrl}/uploads/${req.file.filename}`;
      
      return res.status(200).json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        uploaderId: req.user?.id
      });
    });
  }
);

export default router;
