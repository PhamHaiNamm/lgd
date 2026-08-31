const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Controller upload 1 file ảnh
 */
async function uploadSingleImage(req, res, next) {
  try {
    if (!req.file) {
      return sendError(res, 'Vui lòng chọn 1 file ảnh (field name: "image")', 400);
    }

    const folder = req.body.folder || 'luc_gia_duong';
    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      originalname: req.file.originalname,
    });

    return sendSuccess(res, result, 'Tải ảnh lên thành công', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller upload nhiều file ảnh
 */
async function uploadMultipleImages(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'Vui lòng chọn ít nhất 1 file ảnh (field name: "images")', 400);
    }

    const folder = req.body.folder || 'luc_gia_duong';
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder,
        originalname: file.originalname,
      })
    );

    const results = await Promise.all(uploadPromises);

    return sendSuccess(res, results, `Tải thành công ${results.length} ảnh`, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller xóa ảnh
 */
async function deleteImage(req, res, next) {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return sendError(res, 'Thiếu thông tin publicId của ảnh cần xóa', 400);
    }

    const result = await deleteFromCloudinary(publicId);
    return sendSuccess(res, result, 'Xóa ảnh thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
};
