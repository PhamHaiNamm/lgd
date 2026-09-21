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

// Whitelist danh sách các origin được phép gọi API
const allowedOrigins = [
  'https://lucgiaduong.online',
  'https://www.lucgiaduong.online',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Cho phép các request không có origin header (như curl, mobile apps, postman, server-to-server)
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app') || origin.endsWith('.lucgiaduong.online') || origin.includes('localhost')) return true;
  return false;
};

// Cấu hình CORS an toàn theo Whitelist
if (cors) {
  app.use(
    cors({
      origin: function (origin, callback) {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Chặn bởi chính sách CORS bảo mật.'));
      },
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
    if (isOriginAllowed(origin)) {
      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Giới hạn kích thước payload hợp lý (10MB) ngăn ngừa tấn công DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter đơn giản trong bộ nhớ ngăn brute-force và DDoS
const rateLimitMap = new Map();
app.use('/api/v1/auth', (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 phút
  const maxRequests = 100; // Tối đa 100 request / 15 phút cho auth

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Quá nhiều yêu cầu đăng nhập/đăng ký từ IP này. Vui lòng thử lại sau 15 phút.',
    });
  }
  next();
});

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
