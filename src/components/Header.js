import { Link } from 'react-router-dom';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { DragonIcon, PeachBlossomIcon, FestivalStrip } from './Decorations';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div>
      {/* Dải Tết: nhiều hoa đào hồng + đèn lồng + rồng */}
      <FestivalStrip iconSize={26} />
      {/* logo */}
      <div className='container-fluid py-3 position-relative lgd-corners' style={{ background: 'linear-gradient(90deg, var(--lgd-black) 0%, var(--lgd-black-card) 15%, var(--lgd-purple-dark) 40%, var(--lgd-purple) 50%, var(--lgd-purple-dark) 60%, var(--lgd-black) 100%)', borderBottom: '3px solid var(--lgd-purple-light)', boxShadow: '0 4px 12px var(--lgd-purple-glow)' }}>
        <div className='row'>
          <div className='col-3 col-md-3 col-lg-2 d-flex justify-content-start align-items-center flex-wrap'>
            <PeachBlossomIcon size={22} color="var(--lgd-accent-bright)" className="d-none d-md-inline-block me-1" />
            <PeachBlossomIcon size={18} color="var(--lgd-accent-bright)" className="d-none d-lg-inline-block me-0" />
            <img
              src='/images/Logo_full.png'
              alt='Logo'
              className='img-fluid lgd-logo'
              style={{ maxHeight: '100px' }}
            />
            <DragonIcon size={26} color="var(--lgd-accent-bright)" className="d-none d-lg-inline-block ms-1 me-0" />
            <DragonIcon size={22} color="var(--lgd-accent-bright)" className="d-none d-xl-inline-block me-1" />
            <PeachBlossomIcon size={18} color="var(--lgd-accent-bright)" className="d-none d-xl-inline-block ms-1" />
          </div>
          {/* navbar */}
          <div className='col-6 col-md-6 col-lg-8 d-flex gap-4 justify-content-center align-items-center'>
            <nav className="navbar navbar-expand-lg p-0">
              <div className="container-fluid p-0">
                <button className="navbar-toggler border-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                  <ul className="navbar-nav gap-3 align-items-center">
                    <li className="nav-item">
                      <Link to="/" className="nav-link text-white fw-bold px-3">Trang chủ</Link>
                    </li>

                    <li className="nav-item">
                      <Link to="/performance-services" className="nav-link text-white fw-bold px-3 position-relative">
                        Dịch vụ biểu diễn
                        <span className="badge ms-2" style={{ fontSize: '0.7rem', background: 'linear-gradient(180deg, var(--lgd-purple-light) 0%, var(--lgd-accent-dark) 100%)', color: '#fff', border: '1px solid var(--lgd-accent-bright)' }}>HOT</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/schedule" className="nav-link text-white fw-bold px-3">Lịch biểu diễn</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/blog" className="nav-link text-white fw-bold px-3">Thư viện ảnh/video</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/contact" className="nav-link text-white fw-bold px-3">Liên hệ / Đặt lịch</Link>
                    </li>

                    {/* Nút toggle theme */}
                    <li className="nav-item ms-lg-2">
                      <button onClick={toggleTheme} className="btn btn-sm btn-outline-light d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '50%' }} title="Đổi chế độ sáng/tối">
                        {theme === 'dark' ? '☀️' : '🌙'}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>

          <div className="col-3 col-md-3 col-lg-2 text-end d-flex align-items-center justify-content-end">
            {user && (
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
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Header;
