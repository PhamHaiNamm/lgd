let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  try {
    mongoose = require('../../web/node_modules/mongoose');
  } catch (err) {
    mongoose = null;
  }
}

const config = require('./environment');

/**
 * Kết nối đến cơ sở dữ liệu MongoDB Atlas
 */
async function connectDB() {
  if (!config.mongoUri) {
    console.warn('⚠️  Cảnh báo: MONGODB_URI chưa được thiết lập trong file .env');
    return null;
  }

  if (!mongoose) {
    console.warn('⚠️  Cảnh báo: Chưa cài đặt thư viện "mongoose". Hãy chạy `npm install` tại thư mục backend.');
    return null;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🍃 MongoDB Atlas đã kết nối thành công: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB Atlas:', error.message);
    // Không làm sập ứng dụng ngay mà thông báo lỗi để tiện debug
    return null;
  }
}

/**
 * Lấy trạng thái kết nối MongoDB hiện tại
 */
function getDBStatus() {
  if (!mongoose) return 'Chưa cài đặt mongoose';
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  return states[mongoose.connection.readyState] || 'Unknown';
}

module.exports = {
  connectDB,
  getDBStatus,
  mongoose,
};
