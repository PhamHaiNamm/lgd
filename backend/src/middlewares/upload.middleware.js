let multer = null;

try {
  multer = require('multer');
} catch (e) {
  try {
    multer = require('../../../web/node_modules/multer');
  } catch (err) {
    multer = null;
  }
}

// Cấu hình lưu trữ bộ nhớ RAM tạm thời
const storage = multer ? multer.memoryStorage() : null;

// Bộ lọc định dạng file ảnh hợp lệ
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các file ảnh định dạng JPEG, PNG, WEBP, GIF, SVG.'), false);
  }
};

const upload = multer
  ? multer({
      storage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
      },
    })
  : {
      single: () => (req, res, next) => next(),
      array: () => (req, res, next) => next(),
    };

module.exports = upload;
