import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { DragonIcon, PeachBlossomIcon, FestivalStrip } from './Decorations';
import './Header.css';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const displayName = user?.name || user?.username || '';
  const isAdmin = user?.role === 'admin';
  const roleText = isAdmin ? 'Admin' : 'TV';

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/introduction')) {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <div className="lgd-header-wrapper">
      {/* Dải Tết hoa đào & rồng */}
      <FestivalStrip iconSize={24} />

      {/* Main Header Bar */}
      <header className="lgd-header-main">
        <div className="d-flex align-items-center justify-content-between flex-nowrap w-100 gap-2">
          {/* Logo bên trái */}
          <div className="d-flex align-items-center flex-shrink-0">
            <Link to="/" className="lgd-brand-link">
              <PeachBlossomIcon size={20} color="#f59e0b" className="d-none d-md-inline-block" />
              <img
                src="/images/Logo_full.png"
                alt="Logo Đoàn Lân Sư Rồng Lục Gia Đường"
                className="lgd-header-logo"
              />
              <DragonIcon size={22} color="#f59e0b" className="d-none d-lg-inline-block" />
            </Link>
          </div>

          {/* Menu điều hướng ở giữa (Desktop) & Nút 3 gạch (Mobile) */}
          <nav className="navbar navbar-expand-lg p-0 flex-grow-1 justify-content-center">
            <div className="container-fluid p-0 justify-content-end justify-content-lg-center">
              {/* Nút 3 gạch mobile */}
              <button
                className="navbar-toggler lgd-navbar-toggler-custom ms-auto me-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
              </button>

              {/* Danh sách các mục menu trong capsule */}
              <div className="collapse navbar-collapse justify-content-center" id="navbarNavDropdown">
                <ul className="lgd-nav-menu-capsule">
                  <li className="lgd-nav-item">
                    <Link
                      to="/"
                      className={`lgd-nav-link ${isActive('/') ? 'active' : ''}`}
                    >
                      <span>Trang chủ</span>
                    </Link>
                  </li>

                  <li className="lgd-nav-item">
                    <Link
                      to="/performance-services"
                      className={`lgd-nav-link ${isActive('/performance-services') ? 'active' : ''}`}
                    >
                      <span>Dịch vụ biểu diễn</span>
                      <span className="lgd-badge-hot ms-1">HOT</span>
                    </Link>
                  </li>

                  <li className="lgd-nav-item">
                    <Link
                      to="/schedule"
                      className={`lgd-nav-link ${isActive('/schedule') ? 'active' : ''}`}
                    >
                      <span>Lịch biểu diễn</span>
                    </Link>
                  </li>

                  <li className="lgd-nav-item">
                    <Link
                      to="/social"
                      className={`lgd-nav-link ${isActive('/social') ? 'active' : ''}`}
                    >
                      <span>Mạng xã hội</span>
                    </Link>
                  </li>

                  {/* CHỈ HIỆN MỤC NHẮN TIN KHI NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP */}
                  {user && (
                    <li className="lgd-nav-item">
                      <Link
                        to="/chat"
                        className={`lgd-nav-link ${isActive('/chat') ? 'active' : ''}`}
                      >
                        <span>Nhắn tin nội bộ</span>
                        <span className="lgd-badge-chat ms-1">CHAT</span>
                      </Link>
                    </li>
                  )}

                  <li className="lgd-nav-item">
                    <Link
                      to="/contact"
                      className={`lgd-nav-link ${isActive('/contact') ? 'active' : ''}`}
                    >
                      <span>Liên hệ / Đặt lịch</span>
                    </Link>
                  </li>

                  {/* Nút đổi theme Sáng/Tối */}
                  <li className="lgd-nav-item ms-lg-1">
                    <button
                      onClick={toggleTheme}
                      className="lgd-theme-btn"
                      title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
                      aria-label="Đổi giao diện"
                    >
                      {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* User Account / Nút Đăng nhập bên phải */}
          <div className="d-flex align-items-center flex-shrink-0">
            {user ? (
              <div className="dropdown">
                <button
                  className="lgd-user-btn dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  title={`${displayName} (${isAdmin ? 'Quản trị viên' : 'Thành viên'})`}
                >
                  <span className="lgd-user-name-text">{displayName}</span>
                  <span className={`lgd-role-pill ${isAdmin ? 'admin' : 'user'}`}>
                    {roleText}
                  </span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end lgd-user-dropdown-menu">
                  <li>
                    <div className="lgd-user-dropdown-header">
                      <small>Tài khoản đang đăng nhập:</small>
                      <br />
                      <strong>@{user.username}</strong>
                    </div>
                  </li>
                  <li>
                    <Link to="/profile" className="dropdown-item lgd-dropdown-item-custom">
                      👤 Thông tin cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link to="/social" className="dropdown-item lgd-dropdown-item-custom">
                      📱 Mạng xã hội LGD
                    </Link>
                  </li>
                  <li>
                    <Link to="/chat" className="dropdown-item lgd-dropdown-item-custom">
                      💬 Nhắn tin nội bộ đoàn
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider border-secondary my-1" style={{ opacity: 0.3 }} />
                  </li>
                  <li>
                    <button
                      className="dropdown-item lgd-dropdown-item-custom lgd-dropdown-item-danger fw-bold"
                      onClick={logout}
                    >
                      🚪 Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="lgd-login-btn">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
