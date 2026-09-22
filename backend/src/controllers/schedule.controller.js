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

const Schedule = require('../models/schedule.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Helper: Lọc bỏ các thông tin nhạy cảm (tài chính, SĐT khách) tùy theo quyền người dùng
 */
function sanitizeSchedule(schedule, user) {
  if (!schedule) return schedule;
  const obj = typeof schedule.toObject === 'function' ? schedule.toObject() : { ...schedule };
  const isLoggedIn = !!user;
  const isAdmin = user && (user.role === 'admin' || user.username === 'hainam');

  if (!isLoggedIn) {
    // Khách chưa đăng nhập: Ẩn toàn bộ thông tin giá tiền, cọc, thanh toán và SĐT khách
    delete obj.totalPrice;
    delete obj.deposit;
    delete obj.isPaid;
    delete obj.phone;
    delete obj.createdBy;
  } else if (!isAdmin) {
    // Thành viên đã đăng nhập nhưng không phải admin: Được xem giá tiền để biết lịch đoàn nhưng ẩn SĐT liên hệ của khách
    delete obj.phone;
  }
  return obj;
}

/**
 * Lấy tất cả danh sách lịch biểu diễn
 */
async function getAllSchedules(req, res, next) {
  try {
    const schedules = await Schedule.find().sort({ date: 1, time: 1 });
    const sanitized = schedules.map((s) => sanitizeSchedule(s, req.user));
    return sendSuccess(res, sanitized, 'Lấy danh sách lịch biểu diễn thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * Lấy chi tiết 1 lịch biểu diễn
 */
async function getScheduleById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || id === '[object Object]' || String(id).trim() === '') {
      return sendError(res, 'Mã định danh lịch không hợp lệ.', 400);
    }

    const cleanId = String(id).trim();
    let schedule = null;
    if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      schedule = await Schedule.findById(cleanId);
    }

    if (!schedule) {
      return sendError(res, 'Không tìm thấy lịch biểu diễn.', 404);
    }
    return sendSuccess(res, sanitizeSchedule(schedule, req.user), 'Lấy chi tiết lịch thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Tạo lịch biểu diễn mới
 */
async function createSchedule(req, res, next) {
  try {
    const { date, time, location, description, note, phone, coordinates, mapUrl, totalPrice, deposit, isPaid } = req.body;

    if (!date || !location || !description) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ Ngày, Địa điểm và Mô tả chương trình.', 400);
    }

    const newSchedule = await Schedule.create({
      date: date.trim(),
      time: time ? time.trim() : '',
      location: location.trim(),
      description: description.trim(),
      note: note ? note.trim() : '',
      phone: phone ? phone.trim() : '',
      coordinates: coordinates ? coordinates.trim() : '',
      mapUrl: mapUrl ? mapUrl.trim() : '',
      totalPrice: totalPrice !== undefined ? Math.max(0, Number(totalPrice) || 0) : 0,
      deposit: deposit !== undefined ? Math.max(0, Number(deposit) || 0) : 0,
      isPaid: Boolean(isPaid),
      createdBy: req.user?._id,
    });

    return sendSuccess(res, sanitizeSchedule(newSchedule, req.user), 'Thêm lịch biểu diễn thành công!', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Cập nhật lịch biểu diễn
 */
async function updateSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const { date, time, location, description, note, phone, coordinates, mapUrl, totalPrice, deposit, isPaid } = req.body;

    if (!id || id === '[object Object]' || String(id).trim() === '') {
      return sendError(res, 'Mã định danh lịch không hợp lệ.', 400);
    }

    const cleanId = String(id).trim();
    let schedule = null;
    if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      schedule = await Schedule.findById(cleanId);
    }

    if (!schedule) {
      return sendError(res, 'Không tìm thấy lịch biểu diễn cần cập nhật.', 404);
    }

    const updateFields = {};
    if (date) updateFields.date = date.trim();
    if (time !== undefined) updateFields.time = time.trim();
    if (location) updateFields.location = location.trim();
    if (description) updateFields.description = description.trim();
    if (note !== undefined) updateFields.note = note.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (coordinates !== undefined) updateFields.coordinates = coordinates.trim();
    if (mapUrl !== undefined) updateFields.mapUrl = mapUrl.trim();
    if (totalPrice !== undefined) updateFields.totalPrice = Math.max(0, Number(totalPrice) || 0);
    if (deposit !== undefined) updateFields.deposit = Math.max(0, Number(deposit) || 0);
    if (isPaid !== undefined) updateFields.isPaid = Boolean(isPaid);

    await Schedule.updateOne({ _id: schedule._id }, { $set: updateFields });

    const updatedSchedule = await Schedule.findById(schedule._id);

    return sendSuccess(res, sanitizeSchedule(updatedSchedule || schedule, req.user), 'Cập nhật lịch biểu diễn thành công!');
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Xóa lịch biểu diễn
 */
async function deleteSchedule(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || id === '[object Object]' || String(id).trim() === '') {
      return sendError(res, 'Mã định danh lịch không hợp lệ.', 400);
    }

    const cleanId = String(id).trim();
    let schedule = null;
    if (mongoose.Types.ObjectId.isValid(cleanId) && cleanId.length === 24) {
      schedule = await Schedule.findById(cleanId);
    }

    if (!schedule) {
      return sendError(res, 'Không tìm thấy lịch biểu diễn cần xóa.', 404);
    }

    await Schedule.deleteOne({ _id: schedule._id });

    return sendSuccess(res, { deletedId: schedule._id }, 'Đã xóa lịch biểu diễn thành công.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
