const Booking = require('../models/booking.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Public: Khách hàng gửi form yêu cầu liên hệ / đặt lịch
 */
async function createBooking(req, res, next) {
  try {
    const { fullName, phone, serviceType, eventDate, location, note } = req.body;

    if (!fullName || !phone) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại liên hệ.', 400);
    }

    const newBooking = await Booking.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      serviceType: serviceType ? serviceType.trim() : 'Múa Lân Khai Trương',
      eventDate: eventDate ? eventDate.trim() : '',
      location: location ? location.trim() : '',
      note: note ? note.trim() : '',
      status: 'pending',
    });

    return sendSuccess(
      res,
      newBooking,
      'Gửi yêu cầu đặt lịch thành công! Trưởng đoàn sẽ liên hệ sớm nhất.',
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Lấy danh sách tất cả yêu cầu đặt lịch
 */
async function getAllBookings(req, res, next) {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return sendSuccess(res, bookings, 'Lấy danh sách yêu cầu đặt lịch thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Cập nhật trạng thái yêu cầu đặt lịch
 */
async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Trạng thái không hợp lệ.', 400);
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return sendError(res, 'Không tìm thấy yêu cầu đặt lịch.', 404);
    }

    return sendSuccess(res, updated, 'Đã cập nhật trạng thái yêu cầu.');
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Xóa yêu cầu đặt lịch
 */
async function deleteBooking(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return sendError(res, 'Không tìm thấy yêu cầu cần xóa.', 404);
    }

    return sendSuccess(res, deleted, 'Đã xóa yêu cầu đặt lịch thành công.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};
