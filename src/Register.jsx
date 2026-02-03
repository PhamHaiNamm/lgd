import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Đăng ký thành công!");
            window.location.href = "/login";
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
            <Header />
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div
                            className="card shadow"
style={{
                                                backgroundColor: "#1a1510",
                                                border: "2px solid rgba(212,160,18,0.4)",
                                            }}
                        >
                            <div className="card-body p-4">
                                <h2
                                    className="text-center mb-4 lgd-title-gold"
                                    style={{ color: "#eab308", textShadow: "0 0 12px rgba(212,160,18,0.4)" }}
                                >
                                    Đăng ký tài khoản
                                </h2>
                                <form onSubmit={handleRegister}>
                                    <div className="mb-3">
                                        <label style={{ color: "#fafafa" }}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Nhập email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label style={{ color: "#fafafa" }}>
                                            Mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn w-100"
                                        style={{
                                            background: "linear-gradient(180deg, #c41e3a 0%, #9a1830 100%)",
                                            border: "1px solid #d4a012",
                                            color: "#fff",
                                        }}
                                    >
                                        Đăng ký
                                    </button>
                                </form>
                                <p
                                    className="text-center mt-3"
                                    style={{ color: "#a3a3a3" }}
                                >
                                    Đã có tài khoản?{" "}
                                    <a
                                        href="/login"
                                        style={{ color: "#eab308" }}
                                    >
                                        Đăng nhập
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
