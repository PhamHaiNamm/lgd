const express = require('express');
const {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/booking.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public: Gửi form đặt lịch
router.post('/', createBooking);

// Admin: Quản lý danh sách đặt lịch
router.get('/', verifyToken, requireAdmin, getAllBookings);
router.patch('/:id/status', verifyToken, requireAdmin, updateBookingStatus);
router.delete('/:id', verifyToken, requireAdmin, deleteBooking);

module.exports = router;
