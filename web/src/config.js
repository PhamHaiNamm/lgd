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

export const ADMIN_EMAILS = ["phamhaiinamm@gmail.com"];
