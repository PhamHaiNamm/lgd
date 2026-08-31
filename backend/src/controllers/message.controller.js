const Message = require('../models/message.model');
const User = require('../models/user.model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinary.service');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Lấy toàn bộ lịch sử tin nhắn trong Nhóm Chat Chung
 */
async function getGroupMessages(req, res, next) {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    return sendSuccess(res, messages, 'Lấy danh sách tin nhắn nhóm thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy danh sách thành viên trong nhóm chat
 */
async function getGroupMembers(req, res, next) {
  try {
    const members = await User.find()
      .select('name username avatar role birthYear location')
      .sort({ role: 1, name: 1 });

    return sendSuccess(res, members, 'Lấy danh sách thành viên thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Gửi tin nhắn mới vào Nhóm Chat Chung (hỗ trợ kèm ảnh qua Cloudinary)
 */
async function sendGroupMessage(req, res, next) {
  try {
    const user = req.user;
    const { content } = req.body;
    let imageUrl = req.body.imageUrl || '';

    // Nếu người dùng upload file ảnh qua form-data
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'luc_gia_duong/group_chat',
      });
      imageUrl = uploadResult.url;
    }

    if (!content && !imageUrl) {
      return sendError(res, 'Nội dung tin nhắn hoặc hình ảnh không được để trống.', 400);
    }

    const message = await Message.create({
      sender: user._id,
      senderName: user.name || user.username,
      senderAvatar: user.avatar || '',
      senderRole: user.role || 'user',
      content: content ? content.trim() : '',
      imageUrl: imageUrl || '',
    });

    return sendSuccess(res, message, 'Gửi tin nhắn vào nhóm thành công.', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Xóa tin nhắn (Người gửi hoặc Admin có quyền xóa)
 */
async function deleteGroupMessage(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;

    const message = await Message.findById(id);
    if (!message) {
      return sendError(res, 'Không tìm thấy tin nhắn cần xóa.', 404);
    }

    const isAuthor = message.sender.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return sendError(res, 'Bạn không có quyền xóa tin nhắn này.', 403);
    }

    await Message.findByIdAndDelete(id);
    return sendSuccess(res, { deletedId: id }, 'Đã xóa tin nhắn thành công.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGroupMessages,
  getGroupMembers,
  sendGroupMessage,
  deleteGroupMessage,
};
