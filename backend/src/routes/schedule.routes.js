const express = require('express');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/schedule.controller');

const router = express.Router();

// Public: Lấy tất cả lịch biểu diễn
router.get('/', getAllSchedules);

// Public: Lấy chi tiết 1 lịch
router.get('/:id', getScheduleById);

// Admin: Thêm lịch mới
router.post('/', verifyToken, requireAdmin, createSchedule);

// Admin: Sửa lịch
router.put('/:id', verifyToken, requireAdmin, updateSchedule);

// Admin: Xóa lịch
router.delete('/:id', verifyToken, requireAdmin, deleteSchedule);

module.exports = router;
