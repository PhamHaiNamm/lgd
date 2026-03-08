import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from './Decorations';

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      {/* Dải Tết: nhiều hoa đào hồng + đèn lồng + rồng */}
      <FestivalStrip iconSize={26} />
      {/* logo */}
      <div className='container-fluid text-white py-3 position-relative lgd-corners' style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #1a0a1a 15%, #5b21b6 40%, #7c3aed 50%, #5b21b6 60%, #0a0a0a 100%)', borderBottom: '3px solid #8b5cf6', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}>
        <div className='row'>
          <div className='col-3 col-md-3 col-lg-2 d-flex justify-content-start align-items-center flex-wrap'>
            <PeachBlossomIcon size={22} color="#a78bfa" className="d-none d-md-inline-block me-1" />
            <PeachBlossomIcon size={18} color="#a78bfa" className="d-none d-lg-inline-block me-0" />
            <img
              src='/images/Logo_full.png'
              alt='Logo'
              className='img-fluid'
              style={{ maxHeight: '100px' }}
            />
            <DragonIcon size={26} color="#a78bfa" className="d-none d-lg-inline-block ms-1 me-0" />
            <DragonIcon size={22} color="#a78bfa" className="d-none d-xl-inline-block me-1" />
            <PeachBlossomIcon size={18} color="#a78bfa" className="d-none d-xl-inline-block ms-1" />
          </div>
          {/* navbar */}
          <div className='col-6 col-md-6 col-lg-8 d-flex gap-4 justify-content-center'>
            <nav className="navbar navbar-expand-lg p-0">
              <div className="container-fluid p-0">
                <button className="navbar-toggler border-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                  <ul className="navbar-nav gap-4">
                    <li className="nav-item">
                      <Link to="/" className="nav-link text-white fw-bold fs-5 px-3" style={{ textShadow: '0 1px 2px #000' }}>Trang chủ</Link>
                    </li>
              
                    <li className="nav-item">
                      <Link to="/performance-services" className="nav-link text-white fw-bold fs-5 px-3 position-relative">
                        Dịch vụ biểu diễn
                        <span className="badge ms-2" style={{ fontSize: '0.7rem', background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff', border: '1px solid #a78bfa' }}>HOT</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/blog" className="nav-link text-white fw-bold fs-5 px-3">Thư viện ảnh/video</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/contact" className="nav-link text-white fw-bold fs-5 px-3">Liên hệ / Đặt lịch</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>
          {/* Chỉ hiển thị khi đã đăng nhập */}
          {user && (
            <div className="col-3 col-md-3 col-lg-2 text-end">
              <div className="dropdown d-inline-block">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: '0.85rem' }}
                >
                  {user.username} ({user.role === 'admin' ? 'Admin' : 'TV'})
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={logout}
                    >
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Header;
