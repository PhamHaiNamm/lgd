const http = require('http');
const fs = require('fs');
const path = require('path');
const { getClientIp, handleAiChat } = require('./lib/aiProxy');

const PORT = Number(process.env.PORT || 3001);
const BUILD_DIR = path.join(__dirname, 'build');
const INDEX_FILE = path.join(BUILD_DIR, 'index.html');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload quá lớn.'));
        request.destroy();
      }
    });

    request.on('end', () => resolve(raw));
    request.on('error', reject);
  });
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
  };
  return types[extension] || 'application/octet-stream';
}

async function handleChat(request, response) {
  try {
    const rawBody = await collectRequestBody(request);
    const result = await handleAiChat({
      method: request.method,
      headers: request.headers,
      body: rawBody,
      ipAddress: getClientIp(request),
    });
    return sendJson(response, result.status, result.body);
  } catch (error) {
    return sendJson(response, 500, {
      error: error.message || 'Lỗi server khi xử lý yêu cầu AI.',
    });
  }
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  const safePath = requestPath === '/' ? '/index.html' : requestPath;
  const filePath = path.join(BUILD_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    response.writeHead(200, {
      'Content-Type': getMimeType(filePath),
    });
    fs.createReadStream(filePath).pipe(response);
    return;
  }

  if (fs.existsSync(INDEX_FILE)) {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
    fs.createReadStream(INDEX_FILE).pipe(response);
    return;
  }

  sendJson(response, 404, {
    error: 'Chưa tìm thấy file build. Hãy chạy npm run build trước khi public.',
  });
}

const server = http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/api/ai/chat') {
    handleChat(request, response);
    return;
  }

  if (request.method === 'GET') {
    serveStatic(request, response);
    return;
  }

  sendJson(response, 405, {
    error: 'Method không được hỗ trợ.',
  });
});

server.listen(PORT, () => {
  console.log(`AI server đang chạy tại http://localhost:${PORT}`);
});
