import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    birthYear: "",
    location: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        ...form,
        birthYear: form.birthYear ? Number(form.birthYear) : undefined,
      });
      alert("Đăng ký tài khoản thành công! 🎉");
      navigate("/social");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--lgd-black, #f8f9fc)" }}>
      <Header />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div
              className="card shadow-sm"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e9d5ff",
                borderRadius: "16px",
              }}
            >
              <div className="card-body p-4 p-md-5">
                <h2
                  className="text-center mb-4 fw-bold"
                  style={{ color: "#7c3aed" }}
                >
                  Đăng ký tài khoản
                </h2>

                {error && (
                  <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Họ và tên *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Tên đăng nhập *</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      placeholder="Nhập tên đăng nhập (viết liền, không dấu)"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Mật khẩu *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold small text-muted">Năm sinh</label>
                      <input
                        type="number"
                        name="birthYear"
                        className="form-control"
                        placeholder="Ví dụ: 2000"
                        value={form.birthYear}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold small text-muted">Vị trí / Quê quán</label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        placeholder="Ví dụ: Hà Nội"
                        value={form.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Giới thiệu ngắn (Bio)</label>
                    <textarea
                      name="bio"
                      rows="2"
                      className="form-control"
                      placeholder="Đôi nét về bạn..."
                      value={form.bio}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 fw-bold py-2 mt-3"
                    disabled={loading}
                    style={{
                      background: "#7c3aed",
                      border: "1px solid #7c3aed",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  >
                    {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                  </button>
                </form>

                <p className="text-center mt-4 mb-0 text-muted small">
                  Đã có tài khoản?{" "}
                  <Link to="/login" style={{ color: "#7c3aed", fontWeight: "bold" }}>
                    Đăng nhập
                  </Link>
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
