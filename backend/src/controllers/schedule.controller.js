const Schedule = require('../models/schedule.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Lấy tất cả danh sách lịch biểu diễn
 */
async function getAllSchedules(req, res, next) {
  try {
    const schedules = await Schedule.find().sort({ date: 1, time: 1 });
    return sendSuccess(res, schedules, 'Lấy danh sách lịch biểu diễn thành công.');
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
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return sendError(res, 'Không tìm thấy lịch biểu diễn.', 404);
    }
    return sendSuccess(res, schedule, 'Lấy chi tiết lịch thành công.');
  } catch (error) {
    next(error);
  }
}

/**
 * [Admin] Tạo lịch biểu diễn mới
 */
async function createSchedule(req, res, next) {
  try {
    const { date, time, location, description, note } = req.body;

    if (!date || !location || !description) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ Ngày, Địa điểm và Mô tả chương trình.', 400);
    }

    const newSchedule = await Schedule.create({
      date: date.trim(),
      time: time ? time.trim() : '',
      location: location.trim(),
      description: description.trim(),
      note: note ? note.trim() : '',
      createdBy: req.user?._id,
    });

    return sendSuccess(res, newSchedule, 'Thêm lịch biểu diễn thành công!', 201);
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
    const { date, time, location, description, note } = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return sendError(res, 'Không tìm thấy lịch biểu diễn cần cập nhật.', 404);
    }

    if (date) schedule.date = date.trim();
    if (time !== undefined) schedule.time = time.trim();
    if (location) schedule.location = location.trim();
    if (description) schedule.description = description.trim();
    if (note !== undefined) schedule.note = note.trim();

    await schedule.save();

    return sendSuccess(res, schedule, 'Cập nhật lịch biểu diễn thành công!');
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

    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      return sendError(res, 'Không tìm thấy lịch biểu diễn cần xóa.', 404);
    }

    return sendSuccess(res, { deletedId: id }, 'Đã xóa lịch biểu diễn thành công.');
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
