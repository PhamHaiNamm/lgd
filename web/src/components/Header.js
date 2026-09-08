import React, { useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { DragonIcon, PeachBlossomIcon } from './Decorations';
import './Header.css';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('theme');
  }, []);

  const displayName = user?.name || user?.username || '';
  const isAdmin = user?.role === 'admin';
  const roleText = isAdmin ? 'Admin' : 'TV';

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/introduction')) {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  const navLinks = (
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
    </ul>
  );

  return (
    <div className="lgd-header-wrapper">
      {/* Main Header Bar */}
      <header className="lgd-header-main">
        {/* Top Navigation Row */}
        <div className="lgd-header-top-bar">
          {/* Nút 3 gạch bên trái ngoài cùng (Chỉ hiện trên Mobile) */}
          <div className="lgd-header-left">
            <button
              className="navbar-toggler lgd-navbar-toggler-custom d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Logo (Desktop: bên trái | Mobile: chính giữa) */}
          <div className="lgd-header-brand">
            <Link to="/" className="lgd-brand-link">
              <PeachBlossomIcon size={20} color="#f59e0b" className="d-none d-md-inline-block" />
              <img
                src="/images/Logo_circle.png"
                alt="Logo Đoàn Lân Sư Rồng Lục Gia Đường"
                className="lgd-header-logo"
              />
              <DragonIcon size={22} color="#f59e0b" className="d-none d-lg-inline-block" />
            </Link>
          </div>

          {/* Menu điều hướng (Desktop: ở giữa) */}
          <div className="lgd-header-nav-desktop d-none d-lg-flex">
            {navLinks}
          </div>

          {/* User Account / Nút Đăng nhập bên phải ngoài cùng */}
          <div className="lgd-header-right">
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

        {/* Mobile Menu Dropdown (Chỉ hiện trên Mobile khi bấm nút 3 gạch) */}
        <div className="collapse navbar-collapse lgd-mobile-collapse d-lg-none" id="navbarNavDropdown">
          {navLinks}
        </div>
      </header>
    </div>
  );
}

export default Header;
