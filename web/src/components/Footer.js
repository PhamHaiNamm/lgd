import React from 'react'
import { Link } from 'react-router-dom'
import { LanternIcon, FestivalStrip } from './Decorations'

function Footer() {
  return (
    <footer className="pt-5 pb-4 mt-5 position-relative" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e9d5ff', color: '#334155' }}>
      <FestivalStrip iconSize={20} />
      <div className="container">
        {/* PHẦN ĐĂNG KÝ NHẬN TIN */}
        <div className="row align-items-center mb-5 pb-4 border-bottom" style={{ borderColor: '#f1f5f9' }}>
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center gap-2">
                <LanternIcon size={28} color="#7c3aed" />
                <img
                  src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/mailing.png?1647921135706"
                  alt="Newsletter"
                  width="70"
                  className="img-fluid"
                />
              </div>
              <div>
                <h4 className="fw-bold mb-1 d-flex align-items-center gap-2 flex-wrap" style={{ color: '#1e1b4b' }}>
                  Đăng ký nhận bản tin Lân Sư Rồng
                </h4>
                <p className="mb-0 text-muted">
                  Đừng bỏ lỡ các thông báo biểu diễn và chương trình mới nhất
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mt-4 mt-lg-0">
            <form className="d-flex gap-2">
              <input
                type="email"
                className="form-control form-control-lg rounded-pill"
                placeholder="Nhập email của bạn..."
                required
                style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#1e1b4b' }}
              />
              <button type="submit" className="btn btn-lg px-4 rounded-pill fw-bold" style={{ backgroundColor: '#7c3aed', color: '#fff' }}>
                Đăng ký
              </button>
            </form>
          </div>
        </div>

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