import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form.username, form.password);
      alert("Đăng nhập thành công! ✅");
      navigate("/social");
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black, #f8f9fc)' }}>
      <Header />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '16px' }}>
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold" style={{ color: '#7c3aed' }}>
                  Đăng nhập hệ thống
                </h2>

                {error && (
                  <div className="alert alert-danger py-2" style={{ fontSize: '14px' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Tên đăng nhập</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      placeholder="Nhập tên đăng nhập"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Nhập mật khẩu"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    className="btn w-100 fw-bold py-2 mt-3"
                    disabled={loading}
                    style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#fff', borderRadius: '8px' }}
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 text-muted small">
                  Chưa có tài khoản? <Link to="/register" style={{ color: '#7c3aed', fontWeight: 'bold' }}>Đăng ký ngay</Link>
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