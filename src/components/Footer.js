import React from 'react'
import { Link } from 'react-router-dom'
import { DragonIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from './Decorations'

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5 position-relative" style={{ backgroundColor: '#0a0a0a', borderTop: '3px solid #d4a012', boxShadow: '0 -4px 12px rgba(212,160,18,0.15)' }}>
      <FestivalStrip iconSize={24} />
      <div className="container">
        {/* PHẦN ĐĂNG KÝ NHẬN TIN */}
        <div className="row align-items-center mb-5 pb-4 border-bottom" style={{ borderColor: 'rgba(212,160,18,0.4)' }}>
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center gap-2">
                <LanternIcon size={28} color="#eab308" />
                <img 
                  src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/mailing.png?1647921135706"
                  alt="Newsletter"
                  width="80"
                  className="img-fluid"
                />
              </div>
              <div>
                <h4 className="fw-bold mb-1 d-flex align-items-center gap-2 flex-wrap">
                  <PeachBlossomIcon size={20} color="#e879a0" />
                  <LanternIcon size={22} color="#eab308" />
                  <PeachBlossomIcon size={18} color="#e879a0" />
                  Đăng ký nhận bản tin Lân Sư Rồng
                  <DragonIcon size={22} color="#eab308" />
                  <DragonIcon size={18} color="#eab308" />
                  <PeachBlossomIcon size={20} color="#e879a0" />
                  <LanternIcon size={20} color="#eab308" />
                </h4>
                <p className="mb-0 text-white-50">
                  Đừng bỏ lỡ hàng ngàn sản phẩm và chương trình siêu hấp dẫn
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
              />
              <button type="submit" className="btn btn-lg px-5 rounded-pill fw-bold" style={{ background: 'linear-gradient(180deg, #c41e3a 0%, #9a1830 100%)', border: '1px solid #d4a012', color: '#fff', boxShadow: '0 2px 8px rgba(212,160,18,0.3)' }}>
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* 3 CỘT CHÍNH */}
        <div className="row g-5">
          {/* Cột 1: Chính sách */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3 lgd-title-gold" style={{ color: '#d4a012', textShadow: '0 0 12px rgba(212,160,18,0.4)' }}>CHÍNH SÁCH</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white-50 hover-text-white">Trang chủ</Link></li>
              <li className="mb-2"><Link to="/san-pham" className="text-white-50 hover-text-white">Sản phẩm</Link></li>
              <li className="mb-2"><Link to="/gioi-thieu" className="text-white-50 hover-text-white">Giới thiệu</Link></li>
              <li className="mb-2"><Link to="/tin-tuc" className="text-white-50 hover-text-white">Tin tức</Link></li>
            </ul>
          </div>

          {/* Cột 2: Liên hệ */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3" style={{ color: '#d4a012', textShadow: '0 0 12px rgba(212,160,18,0.4)' }}>THÔNG TIN LIÊN HỆ</h5>
            <p className="mb-2"> Phạm Hải Nam: <strong>0345 422 378</strong></p>
            <p className="mb-0"> Hồ Ngọc Thảo: <strong>0379 872 058</strong></p>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="col-md-4">
            <h5 className="fw-bold mb-3" style={{ color: '#d4a012', textShadow: '0 0 12px rgba(212,160,18,0.4)' }}>MẠNG XÃ HỘI</h5>
            <p className="mb-2">
              <a href="https://www.facebook.com/profile.php?id=100092666694525" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-white-50 hover-text-white">
                Facebook
              </a>
            </p>
            <p className="mb-0">
              <a href="https://www.tiktok.com/@lucgiaduong" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-white-50 hover-text-white">
                TikTok
              </a>
            </p>
          </div>
        </div>

        {/* THANH TOÁN */}
        <div className="text-center mt-5 pt-4 border-top" style={{ borderColor: 'rgba(212,160,18,0.4)' }}>
          <p className="mb-3 fw-bold">Chấp nhận thanh toán</p>
          <img 
            src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/payment.png?1647921135706"
            alt="Phương thức thanh toán"
            className="img-fluid"
            style={{ maxHeight: '50px' }}
          />
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-3 border-top text-white-50 small" style={{ borderColor: 'rgba(212,160,18,0.4)' }}>
          <Link to="/login" className="text-white-50 text-decoration-none">
            © 2025 Lân Sư Rồng - Tất cả quyền được bảo lưu
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer