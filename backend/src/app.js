const path = require('path');

let express;
try {
  express = require('express');
} catch (e) {
  // Tìm kiếm express từ thư mục lân cận nếu cần
  express = require('../../web/node_modules/express');
}

let cors = null;
try {
  cors = require('cors');
} catch (e) {
  try {
    cors = require('../../web/node_modules/cors');
  } catch (err) {
    cors = null;
  }
}

let helmet = null;
try {
  helmet = require('helmet');
} catch (e) {
  try {
    helmet = require('../../web/node_modules/helmet');
  } catch (err) {
    helmet = null;
  }
}

const config = require('./config/environment');
const loggerMiddleware = require('./middlewares/logger.middleware');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/errorHandler.middleware');
const apiRoutes = require('./routes');

const app = express();

// Bảo mật Header nếu có helmet (cho phép tải resource cross-origin)
if (helmet) {
  app.use(helmet({ crossOriginResourcePolicy: false }));
}

// Ghi log request
app.use(loggerMiddleware);

// Cấu hình CORS hoàn toàn mở và hỗ trợ mọi domain (lucgiaduong.online, vercel, localhost)
if (cors) {
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    })
  );
  app.options('*', cors());
} else {
  // CORS fallback thủ công
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Phân tích dữ liệu JSON và urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file ảnh tải lên cục bộ
const UPLOADS_DIR = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Tuyến đường gốc
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API Backend NodeJS - Lục Gia Đường',
    docs: '/api/v1/health',
  });
});

// API Routes chính (phiên bản v1)
app.use('/api/v1', apiRoutes);

// Xử lý lỗi 404 & lỗi tập trung
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
