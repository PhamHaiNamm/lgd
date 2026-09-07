const Booking = require('../models/booking.model');
const Schedule = require('../models/schedule.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Helper: Kiểm tra xem ngày và giờ đã có lịch đặt hoặc lịch diễn chưa
 */
async function findBookingConflict(eventDate, eventTime, excludeBookingId = null) {
  if (!eventDate || !eventTime) return null;

  const cleanDate = eventDate.trim();
  const cleanTime = eventTime.trim();

  if (!cleanDate || !cleanTime) return null;

  // 1. Kiểm tra trong danh sách Đặt lịch của khách (loại trừ các đơn đã huỷ hoặc chính đơn đang cập nhật)
  const bookingQuery = {
    eventDate: cleanDate,
    eventTime: cleanTime,
    status: { $in: ['pending', 'contacted', 'confirmed'] },
  };
  if (excludeBookingId) {
    bookingQuery._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(bookingQuery);
  if (existingBooking) {
    return {
      type: 'booking',
      message: `Khung giờ ${cleanTime} ngày ${cleanDate} đã có khách hàng đặt lịch (${existingBooking.serviceType} tại ${existingBooking.location || 'địa điểm khách chọn'}).`,
      detail: existingBooking,
    };
  }

  // 2. Kiểm tra trong danh sách Lịch biểu diễn chính thức của đoàn
  const existingSchedule = await Schedule.findOne({
    date: cleanDate,
    time: cleanTime,
  });
  if (existingSchedule) {
    return {
      type: 'schedule',
      message: `Khung giờ ${cleanTime} ngày ${cleanDate} trùng với lịch biểu diễn của đoàn (${existingSchedule.description} tại ${existingSchedule.location}).`,
      detail: existingSchedule,
    };
  }

  return null;
}

/**
 * Public: Kiểm tra nhanh xem khung giờ có trống không (Real-time check)
 */
async function checkAvailability(req, res, next) {
  try {
    const { eventDate, eventTime } = req.query;

    if (!eventDate || !eventTime) {
      return sendSuccess(res, { available: true }, 'Vui lòng chọn đầy đủ ngày và giờ.');
    }

    const conflict = await findBookingConflict(eventDate, eventTime);

    if (conflict) {
      return sendSuccess(
        res,
        {
          available: false,
          conflictType: conflict.type,
          message: conflict.message,
        },
        'Khung giờ đã có người đặt hoặc trùng lịch.'
      );
    }

    return sendSuccess(
      res,
      {
        available: true,
        message: 'Khung giờ này còn trống, bạn có thể đặt lịch!',
      },
      'Khung giờ còn trống.'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Public: Khách hàng gửi form yêu cầu liên hệ / đặt lịch
 */
async function createBooking(req, res, next) {
  try {
    const { fullName, phone, serviceType, serviceTypes, eventDate, eventTime, location, note } = req.body;

    if (!fullName || !phone) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ Họ tên và Số điện thoại liên hệ.', 400);
    }

    // Xử lý danh sách dịch vụ (chuỗi hoặc mảng chọn nhiều)
    let selectedServices = 'Múa Lân Khai Trương';
    if (Array.isArray(serviceTypes) && serviceTypes.length > 0) {
      selectedServices = serviceTypes.join(' + ');
    } else if (Array.isArray(serviceType) && serviceType.length > 0) {
      selectedServices = serviceType.join(' + ');
    } else if (typeof serviceType === 'string' && serviceType.trim()) {
      selectedServices = serviceType.trim();
    }

    // Kiểm tra trùng giờ nếu có cung cấp ngày và giờ
    if (eventDate && eventTime) {
      const conflict = await findBookingConflict(eventDate, eventTime);
      if (conflict) {
        return sendError(
          res,
          `⚠️ ĐÃ TRÙNG LỊCH: ${conflict.message} Quý khách vui lòng chọn khung giờ khác hoặc liên hệ trực tiếp hotline để được hỗ trợ!`,
          409
        );
      }
    }

    const newBooking = await Booking.create({
      fullName: fullName.trim(),
      phone: phone.trim(),
      serviceType: selectedServices,
      eventDate: eventDate ? eventDate.trim() : '',
      eventTime: eventTime ? eventTime.trim() : '',
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
  checkAvailability,
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};
