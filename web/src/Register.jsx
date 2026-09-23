import React from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Register() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--lgd-black, #f8f9fc)" }}>
      <Header />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div
              className="card shadow-sm text-center"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e9d5ff",
                borderRadius: "16px",
              }}
            >
              <div className="card-body p-4 p-md-5">
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "#f3e8ff",
                    color: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    margin: "0 auto 20px auto",
                  }}
                >
                  <i className="bi bi-shield-lock-fill"></i>
                </div>

                <h3 className="fw-bold mb-3" style={{ color: "#7c3aed" }}>
                  Đăng Ký Thành Viên Nội Bộ
                </h3>

                <div
                  className="alert alert-warning py-3 text-start mb-4"
                  style={{ fontSize: "14px", borderRadius: "12px", border: "1px solid #fde68a" }}
                >
                  <div className="fw-bold mb-1">
                    <i className="bi bi-info-circle-fill me-2 text-warning"></i>
                    Thông báo quan trọng:
                  </div>
                  Hệ thống không mở đăng ký tài khoản tự do nhằm bảo vệ quyền riêng tư và thông tin nội bộ của Đoàn Lân Sư Rồng Lương Gia Đường.
                </div>

                <p className="text-muted small mb-4 text-start">
                  Nếu bạn là thành viên mới gia nhập hoặc biểu diễn của đoàn, vui lòng liên hệ trực tiếp với <strong>Trưởng đoàn (Admin)</strong> để được tạo và bàn giao tài khoản truy cập.
                </p>

                <div className="d-grid gap-2">
                  <Link
                    to="/login"
                    className="btn fw-bold py-2"
                    style={{
                      background: "#7c3aed",
                      border: "1px solid #7c3aed",
                      color: "#fff",
                      borderRadius: "8px",
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Đến Trang Đăng Nhập
                  </Link>

                  <Link
                    to="/contact"
                    className="btn btn-outline-secondary fw-bold py-2"
                    style={{ borderRadius: "8px" }}
                  >
                    <i className="bi bi-telephone-fill me-2"></i>
                    Liên hệ Trưởng Đoàn
                  </Link>
                </div>

                <p className="text-center mt-4 mb-0 text-muted small">
                  Hotline hỗ trợ:{" "}
                  <a href="tel:0965008544" className="fw-bold" style={{ color: "#7c3aed", textDecoration: "none" }}>
                    0965 008 544
                  </a>
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
