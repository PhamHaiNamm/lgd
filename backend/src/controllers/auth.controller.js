const User = require('../models/user.model');
const config = require('../config/environment');
const { signToken } = require('../utils/security');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Đăng ký tài khoản mới
 */
async function register(req, res, next) {
  try {
    const { name, username, password, birthYear, location, bio, avatar } = req.body;

    if (!name || !username || !password) {
      return sendError(res, 'Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.', 400);
    }

    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length < 3) {
      return sendError(res, 'Tên đăng nhập phải có ít nhất 3 ký tự.', 400);
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return sendError(res, 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.', 400);
    }

    const userCount = await User.countDocuments();
    // Chỉ tài khoản đầu tiên tạo trong hệ thống mới được mặc định làm admin
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password,
      role,
      birthYear: birthYear ? Number(birthYear) : undefined,
      location: location ? location.trim() : '',
      bio: bio ? bio.trim() : '',
      avatar: avatar || undefined,
    });

    const token = signToken({ id: user._id, role: user.role }, config.jwtSecret, 7);

    return sendSuccess(
      res,
      {
        user,
        token,
      },
      'Đăng ký tài khoản thành công.',
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Đăng nhập
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 'Vui lòng nhập tên đăng nhập và mật khẩu.', 400);
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername }).select('+password');
    if (!user) {
      return sendError(res, 'Tên đăng nhập hoặc mật khẩu không chính xác.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Tên đăng nhập hoặc mật khẩu không chính xác.', 401);
    }

    const token = signToken({ id: user._id, role: user.role }, config.jwtSecret, 7);

    return sendSuccess(
      res,
      {
        user,
        token,
      },
      'Đăng nhập thành công.'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy thông tin user hiện tại
 */
async function getMe(req, res, next) {
  try {
    return sendSuccess(res, req.user, 'Lấy thông tin người dùng thành công.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
