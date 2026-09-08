import { useState, useEffect, useCallback, useContext } from "react";
import Carousel from "react-bootstrap/Carousel";
import { AuthContext } from "../AuthContext";
import "./Banner.css";

const SLIDES = [
  { imageUrl: "/images/banner_1.jpg", title: "Lân Sư Rồng Chuyên Nghiệp", subtitle: "Dịch vụ biểu diễn – Phụ kiện – Trang phục cao cấp" },
  { imageUrl: "/images/banner_2.jpg", title: "Dịch Vụ Biểu Diễn Sự Kiện", subtitle: "Chuyên nghiệp – Uy tín – Book show toàn quốc" },
  { imageUrl: "/images/banner_3.jpg", title: "Phụ Kiện Lân Sư Rồng", subtitle: "Đầy đủ mẫu mã – Giá tốt – Chất lượng chuẩn" },
];

const BANNER_POSITIONS_KEY = "bannerPositions";
const defaultPositions = SLIDES.map(() => ({ x: 50, y: 50 }));

function Banner() {
  const { isAdmin } = useContext(AuthContext) || {};
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem(BANNER_POSITIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === SLIDES.length) {
          return parsed;
        }
      }
    } catch {}
    return defaultPositions;
  });
  const [dragging, setDragging] = useState(null);

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
    setDragging({ index, startX: e.clientX, startY: e.clientY, startPX: positions[index].x, startPY: positions[index].y });
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

  return (
    <div className="lgd-banner-container">
      <Carousel fade interval={4000} className="shadow-sm rounded-0 overflow-hidden">
        {SLIDES.map((slide, index) => (
          <Carousel.Item key={index}>
            <div
              role="img"
              aria-label={slide.title || `Slide ${index + 1}`}
              onMouseDown={(e) => handleMouseDown(index, e)}
              className="lgd-banner-slide"
              style={{
                backgroundImage: `url(${slide.imageUrl})`,
                backgroundPosition: `${positions[index]?.x ?? 50}% ${positions[index]?.y ?? 50}%`,
                cursor: dragging?.index === index ? "grabbing" : isAdmin ? "grab" : "default",
                userSelect: "none",
              }}
            >
              {/* Dark overlay ensuring crystal clear contrast */}
              <div className="lgd-banner-overlay" />

              {isAdmin && (
                <div className="lgd-banner-admin-hint">
                  🖱️ Kéo để chỉnh vị trí ảnh (Admin)
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
    </div>
  );
}

export default Banner;

