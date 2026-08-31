const exampleService = require('../services/example.service');
const { sendSuccess } = require('../utils/responseHandler');

/**
 * Lấy thông tin chào mừng
 */
function getInfo(req, res) {
  const info = exampleService.getWelcomeMessage();
  return sendSuccess(res, info, 'Chào mừng bạn đến với API Backend');
}

module.exports = {
  getInfo,
};
