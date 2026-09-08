import { useState, useEffect, useCallback, useContext } from "react";
import Carousel from "react-bootstrap/Carousel";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { AuthContext } from "../AuthContext";
import { API_BASE_URL, formatImageUrl } from "../config";
import "./Banner.css";

const DEFAULT_SLIDES = [
  { imageUrl: "/images/banner_1.jpg", title: "Lân Sư Rồng Chuyên Nghiệp", subtitle: "Dịch vụ biểu diễn – Phụ kiện – Trang phục cao cấp" },
  { imageUrl: "/images/banner_2.jpg", title: "Dịch Vụ Biểu Diễn Sự Kiện", subtitle: "Chuyên nghiệp – Uy tín – Book show toàn quốc" },
  { imageUrl: "/images/banner_3.jpg", title: "Phụ Kiện Lân Sư Rồng", subtitle: "Đầy đủ mẫu mã – Giá tốt – Chất lượng chuẩn" },
];

const BANNER_SLIDES_KEY = "lgd_banner_slides";
const BANNER_POSITIONS_KEY = "bannerPositions";

function Banner() {
  const { user, token } = useContext(AuthContext) || {};
  const isAdmin = user?.role === "admin";

  const [slides, setSlides] = useState(() => {
    try {
      const saved = localStorage.getItem(BANNER_SLIDES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SLIDES;
  });

  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(BANNER_POSITIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_SLIDES.map(() => ({ x: 50, y: 50 }));
  });

  const [dragging, setDragging] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingSlides, setEditingSlides] = useState(slides);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const savePositions = useCallback((nextPositions) => {
    try {
      localStorage.setItem(BANNER_POSITIONS_KEY, JSON.stringify(nextPositions));
    } catch (err) {
      console.error("Save banner positions error:", err);
    }
  }, []);

  const handleMouseDown = useCallback((index, e) => {
    if (!isAdmin || e.button !== 0) return;
    e.preventDefault();
    const currentPos = positions[index] || { x: 50, y: 50 };
    setDragging({ index, startX: e.clientX, startY: e.clientY, startPX: currentPos.x, startPY: currentPos.y });
  }, [isAdmin, positions]);

  useEffect(() => {
    if (dragging == null) return;
    const { index, startX, startY, startPX, startPY } = dragging;
    const sensitivity = 0.15;

    const handleMouseMove = (e) => {
      const dx = (e.clientX - startX) * sensitivity;
      const dy = (e.clientY - startY) * sensitivity;
      setPositions((prev) => {
        const next = [...prev];
        next[index] = {
          x: Math.min(100, Math.max(0, startPX + dx)),
          y: Math.min(100, Math.max(0, startPY + dy)),
        };
        return next;
      });
    };
    const handleMouseUp = () => {
      setPositions((prev) => {
        savePositions(prev);
        return prev;
      });
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, savePositions]);

  // Mở modal quản lý banner
  const handleOpenManageModal = () => {
    setEditingSlides(JSON.parse(JSON.stringify(slides)));
    setShowManageModal(true);
  };

  // Upload ảnh cho slide trong modal
  const handleUploadSlideImage = async (index, file) => {
    if (!file) return;
    try {
      setUploadingIndex(index);
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        setEditingSlides((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], imageUrl: data.data.url };
          return next;
        });
      } else {
        alert(data.message || "Tải ảnh banner thất bại.");
      }
    } catch (err) {
      alert("Lỗi tải ảnh banner: " + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSlideFieldChange = (index, field, value) => {
    setEditingSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddSlide = () => {
    setEditingSlides((prev) => [
      ...prev,
      { imageUrl: "/images/banner_1.jpg", title: "Tiêu đề mới", subtitle: "Mô tả phụ cho banner" },
    ]);
  };

  const handleDeleteSlide = (index) => {
    if (editingSlides.length <= 1) {
      alert("Cần giữ lại ít nhất 1 slide banner!");
      return;
    }
    setEditingSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBannerChanges = () => {
    setSlides(editingSlides);
    localStorage.setItem(BANNER_SLIDES_KEY, JSON.stringify(editingSlides));
    setShowManageModal(false);
    alert("🎉 Đã lưu thay đổi ảnh banner thành công!");
  };

  const handleResetDefault = () => {
    if (window.confirm("Bạn có chắc muốn khôi phục về danh sách banner mặc định?")) {
      setEditingSlides(DEFAULT_SLIDES);
      setSlides(DEFAULT_SLIDES);
      localStorage.removeItem(BANNER_SLIDES_KEY);
      setShowManageModal(false);
    }
  };

  return (
    <div className="lgd-banner-container">
      <Carousel fade interval={4000} className="shadow-sm rounded-0 overflow-hidden">
        {slides.map((slide, index) => (
          <Carousel.Item key={index}>
            <div
              role="img"
              aria-label={slide.title || `Slide ${index + 1}`}
              onMouseDown={(e) => handleMouseDown(index, e)}
              className="lgd-banner-slide"
              style={{
                backgroundImage: `url(${formatImageUrl(slide.imageUrl)})`,
                backgroundPosition: `${positions[index]?.x ?? 50}% ${positions[index]?.y ?? 50}%`,
                cursor: dragging?.index === index ? "grabbing" : isAdmin ? "grab" : "default",
                userSelect: "none",
              }}
            >
              {/* Dark overlay ensuring crystal clear contrast */}
              <div className="lgd-banner-overlay" />

              {isAdmin && (
                <div className="lgd-banner-admin-bar">
                  <span className="lgd-banner-admin-hint">
                    🖱️ Kéo để chỉnh góc ảnh (Slide {index + 1}/{slides.length})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenManageModal();
                    }}
                    className="btn btn-sm lgd-banner-manage-btn"
                  >
                    ⚙️ Quản lý & Đổi ảnh Banner
                  </button>
                </div>
              )}

              {/* Floating Caption Box */}
              <div className="lgd-banner-caption">
                <h3 className="lgd-banner-title">
                  <span className="lgd-banner-title-text">{slide.title || "Lục Gia Đường"}</span>
                </h3>
                {slide.subtitle && (
                  <p className="lgd-banner-subtitle">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Modal Quản Lý & Đổi Ảnh Banner dành cho Admin */}
      <Modal
        show={showManageModal}
        onHide={() => setShowManageModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ background: '#f8f9fc', borderBottom: '1px solid #e2e8f0' }}>
          <Modal.Title className="fw-bold" style={{ color: '#7c3aed', fontSize: '1.25rem' }}>
            ⚙️ Quản lý & Đổi ảnh Banner trang chủ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px' }}>
          <p className="text-secondary small mb-3">
            Admin có thể tải ảnh mới từ máy tính lên, đổi tiêu đề, mô tả hoặc thêm/xóa các slide hiển thị trên Banner.
          </p>

          <div className="d-flex flex-column gap-3">
            {editingSlides.map((slide, idx) => (
              <div
                key={idx}
                className="p-3 rounded border"
                style={{ background: '#ffffff', borderColor: '#e2e8f0' }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <strong style={{ color: '#1e1b4b' }}>Slide {idx + 1}</strong>
                  {editingSlides.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteSlide(idx)}
                    >
                      🗑️ Xóa slide này
                    </Button>
                  )}
                </div>

                <div className="row g-3 align-items-center">
                  {/* Thumbnail preview */}
                  <div className="col-12 col-md-4 text-center">
                    <div
                      className="rounded border overflow-hidden position-relative mx-auto"
                      style={{
                        width: '100%',
                        height: '110px',
                        background: '#0f172a',
                        backgroundImage: `url(${formatImageUrl(slide.imageUrl)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {uploadingIndex === idx && (
                        <div
                          className="position-absolute inset-0 d-flex align-items-center justify-content-center"
                          style={{ inset: 0, background: 'rgba(0,0,0,0.6)', color: '#ffffff' }}
                        >
                          <Spinner animation="border" size="sm" className="me-2" />
                          <span>Đang tải...</span>
                        </div>
                      )}
                    </div>

                    <label
                      className="btn btn-sm btn-outline-primary mt-2 w-100 fw-bold"
                      style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      📷 Tải ảnh mới lên
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingIndex === idx}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSlideImage(idx, file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Fields */}
                  <div className="col-12 col-md-8">
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold mb-1" style={{ color: '#475569' }}>
                        URL Ảnh (hoặc tải từ máy bên cạnh)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={slide.imageUrl || ''}
                        onChange={(e) => handleSlideFieldChange(idx, 'imageUrl', e.target.value)}
                        placeholder="Nhập đường dẫn ảnh..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold mb-1" style={{ color: '#475569' }}>
                        Tiêu đề lớn
                      </Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={slide.title || ''}
                        onChange={(e) => handleSlideFieldChange(idx, 'title', e.target.value)}
                        placeholder="Tiêu đề banner..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Label className="small fw-bold mb-1" style={{ color: '#475569' }}>
                        Mô tả phụ
                      </Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={slide.subtitle || ''}
                        onChange={(e) => handleSlideFieldChange(idx, 'subtitle', e.target.value)}
                        placeholder="Mô tả ngắn banner..."
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <Button
              variant="outline-success"
              size="sm"
              className="fw-bold"
              onClick={handleAddSlide}
            >
              ➕ Thêm Slide Banner mới
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between" style={{ background: '#f8f9fc', borderTop: '1px solid #e2e8f0' }}>
          <Button variant="outline-secondary" size="sm" onClick={handleResetDefault}>
            🔄 Khôi phục mặc định
          </Button>
          <div className="d-flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowManageModal(false)}>
              Đóng
            </Button>
            <Button variant="primary" size="sm" className="fw-bold" style={{ background: '#7c3aed', borderColor: '#7c3aed' }} onClick={handleSaveBannerChanges}>
              💾 Lưu thay đổi
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Banner;
