const config = require('../config/environment');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware bắt lỗi 404 cho các route không tồn tại
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Không tìm thấy đường dẫn - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Middleware xử lý tập trung mọi lỗi trong ứng dụng
 */
function globalErrorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Lỗi máy chủ nội bộ.';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  return sendError(
    res,
    message,
    statusCode,
    config.isProduction ? null : err.stack
  );
}

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
