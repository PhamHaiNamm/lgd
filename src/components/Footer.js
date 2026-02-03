import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5">
      <div className="container">
        {/* PHẦN ĐĂNG KÝ NHẬN TIN */}
        <div className="row align-items-center mb-5 pb-4 border-bottom border-secondary">
          <div className="col-lg-6">
            <div className="d-flex align-items-center gap-4">
              <img 
                src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/mailing.png?1647921135706"
                alt="Newsletter"
                width="80"
                className="img-fluid"
              />
              <div>
                <h4 className="fw-bold mb-1">Đăng ký nhận bản tin Lân Sư Rồng</h4>
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
              <button type="submit" className="btn btn-danger btn-lg px-5 rounded-pill fw-bold">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* 3 CỘT CHÍNH */}
        <div className="row g-5">
          {/* Cột 1: Chính sách */}
          <div className="col-md-4">
            <h5 className="fw-bold text-warning mb-3">CHÍNH SÁCH</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white-50 hover-text-white">Trang chủ</Link></li>
              <li className="mb-2"><Link to="/san-pham" className="text-white-50 hover-text-white">Sản phẩm</Link></li>
              <li className="mb-2"><Link to="/gioi-thieu" className="text-white-50 hover-text-white">Giới thiệu</Link></li>
              <li className="mb-2"><Link to="/tin-tuc" className="text-white-50 hover-text-white">Tin tức</Link></li>
            </ul>
          </div>

          {/* Cột 2: Liên hệ */}
          <div className="col-md-4">
            <h5 className="fw-bold text-warning mb-3">THÔNG TIN LIÊN HỆ</h5>
            <p className="mb-2"> Phạm Hải Nam: <strong>0345 422 378</strong></p>
            <p className="mb-0"> Hồ Ngọc Thảo: <strong>0379 872 058</strong></p>
          </div>

          {/* Cột 3: Mạng xã hội */}
          <div className="col-md-4">
            <h5 className="fw-bold text-warning mb-3">MẠNG XÃ HỘI</h5>
            <p className="mb-2">
              <a href="https://www.facebook.com/profile.php?id=100092666694525" 
                 target="_blank" 
                 rel="noopener" 
                 className="text-white-50 hover-text-white">
                Facebook
              </a>
            </p>
            <p className="mb-0">
              <a href="https://www.tiktok.com/@lucgiaduong" 
                 target="_blank" 
                 rel="noopener" 
                 className="text-white-50 hover-text-white">
                TikTok
              </a>
            </p>
          </div>
        </div>

        {/* THANH TOÁN */}
        <div className="text-center mt-5 pt-4 border-top border-secondary">
          <p className="mb-3 fw-bold">Chấp nhận thanh toán</p>
          <img 
            src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/payment.png?1647921135706"
            alt="Phương thức thanh toán"
            className="img-fluid"
            style={{ maxHeight: '50px' }}
          />
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-3 border-top border-secondary text-white-50 small">
          © 2025 Lân Sư Rồng - Tất cả quyền được bảo lưu
        </div>
      </div>
    </footer>
  )
}

export default Footer