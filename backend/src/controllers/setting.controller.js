const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype'];

function isInvalidKey(key) {
  if (!key || typeof key !== 'string') return true;
  return FORBIDDEN_KEYS.includes(key.trim().toLowerCase());
}

/**
 * Lấy tất cả các cấu hình của trang web
 */
async function getAllSettings(req, res, next) {
  try {
    const list = await Setting.find();
    const settingsMap = {};
    for (const item of list) {
      if (item && item.key && !isInvalidKey(item.key)) {
        settingsMap[item.key] = item.value;
      }
    }
    return sendSuccess(res, settingsMap, 'Lấy danh sách cấu hình thành công.');
  } catch (err) {
    next(err);
  }
}

/**
 * Lấy giá trị cấu hình theo key (Ví dụ: banner_slides, intro_image)
 */
async function getSettingByKey(req, res, next) {
  try {
    const { key } = req.params;
    if (isInvalidKey(key)) {
      return sendError(res, 'Mã cấu hình không hợp lệ.', 400);
    }
    const setting = await Setting.findOne({ key: key.trim() });
    if (!setting) {
      return sendSuccess(res, null, 'Cấu hình chưa được thiết lập.');
    }
    return sendSuccess(res, setting.value, 'Lấy cấu hình thành công.');
  } catch (err) {
    next(err);
  }
}

/**
 * [Admin] Tạo hoặc cập nhật cấu hình theo key
 */
async function updateSettingByKey(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (isInvalidKey(key)) {
      return sendError(res, 'Mã cấu hình không hợp lệ.', 400);
    }

    if (value === undefined) {
      return sendError(res, 'Vui lòng cung cấp giá trị cấu hình (field "value")', 400);
    }

    const cleanKey = key.trim();
    const setting = await Setting.findOneAndUpdate(
      { key: cleanKey },
      { value, updatedBy: req.user?._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, setting, 'Cập nhật cấu hình thành công!');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllSettings,
  getSettingByKey,
  updateSettingByKey,
};
