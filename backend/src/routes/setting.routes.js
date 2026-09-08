const express = require('express');
const router = express.Router();
const { getAllSettings, getSettingByKey, updateSettingByKey } = require('../controllers/setting.controller');
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware');

// Public routes (Ai cũng có thể xem để hiển thị giao diện)
router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);

// Admin routes (Chỉ Quản trị viên mới được phép lưu cập nhật)
router.put('/:key', verifyToken, requireAdmin, updateSettingByKey);
router.post('/:key', verifyToken, requireAdmin, updateSettingByKey);

module.exports = router;
