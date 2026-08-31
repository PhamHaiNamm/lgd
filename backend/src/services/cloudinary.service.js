const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/environment');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Đảm bảo thư mục uploads tồn tại
if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Không thể tạo thư mục uploads:', err);
  }
}

let cloudinarySDK = null;
try {
  const cloudinaryModule = require('cloudinary');
  cloudinarySDK = cloudinaryModule.v2;
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    cloudinarySDK.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
  }
} catch (e) {
  cloudinarySDK = null;
}

/**
 * Lưu file buffer vào ổ cứng cục bộ (Local Storage Fallback)
 */
function saveLocalFile(fileBuffer, originalname = '') {
  const ext = path.extname(originalname) || '.jpg';
  const randomName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
  const filePath = path.join(UPLOADS_DIR, randomName);

  fs.writeFileSync(filePath, fileBuffer);

  const port = config.port || 5000;
  const baseUrl = `http://localhost:${port}`;
  const fileUrl = `${baseUrl}/uploads/${randomName}`;

  return {
    url: fileUrl,
    publicId: `local:${randomName}`,
    format: ext.replace('.', ''),
    bytes: fileBuffer.length,
    width: null,
    height: null,
  };
}

/**
 * Tải file buffer lên Cloudinary (với Fallback tự động sang lưu ổ đĩa cục bộ nếu Cloudinary lỗi)
 * @param {Buffer} fileBuffer - Buffer dữ liệu file
 * @param {Object} options - Cấu hình upload (folder, originalname, ...)
 * @returns {Promise<Object>}
 */
async function uploadToCloudinary(fileBuffer, options = {}) {
  const cloudName = config.cloudinary.cloudName;
  const apiKey = config.cloudinary.apiKey;
  const apiSecret = config.cloudinary.apiSecret;
  const folder = options.folder || 'luc_gia_duong';

  // Nếu cấu hình Cloudinary hợp lệ, thử upload lên Cloudinary
  if (cloudName && apiKey && apiSecret) {
    try {
      if (cloudinarySDK) {
        return await new Promise((resolve, reject) => {
          const uploadStream = cloudinarySDK.uploader.upload_stream(
            { folder, resource_type: 'auto', ...options },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
              });
            }
          );
          uploadStream.end(fileBuffer);
        });
      }
    } catch (cloudErr) {
      console.warn('⚠️ Cloudinary SDK upload lỗi, chuyển sang lưu trữ cục bộ:', cloudErr.message || cloudErr);
    }
  }

  // Fallback sang lưu cục bộ
  return saveLocalFile(fileBuffer, options.originalname);
}

/**
 * Xóa ảnh trên Cloudinary hoặc local disk
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;

  if (publicId.startsWith('local:')) {
    const filename = publicId.replace('local:', '');
    const localPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
        return { result: 'ok', local: true };
      } catch (e) {
        console.warn('Lỗi khi xóa file cục bộ:', e.message);
      }
    }
    return { result: 'not_found' };
  }

  if (cloudinarySDK && config.cloudinary.cloudName) {
    try {
      return await cloudinarySDK.uploader.destroy(publicId);
    } catch (err) {
      console.warn('Lỗi khi xóa ảnh trên Cloudinary:', err.message);
    }
  }

  return { result: 'ignored' };
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  saveLocalFile,
};
