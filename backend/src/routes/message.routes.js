const express = require('express');
const upload = require('../middlewares/upload.middleware');
const {
  getGroupMessages,
  getGroupMembers,
  sendGroupMessage,
  deleteGroupMessage,
} = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Lấy danh sách tin nhắn nhóm chung (Yêu cầu đăng nhập)
router.get('/', verifyToken, getGroupMessages);

// Lấy danh sách tất cả thành viên trong nhóm
router.get('/members', verifyToken, getGroupMembers);

// Gửi tin nhắn vào nhóm chung (hỗ trợ kèm ảnh qua field 'image')
router.post(
  '/',
  verifyToken,
  upload ? upload.single('image') : (req, res, next) => next(),
  sendGroupMessage
);

// Xóa tin nhắn (Người gửi hoặc Admin)
router.delete('/:id', verifyToken, deleteGroupMessage);

module.exports = router;
