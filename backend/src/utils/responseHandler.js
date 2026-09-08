/**
 * Tự động chuyển đổi các đường dẫn ảnh cũ localhost:5000 sang HTTPS Render URL
 */
function sanitizeUrls(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return obj.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000(\/uploads\/)/i, 'https://lgd-backend.onrender.com$2');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeUrls);
  }
  if (typeof obj === 'object') {
    // Handle Date, RegExp, ObjectId
    if (obj instanceof Date || obj instanceof RegExp || (obj._bsontype && obj._bsontype === 'ObjectID')) {
      return obj;
    }
    const target = typeof obj.toObject === 'function' ? obj.toObject() : { ...obj };
    for (const key of Object.keys(target)) {
      target[key] = sanitizeUrls(target[key]);
    }
    return target;
  }
  return obj;
}

/**
 * Chuẩn hóa format phản hồi API thành công
 */
function sendSuccess(res, data = null, message = 'Thành công', statusCode = 200) {
  const sanitizedData = data !== null ? sanitizeUrls(data) : null;
  return res.status(statusCode).json({
    success: true,
    message,
    data: sanitizedData,
  });
}

/**
 * Chuẩn hóa format phản hồi API lỗi
 */
function sendError(res, message = 'Đã có lỗi xảy ra', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sanitizeUrls,
};
