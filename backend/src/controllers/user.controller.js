const User = require('../models/user.model');
const Post = require('../models/post.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Người dùng tự cập nhật thông tin cá nhân của mình
 */
async function updateMyProfile(req, res, next) {
  try {
    const user = req.user;
    const { name, birthYear, avatar, location, bio, password } = req.body;

    if (name) user.name = name.trim();
    if (birthYear !== undefined) user.birthYear = birthYear ? Number(birthYear) : null;
    if (avatar) user.avatar = avatar;
    if (location !== undefined) user.location = location.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (password) user.password = password; // Sẽ tự động băm qua pre('save')

    await user.save();

    // Đồng bộ tên và avatar mới sang tất cả bài đăng cũ của user này
    if (name || avatar) {
      const updateData = {};
      if (name) updateData.authorName = user.name;
      if (avatar) updateData.authorAvatar = user.avatar;
      await Post.updateMany({ author: user._id }, { $set: updateData });
    }

    return sendSuccess(res, user, 'Cập nhật thông tin cá nhân thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Public: Lấy danh sách thành viên Lục Gia Đường cho trang Giới thiệu
 */
async function getPublicMembers(req, res, next) {
  try {
    const members = await User.find({}, 'name username role birthYear avatar location bio createdAt')
      .sort({ role: 1, createdAt: 1 });
    return sendSuccess(res, members, 'Lấy danh sách thành viên thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Tạo một tài khoản người dùng mới
 */
async function createUserByAdmin(req, res, next) {
  try {
    const { name, username, password, role, birthYear, location, bio, avatar } = req.body;

    if (!name || !username || !password) {
      return sendError(res, 'Vui lòng cung cấp Họ tên, Tên đăng nhập và Mật khẩu.', 400);
    }

    const cleanUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return sendError(res, `Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác.`, 400);
    }

    const newUser = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password: password,
      role: role && ['user', 'admin'].includes(role) ? role : 'user',
      birthYear: birthYear ? Number(birthYear) : null,
      location: location ? location.trim() : '',
      bio: bio ? bio.trim() : '',
      avatar: avatar || undefined,
    });

    return sendSuccess(res, newUser, `Tạo tài khoản thành viên "${newUser.name}" thành công!`, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Lấy danh sách tất cả người dùng trong hệ thống
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Lấy danh sách thành viên thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Cập nhật BẤT KỲ thông tin nào của BẤT KỲ người dùng nào
 */
async function updateUserByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { name, username, role, birthYear, avatar, location, bio, password } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return sendError(res, 'Không tìm thấy người dùng cần sửa.', 404);
    }

    if (username && username.toLowerCase().trim() !== targetUser.username) {
      const exists = await User.findOne({ username: username.toLowerCase().trim() });
      if (exists) {
        return sendError(res, 'Tên đăng nhập này đã được sử dụng bởi người khác.', 400);
      }
      targetUser.username = username.toLowerCase().trim();
    }

    if (name) targetUser.name = name.trim();
    if (role && ['user', 'admin'].includes(role)) targetUser.role = role;
    if (birthYear !== undefined) targetUser.birthYear = birthYear ? Number(birthYear) : null;
    if (avatar) targetUser.avatar = avatar;
    if (location !== undefined) targetUser.location = location.trim();
    if (bio !== undefined) targetUser.bio = bio.trim();
    if (password) targetUser.password = password; // Sẽ tự băm lại khi save

    await targetUser.save();

    // Đồng bộ lại tên/avatar trên các bài post
    if (name || avatar) {
      const updateData = {};
      if (name) updateData.authorName = targetUser.name;
      if (avatar) updateData.authorAvatar = targetUser.avatar;
      await Post.updateMany({ author: targetUser._id }, { $set: updateData });
    }

    return sendSuccess(res, targetUser, `Đã cập nhật thông tin người dùng ${targetUser.username} thành công.`);
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Xóa một tài khoản người dùng
 */
async function deleteUserByAdmin(req, res, next) {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return sendError(res, 'Admin không thể tự xóa chính tài khoản của mình.', 400);
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, 'Không tìm thấy người dùng cần xóa.', 404);
    }

    // Xóa tất cả các bài post của user này
    await Post.deleteMany({ author: id });

    return sendSuccess(res, deleted, 'Đã xóa tài khoản và dữ liệu liên quan thành công.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateMyProfile,
  getPublicMembers,
  createUserByAdmin,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};
