const express = require('express');
const upload = require('../middlewares/upload.middleware');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} = require('../controllers/upload.controller');

const router = express.Router();

// Middleware kiểm tra multer đã sẵn sàng chưa
const checkUploadMiddleware = (handler) => (req, res, next) => {
  if (!upload) {
    return res.status(500).json({
      success: false,
      message: 'Chưa cài đặt thư viện "multer". Hãy chạy `npm install` tại thư mục backend.',
    });
  }
  return handler(req, res, next);
};

// Route upload 1 ảnh: POST /api/v1/upload/single (Yêu cầu đăng nhập)
router.post(
  '/single',
  verifyToken,
  checkUploadMiddleware(upload ? upload.single('image') : (req, res, next) => next()),
  uploadSingleImage
);

// Route upload nhiều ảnh: POST /api/v1/upload/multiple (Yêu cầu đăng nhập)
router.post(
  '/multiple',
  verifyToken,
  checkUploadMiddleware(upload ? upload.array('images', 10) : (req, res, next) => next()),
  uploadMultipleImages
);

// Route xóa ảnh: POST hoặc DELETE /api/v1/upload/delete (Chỉ dành cho Admin)
router.post('/delete', verifyToken, requireAdmin, deleteImage);
router.delete('/', verifyToken, requireAdmin, deleteImage);

module.exports = router;

