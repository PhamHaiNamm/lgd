const express = require('express');
const {
  updateMyProfile,
  getPublicMembers,
  createUserByAdmin,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require('../controllers/user.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public: Lấy danh sách thành viên Lục Gia Đường
router.get('/members', getPublicMembers);

// Người dùng tự đổi thông tin cá nhân
router.put('/profile', verifyToken, updateMyProfile);

// Admin quản trị người dùng (Tạo mới, Xem tất cả, Sửa, Xóa)
router.post('/', verifyToken, requireAdmin, createUserByAdmin);
router.get('/', verifyToken, requireAdmin, getAllUsers);
router.put('/:id', verifyToken, requireAdmin, updateUserByAdmin);
router.delete('/:id', verifyToken, requireAdmin, deleteUserByAdmin);

module.exports = router;
