
import { Link } from 'react-router-dom'

function Header() {

    return (
        <div>
            {/* logo */}
            <div className='container-fluid text-white py-3' style={{ background: 'linear-gradient(90deg, #e33217, #ff6b35)' }}>
                <div className='row'>
                    <div className='col-3 col-md-3 col-lg-2 d-flex justify-content-start'>
                        <img
                            src='/images/Logo_full.png'
                            alt='Logo'
                            className='img-fluid'
                            style={{ maxHeight: '100px' }}
                        />
                        <h1 className='fw-bold ms-3 my-auto'><Link to="/" className='text-white text-decoration-none'>LGĐ</Link></h1>
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
                                            <Link to="/" className="nav-link text-white fw-bold fs-5 px-3">Trang chủ</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/productList" className="nav-link text-white fw-bold fs-5 px-3">Giới thiệu đoàn</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/khuyen-mai" className="nav-link text-white fw-bold fs-5 px-3 position-relative">
                                            Dịch vụ biểu diễn
                                                <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.7rem' }}>HOT</span>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/blog" className="nav-link text-white fw-bold fs-5 px-3">Thư viện ảnh/video</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/blog" className="nav-link text-white fw-bold fs-5 px-3">Liên hệ / Đặt lịch</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                    </div>
                    {/* account */}
                    {/* <div className="col-3 col-md-3 col-lg-2 text-end">
                        <div className="dropdown d-inline-block">
                            <button
                                className="btn btn-warning dropdown-toggle px-4"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Tài khoản
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                <li>
                                    <a className="dropdown-item py-3 px-4 d-flex align-items-center gap-3" href="/profile">
                                        <img
                                            src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/i_user.png?1647921135706"
                                            alt="khách hàng"
                                            width="22"
                                            style={{ filter: 'brightness(0) invert(0.25)' }}
                                        />
                                        <span className="fw-500">Hồ sơ</span>
                                    </a>
                                </li>

                                <li>
                                    <a className="dropdown-item py-3 px-4 d-flex align-items-center gap-3" href="/orders">
                                        <img
                                            src="//bizweb.dktcdn.net/100/412/528/themes/799520/assets/i_cart.png?1647921135706"
                                            alt="giỏ hàng"
                                            width="22"
                                            style={{ filter: 'brightness(0) invert(0.25)' }}
                                        />
                                        <span className="fw-500">Giỏ hàng</span>
                                    </a>
                                </li>

                                <li><hr className="dropdown-divider my-1" /></li>

                                <li>

                                    <Link to={"/"} className="dropdown-item py-3 px-4 text-danger fw-500" >
                                        Đăng xuất 
                                    </Link>
                                    <Link to={"/login"} className="dropdown-item py-3 px-4 text-danger fw-500" >
                                        Đăng Nhập 
                                    </Link>
                                    <Link to={"/register"} className="dropdown-item py-3 px-4 text-danger fw-500" >
                                        Đăng Ký 
                                    </Link>

                                </li>
                            </ul>
                        </div>
                    </div> */}

                </div>
            </div>
        </div>
    )
}

export default Header
