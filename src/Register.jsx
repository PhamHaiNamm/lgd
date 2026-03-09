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
        <div style={{ minHeight: "100vh", background: "var(--lgd-black)" }}>
            <Header />
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div
                            className="card shadow"
style={{
                                                backgroundColor: "var(--lgd-black-card)",
                                                border: "2px solid var(--lgd-purple-glow)",
                                            }}
                        >
                            <div className="card-body p-4">
                                <h2
                                    className="text-center mb-4 lgd-title-gold"
                                    style={{ color: "#a78bfa", textShadow: "0 0 12px var(--lgd-purple-glow)" }}
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
                                            background: "linear-gradient(180deg, #8b5cf6 0%, #5b21b6 100%)",
                                            border: "1px solid #a78bfa",
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
                                        style={{ color: "#a78bfa" }}
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
