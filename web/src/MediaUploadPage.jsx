import { useState, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthContext } from "./AuthContext";
import { formatImageUrl } from "./config";
import "./MediaUploadPage.css";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;

function getTypeFromName(name) {
    if (IMAGE_EXT.test(name)) return "image";
    if (VIDEO_EXT.test(name)) return "video";
    return "image";
}

export default function MediaUploadPage() {
    const { user } = useContext(AuthContext) || {};
    const [mediaFiles] = useState([]);
    const [members, setMembers] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);

    const handleUpload = () => {
        alert("Tính năng đang được chuyển sang hệ thống máy chủ mới.");
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--lgd-black)" }}>
            <Header />
            <div className="media-upload-section">
                <div className="container">
                    <h2 className="mb-4" style={{ color: "var(--lgd-accent-light)" }}>
                        🎬 Khu vực Media
                    </h2>

                    {user ? (
                        <div className="upload-card mb-4">
                            <p style={{ color: "#fafafa" }}>Xin chào: {user.email}</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleUpload}
                                disabled={uploading}
                                className="form-control"
                                style={{ maxWidth: 320 }}
                            />
                            {uploading && <p style={{ color: "#a78bfa" }}>Đang tải lên...</p>}
                        </div>
                    ) : (
                        <p style={{ color: "#a3a3a3" }}>
                            Đăng nhập để upload. Khách vẫn xem được bên dưới.
                        </p>
                    )}

                    <h3 style={{ color: "var(--lgd-accent-light)" }}>Media thành viên</h3>

                    {loadingGallery ? (
                        <p style={{ color: "#a3a3a3" }}>Đang tải...</p>
                    ) : (
                        <div className="media-gallery-container mt-3">
                            {mediaFiles.map((item, i) => (
                                <div
                                    key={i}
                                    className="media-gallery-item"
                                    onClick={() => setSelectedMedia(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {item.type === "image" ? (
                                        <img src={item.url} alt="" />
                                    ) : (
                                        <video src={item.url} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Lightbox Modal */}
                    <Modal
                        show={!!selectedMedia}
                        onHide={() => setSelectedMedia(null)}
                        centered
                        size="xl"
                        contentClassName="bg-transparent border-0"
                    >
                        <Modal.Body className="p-0 position-relative">
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow"
                                style={{ zIndex: 1051 }}
                            ></button>
                            {selectedMedia && (
                                <div className="text-center">
                                    {selectedMedia.type === "image" ? (
                                        <img
                                            src={selectedMedia.url}
                                            alt="Full size"
                                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <video
                                            src={selectedMedia.url}
                                            controls
                                            autoPlay
                                            style={{ maxWidth: '100%', maxHeight: '90vh' }}
                                        />
                                    )}
                                </div>
                            )}
                        </Modal.Body>
                    </Modal>

                    <h3 style={{ color: "var(--lgd-accent-light)", marginTop: 40 }}>Thành viên</h3>

                    <div className="d-flex flex-wrap gap-3 mt-3">
                        {members.map((m, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <img src={formatImageUrl(m.avatar) || '/images/Logo_full.png'} alt={m.name ? `Avatar ${m.name}` : ""} width={120} height={120} style={{ borderRadius: "50%", objectFit: "cover" }} />
                                <p style={{ color: "#fafafa", marginTop: 8 }}>{m.name}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}