/**
 * Chuẩn hóa format phản hồi API thành công
 */
function sendSuccess(res, data = null, message = 'Thành công', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
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
};
