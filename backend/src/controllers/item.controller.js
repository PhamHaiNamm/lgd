const Item = require('../models/item.model');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Lấy danh sách tất cả items
 */
async function getAllItems(req, res, next) {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    return sendSuccess(res, items, 'Lấy danh sách dữ liệu thành công');
  } catch (error) {
    next(error);
  }
}

/**
 * Tạo mới một item
 */
async function createItem(req, res, next) {
  try {
    const { title, description, status } = req.body;
    if (!title) {
      return sendError(res, 'Tiêu đề (title) là bắt buộc', 400);
    }

    const newItem = await Item.create({
      title,
      description,
      status,
    });

    return sendSuccess(res, newItem, 'Tạo mới thành công', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Xóa một item theo ID
 */
async function deleteItem(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, 'Không tìm thấy item cần xóa', 404);
    }
    return sendSuccess(res, deleted, 'Xóa thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllItems,
  createItem,
  deleteItem,
};
