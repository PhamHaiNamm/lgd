let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  try {
    mongoose = require('../../../web/node_modules/mongoose');
  } catch (err) {
    mongoose = require('mongoose');
  }
}

const User = require('../models/user.model');
const Post = require('../models/post.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { hashPassword } = require('../utils/security');

/**
 * Người dùng tự cập nhật thông tin cá nhân của mình
 */
async function updateMyProfile(req, res, next) {
  try {
    const user = req.user;
    const { name, birthYear, avatar, location, bio, password, nameFrame, phone } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (birthYear !== undefined) updateFields.birthYear = birthYear ? Number(birthYear) : null;
    if (avatar) updateFields.avatar = avatar;
    if (location !== undefined) updateFields.location = location.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (phone !== undefined) updateFields.phone = phone ? phone.trim() : '';
    if (password && password.trim()) updateFields.password = hashPassword(password.trim());

    if (nameFrame !== undefined) {
      const isLeader = user.role === 'admin' || user.username === 'hainam' || (user.name && user.name.toLowerCase().includes('hải nam'));
      if (nameFrame === 'frame_spider' && !isLeader) {
        return sendError(res, 'Khung Nhện Tím là khung độc quyền chỉ dành riêng cho Trưởng đoàn!', 403);
      }
      if (nameFrame === 'frame_hoan_luon' && user.username !== 'tranthanhhai') {
        return sendError(res, 'Khung Hoàn Lươn là khung độc quyền chỉ dành riêng cho Trần Thanh Hải!', 403);
      }
      // Ngăn lưu giá trị "undefined" dạng string
      const safeFrame = (nameFrame && nameFrame !== 'undefined') ? nameFrame.trim() : '';
      updateFields.nameFrame = safeFrame;
    }

    await User.updateOne({ _id: user._id }, { $set: updateFields });

    const updatedUser = await User.findById(user._id);

    // Đồng bộ tên và avatar mới sang tất cả bài đăng cũ của user này
    if (name || avatar) {
      const updateData = {};
      if (name) updateData.authorName = (name || user.name).trim();
      if (avatar) updateData.authorAvatar = avatar || user.avatar;
      await Post.updateMany({ author: user._id }, { $set: updateData });
    }

    return sendSuccess(res, updatedUser || user, 'Cập nhật thông tin cá nhân thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Public: Lấy danh sách thành viên Lục Gia Đường cho trang Giới thiệu
 */
async function getPublicMembers(req, res, next) {
  try {
    const members = await User.find({}, '_id name username role birthYear avatar location bio nameFrame phone createdAt')
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
    const { name, username, password, role, birthYear, location, bio, avatar, nameFrame, phone } = req.body;

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
      nameFrame: nameFrame ? nameFrame.trim() : '',
      phone: phone ? phone.trim() : '',
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
    const { name, username, role, birthYear, avatar, location, bio, password, nameFrame, phone } = req.body;

    if (!id || id === '[object Object]' || String(id).trim() === '') {
      return sendError(res, 'Mã định danh người dùng (ID) không hợp lệ.', 400);
    }

    let targetUser = null;
    const cleanId = String(id).trim();

    // 1. Tìm theo ObjectId nếu hợp lệ
    if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      try {
        targetUser = await User.findById(cleanId);
      } catch (e) {}
    }

    // 2. Tìm theo username hoặc _id
    if (!targetUser) {
      const cleanUsername = cleanId.replace(/^u_/, '').toLowerCase().trim();
      targetUser = await User.findOne({
        $or: [
          { username: cleanUsername },
          { _id: cleanId }
        ]
      });
    }

    // 3. Tìm theo username hoặc name nếu vẫn chưa thấy
    if (!targetUser) {
      const cleanUsername = cleanId.replace(/^u_/, '').toLowerCase().trim();
      targetUser = await User.findOne({
        $or: [
          { username: cleanUsername },
          { name: name ? name.trim() : cleanId }
        ]
      });
    }

    if (!targetUser) {
      return sendError(res, 'Không tìm thấy người dùng cần sửa.', 404);
    }

    if (username && username.toLowerCase().trim() !== targetUser.username) {
      const exists = await User.findOne({ username: username.toLowerCase().trim() });
      if (exists && exists._id.toString() !== targetUser._id.toString()) {
        return sendError(res, 'Tên đăng nhập này đã được sử dụng bởi người khác.', 400);
      }
      targetUser.username = username.toLowerCase().trim();
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (username) updateFields.username = username.toLowerCase().trim();
    if (role && ['user', 'admin'].includes(role)) updateFields.role = role;
    if (birthYear !== undefined) updateFields.birthYear = birthYear ? Number(birthYear) : null;
    if (avatar) updateFields.avatar = avatar;
    if (location !== undefined) updateFields.location = location.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (phone !== undefined) updateFields.phone = phone ? phone.trim() : '';
    if (password && password.trim()) updateFields.password = hashPassword(password.trim());

    if (nameFrame !== undefined) {
      const isLeader = targetUser.role === 'admin' || targetUser.username === 'hainam' || (targetUser.name && targetUser.name.toLowerCase().includes('hải nam'));
      if (nameFrame === 'frame_spider' && !isLeader && req.user.role !== 'admin') {
        return sendError(res, 'Khung Nhện Tím là khung độc quyền chỉ dành riêng cho Trưởng đoàn!', 403);
      }
      if (nameFrame === 'frame_hoan_luon' && targetUser.username !== 'tranthanhhai') {
        return sendError(res, 'Khung Hoàn Lươn là khung độc quyền chỉ dành riêng cho Trần Thanh Hải!', 403);
      }
      // Ngăn lưu giá trị "undefined" dạng string
      const safeFrame = (nameFrame && nameFrame !== 'undefined') ? nameFrame.trim() : '';
      updateFields.nameFrame = safeFrame;
    }

    await User.updateOne({ _id: targetUser._id }, { $set: updateFields });

    const resultUser = await User.findById(targetUser._id);

    // Đồng bộ lại tên/avatar trên các bài post
    if (name || avatar) {
      const updateData = {};
      if (name) updateData.authorName = (name || targetUser.name).trim();
      if (avatar) updateData.authorAvatar = avatar || targetUser.avatar;
      await Post.updateMany({ author: targetUser._id }, { $set: updateData });
    }

    return sendSuccess(res, resultUser || targetUser, `Đã cập nhật thông tin người dùng ${targetUser.username} thành công.`);
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

    if (!id || id === '[object Object]' || String(id).trim() === '') {
      return sendError(res, 'Mã định danh người dùng (ID) không hợp lệ.', 400);
    }

    let targetUser = null;
    const cleanId = String(id).trim();

    // 1. Tìm theo ObjectId
    if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      targetUser = await User.findById(cleanId);
    }

    // 2. Tìm theo username
    if (!targetUser) {
      const cleanUsername = cleanId.replace(/^u_/, '').toLowerCase().trim();
      targetUser = await User.findOne({ username: cleanUsername });
    }

    if (!targetUser) {
      return sendError(res, 'Không tìm thấy người dùng cần xóa.', 404);
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Admin không thể tự xóa chính tài khoản của mình.', 400);
    }

    const targetUserId = targetUser._id;
    await User.findByIdAndDelete(targetUserId);

    // Xóa tất cả các bài post của user này
    await Post.deleteMany({ author: targetUserId });

    return sendSuccess(res, null, `Đã xóa tài khoản "${targetUser.name}" và dữ liệu liên quan thành công.`);
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
