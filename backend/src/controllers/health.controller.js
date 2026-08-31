const { sendSuccess } = require('../utils/responseHandler');
const { getDBStatus } = require('../config/database');

/**
 * Kiểm tra tình trạng hoạt động của server và database
 */
function getHealthStatus(req, res) {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      provider: 'MongoDB Atlas',
      connectionStatus: getDBStatus(),
    },
  };

  return sendSuccess(res, healthData, 'Hệ thống đang hoạt động bình thường.');
}

module.exports = {
  getHealthStatus,
};
