import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="pt-5 pb-4 mt-5 position-relative" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e9d5ff', color: '#334155' }}>
      <div className="container">
        {/* 3 CỘT CHÍNH */}
        <div className="row g-5">
          {/* Cột 1: Chính sách */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3" style={{ color: '#7c3aed' }}>CHÍNH SÁCH</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-muted text-decoration-none">Trang chủ</Link></li>
              <li className="mb-2"><Link to="/performance-services" className="text-muted text-decoration-none">Dịch Vụ</Link></li>
              <li className="mb-2"><Link to="/schedule" className="text-muted text-decoration-none">Lịch Biểu Diễn</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-muted text-decoration-none">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 2: Liên hệ */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3" style={{ color: '#7c3aed' }}>THÔNG TIN LIÊN HỆ</h5>
            <p className="mb-2 text-muted"> Phạm Hải Nam: <strong style={{ color: '#1e1b4b' }}>0345 422 378</strong></p>
            <p className="mb-0 text-muted"> Hồ Ngọc Thảo: <strong style={{ color: '#1e1b4b' }}>0379 872 058</strong></p>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3" style={{ color: '#7c3aed' }}>MẠNG XÃ HỘI</h5>
            <p className="mb-2">
              <a href="https://www.facebook.com/profile.php?id=100092666694525"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted text-decoration-none">
                Facebook
              </a>
            </p>
            <p className="mb-0">
              <a href="https://www.tiktok.com/@lucgiaduong"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted text-decoration-none">
                TikTok
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-3 border-top text-muted small" style={{ borderColor: '#f1f5f9' }}>
          <div>
            © 2026 Lục Gia Đường - Tất cả quyền được bảo lưu
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer