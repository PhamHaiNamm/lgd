import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './Decorations.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ('bootstrap/dist/css/bootstrap.min.css');
import ('bootstrap/dist/js/bootstrap.min.js');

// Bắt lỗi Firestore "INTERNAL ASSERTION FAILED" (thường do Tracking Prevention chặn storage) để app không crash
window.addEventListener("unhandledrejection", (event) => {
  const msg = event.reason?.message || String(event.reason);
  if (msg && msg.includes("FIRESTORE") && msg.includes("INTERNAL ASSERTION FAILED")) {
    event.preventDefault();
    event.stopPropagation();
    console.warn("[Firestore] Connection issue (often caused by Tracking Prevention). Using cached or default data.");
    return true;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
