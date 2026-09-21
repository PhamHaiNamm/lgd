const crypto = require('crypto');

/**
 * Tạo token JWT chuẩn RFC 7519 (HS256) không cần thư viện ngoài
 */
function signToken(payload, secret, expiresInDays = 7) {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, secret, { expiresIn: `${expiresInDays}d` });
  } catch (e) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + expiresInDays * 86400,
      })
    ).toString('base64url');

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }
}

/**
 * Xác thực token JWT
 */
function verifyTokenString(token, secret) {
  try {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, secret);
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      throw e;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token không đúng định dạng');
    }

    const [header, body, signature] = parts;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('Chữ ký Token không hợp lệ');
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    } catch (err) {
      throw new Error('Dữ liệu Token không hợp lệ');
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const err = new Error('Phiên đăng nhập đã hết hạn');
      err.name = 'TokenExpiredError';
      throw err;
    }

    return payload;
  }
}

/**
 * Băm mật khẩu an toàn bằng Scrypt (chuẩn Node.js Crypto)
 */
function hashPassword(password) {
  try {
    const bcrypt = require('bcryptjs');
    return bcrypt.hashSync(password, 10);
  } catch (e) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }
}

/**
 * So sánh mật khẩu an toàn
 */
function verifyPassword(candidatePassword, storedHash) {
  if (!candidatePassword || !storedHash || typeof candidatePassword !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  try {
    const bcrypt = require('bcryptjs');
    if (!storedHash.startsWith('scrypt:')) {
      return bcrypt.compareSync(candidatePassword, storedHash);
    }
  } catch (e) {
    // fallback
  }

  if (storedHash.startsWith('scrypt:')) {
    try {
      const parts = storedHash.split(':');
      if (parts.length === 3) {
        const [, salt, key] = parts;
        const keyBuffer = Buffer.from(key, 'hex');
        const matchBuffer = crypto.scryptSync(candidatePassword, salt, 64);
        return keyBuffer.length === matchBuffer.length && crypto.timingSafeEqual(keyBuffer, matchBuffer);
      }
    } catch (err) {
      return false;
    }
  }

  return false;
}

module.exports = {
  signToken,
  verifyTokenString,
  hashPassword,
  verifyPassword,
};

