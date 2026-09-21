const express = require('express');
const { verifyToken, requireAdmin, optionalAuth } = require('../middlewares/auth.middleware');
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/schedule.controller');

const router = express.Router();

// Lấy tất cả lịch biểu diễn (hỗ trợ phân quyền ẩn dữ liệu tài chính/SĐT khách đối với khách chưa đăng nhập)
router.get('/', optionalAuth, getAllSchedules);

// Lấy chi tiết 1 lịch
router.get('/:id', optionalAuth, getScheduleById);

// Admin: Thêm lịch mới
router.post('/', verifyToken, requireAdmin, createSchedule);

// Admin: Sửa lịch
router.put('/:id', verifyToken, requireAdmin, updateSchedule);

// Admin: Xóa lịch
router.delete('/:id', verifyToken, requireAdmin, deleteSchedule);

module.exports = router;
