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

// Bộ lọc định dạng file ảnh hợp lệ (hỗ trợ đầy đủ định dạng ảnh điện thoại bao gồm HEIC/HEIF)
const imageFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    /\.(jpe?g|png|webp|gif|svg|heic|heif|bmp|tiff)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận các file định dạng hình ảnh.'), false);
  }
};

const upload = multer
  ? multer({
      storage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    })
  : {
      single: () => (req, res, next) => next(),
      array: () => (req, res, next) => next(),
    };

module.exports = upload;
