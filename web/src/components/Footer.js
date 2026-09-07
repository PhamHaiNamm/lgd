import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer
      className="pt-5 pb-4 mt-5 position-relative text-light"
      style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        borderTop: '3px solid #7c3aed',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="container">
        {/* 3 CỘT CHÍNH */}
        <div className="row g-5">
          {/* Cột 1: Chính sách & Điều hướng */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#c084fc', letterSpacing: '0.5px' }}>
              <span>🦁</span> CHÍNH SÁCH & ĐIỀU HƯỚNG
            </h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/" className="text-decoration-none" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#c084fc')} onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}>
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/performance-services" className="text-decoration-none" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#c084fc')} onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}>
                  Dịch Vụ Biểu Diễn
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-decoration-none" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#c084fc')} onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}>
                  Lịch Biểu Diễn
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-decoration-none" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.target.style.color = '#c084fc')} onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}>
                  Liên hệ & Đặt lịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 2: Liên hệ */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#c084fc', letterSpacing: '0.5px' }}>
              <span>📞</span> THÔNG TIN LIÊN HỆ
            </h5>
            <p className="mb-2" style={{ color: '#cbd5e1' }}>
              Phạm Hải Nam: <strong style={{ color: '#38bdf8' }}>0345 422 378</strong>
            </p>
            <p className="mb-2" style={{ color: '#cbd5e1' }}>
              Hồ Ngọc Thảo: <strong style={{ color: '#38bdf8' }}>0379 872 058</strong>
            </p>
            <p className="mb-0 small" style={{ color: '#94a3b8' }}>
              📍 Địa chỉ: Khu Trới 6, phường Hoành Bồ, tỉnh Quảng Ninh
            </p>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#c084fc', letterSpacing: '0.5px' }}>
              <span>🌐</span> KẾT NỐI MẠNG XÃ HỘI
            </h5>
            <div className="d-flex flex-column gap-2">
              <a
                href="https://www.facebook.com/profile.php?id=100092666694525"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none d-inline-flex align-items-center gap-2"
                style={{ color: '#cbd5e1', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#60a5fa')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                <span>📘</span> Fanpage Facebook
              </a>
              <a
                href="https://www.tiktok.com/@lucgiaduong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none d-inline-flex align-items-center gap-2"
                style={{ color: '#cbd5e1', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.target.style.color = '#f43f5e')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                <span>🎵</span> Kênh TikTok @lucgiaduong
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-3 border-top small" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
          <div>
            © 2026 Đoàn Lân Sư Rồng Lục Gia Đường — Bảo lưu mọi quyền.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;