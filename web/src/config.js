/**
 * Cấu hình admin và URL API backend toàn hệ thống.
 */
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  (isLocalhost
    ? 'http://localhost:5000/api/v1'
    : 'https://lgd-backend.onrender.com/api/v1');

export const getBackendBaseUrl = () => {
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
};

/**
 * Format và chuẩn hóa URL hình ảnh, tự động sửa lỗi Mixed Content HTTPS & localhost:5000
 */
export const formatImageUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  const backendBase = getBackendBaseUrl();

  // Nếu là URL localhost nhưng đang chạy trên môi trường online/HTTPS
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(trimmed)) {
    if (!isLocalhost) {
      return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, backendBase);
    }
    return trimmed;
  }

  // Nếu là đường dẫn cục bộ /uploads/... trên backend
  if (trimmed.startsWith('/uploads/')) {
    return `${backendBase}${trimmed}`;
  }

  // Nếu là đường dẫn tĩnh public /images/...
  if (trimmed.startsWith('/') || trimmed.startsWith('images/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // Tự động nâng cấp http:// sang https:// trên môi trường production
  if (!isLocalhost && trimmed.startsWith('http://')) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }

  return trimmed;
};

export const ADMIN_EMAILS = ["phamhaiinamm@gmail.com"];

