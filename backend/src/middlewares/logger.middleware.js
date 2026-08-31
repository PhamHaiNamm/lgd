let morgan = null;
try {
  morgan = require('morgan');
} catch (e) {
  morgan = null;
}

const config = require('../config/environment');

const loggerMiddleware = (req, res, next) => {
  if (morgan) {
    const handler = config.isProduction ? morgan('combined') : morgan('dev');
    return handler(req, res, next);
  }

  // Ghi log mặc định nếu chưa cài đặt morgan
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

module.exports = loggerMiddleware;
