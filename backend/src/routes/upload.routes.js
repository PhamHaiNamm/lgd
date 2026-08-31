const express = require('express');
const upload = require('../middlewares/upload.middleware');
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

// Route upload 1 ảnh: POST /api/v1/upload/single (Form-data key: image)
router.post('/single', checkUploadMiddleware(upload ? upload.single('image') : (req, res, next) => next()), uploadSingleImage);

// Route upload nhiều ảnh: POST /api/v1/upload/multiple (Form-data key: images, tối đa 10 ảnh)
router.post('/multiple', checkUploadMiddleware(upload ? upload.array('images', 10) : (req, res, next) => next()), uploadMultipleImages);

// Route xóa ảnh: POST hoặc DELETE /api/v1/upload/delete (JSON body: { publicId: "..." })
router.post('/delete', deleteImage);
router.delete('/', deleteImage);

module.exports = router;
