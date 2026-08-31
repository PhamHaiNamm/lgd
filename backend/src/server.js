const app = require('./app');
const config = require('./config/environment');
const { connectDB } = require('./config/database');

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`========================================`);
  console.log(`🚀 Backend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🌍 Môi trường: ${config.env}`);
  console.log(`❤️  Kiểm tra Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`========================================`);

  // Tự động kết nối cơ sở dữ liệu MongoDB
  await connectDB();
});

// Xử lý unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('LỖI KHÔNG ĐƯỢC BẮT (Unhandled Rejection):', err);
  server.close(() => {
    process.exit(1);
  });
});

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('LỖI NGOẠI LỆ (Uncaught Exception):', err);
  process.exit(1);
});
