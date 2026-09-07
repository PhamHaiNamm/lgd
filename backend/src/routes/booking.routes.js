const express = require('express');
const {
  checkAvailability,
  createBooking,
  getAllBookings,
  updateBookingStatus,
  approveBookingToSchedule,
  deleteBooking,
} = require('../controllers/booking.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public: Kiểm tra khung giờ trống
router.get('/check-availability', checkAvailability);

// Public: Gửi form đặt lịch
router.post('/', createBooking);

// Admin: Quản lý danh sách đặt lịch
router.get('/', verifyToken, requireAdmin, getAllBookings);
router.patch('/:id/status', verifyToken, requireAdmin, updateBookingStatus);
router.post('/:id/approve', verifyToken, requireAdmin, approveBookingToSchedule);
router.delete('/:id', verifyToken, requireAdmin, deleteBooking);

module.exports = router;
