const User = require('../models/user.model');
const config = require('../config/environment');
const { verifyTokenString } = require('../utils/security');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware xác thực JWT Token của người dùng
 */
async function verifyToken(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Vui lòng đăng nhập để thực hiện thao tác này.', 401);
    }

    const decoded = verifyTokenString(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'Tài khoản người dùng không tồn tại hoặc đã bị xóa.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 401);
    }
    return sendError(res, error.message || 'Xác thực thất bại.', 401);
  }
}

/**
 * Middleware kiểm tra quyền Quản trị viên (Admin)
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'Bạn không có quyền quản trị viên (Admin) để thực hiện thao tác này.', 403);
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
