import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      alert("Đăng nhập thành công ✅");
      navigate("/member"); // vào trang upload
    } catch (err) {
      alert("Sai email hoặc mật khẩu ❌");
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow lgd-border-gold" style={{ backgroundColor: '#1a1510', border: '2px solid rgba(212,160,18,0.4)' }}>
              <div className="card-body p-4">
                <h2 className="text-center mb-4 lgd-title-gold" style={{ color: '#eab308', textShadow: '0 0 12px rgba(212,160,18,0.4)' }}>Đăng nhập hệ thống</h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label style={{ color: '#fafafa' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Nhập email"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label style={{ color: '#fafafa' }}>Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Nhập mật khẩu"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button className="btn w-100" style={{ background: 'linear-gradient(180deg, #c41e3a 0%, #9a1830 100%)', border: '1px solid #d4a012', color: '#fff' }}>
                    Đăng nhập
                  </button>
                </form>

                <p className="text-center mt-3" style={{ color: '#a3a3a3' }}>
                  Chưa có tài khoản? <a href="/register" style={{ color: '#eab308' }}>Đăng ký</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;