import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Carousel from "react-bootstrap/Carousel";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon } from "./Decorations";
import { ADMIN_EMAILS } from "../config";

const SLIDES = [
  { imageUrl: "/images/banner_1.jpg", title: "Lân Sư Rồng Chuyên Nghiệp", subtitle: "Dịch vụ biểu diễn – phụ kiện – trang phục" },
  { imageUrl: "/images/banner_2.jpg", title: "Dịch Vụ Biểu Diễn", subtitle: "Giá rẻ – uy tín – book show toàn quốc" },
  { imageUrl: "/images/banner_3.jpg", title: "Phụ Kiện Lân Sư Rồng", subtitle: "Full sản phẩm – giá tốt – chất lượng cao" },
];

const BANNER_POSITIONS_KEY = "bannerPositions";
const defaultPositions = SLIDES.map(() => ({ x: 50, y: 50 }));

function Banner() {
  const [positions, setPositions] = useState(defaultPositions);
  const [user, setUser] = useState(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "config", BANNER_POSITIONS_KEY))
      .then((snapshot) => {
        if (cancelled) return;
        if (snapshot.exists() && Array.isArray(snapshot.data().positions) && snapshot.data().positions.length === SLIDES.length) {
          setPositions(snapshot.data().positions);
        }
      })
      .catch(() => setPositions(defaultPositions));
    return () => { cancelled = true; };
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const savePositions = useCallback((nextPositions) => {
    setDoc(doc(db, "config", BANNER_POSITIONS_KEY), { positions: nextPositions }).catch((err) =>
      console.error("Save banner positions error:", err)
    );
  }, []);

  const handleMouseDown = useCallback((index, e) => {
    if (!isAdmin || e.button !== 0) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
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

  const captionStyle = { background: 'linear-gradient(transparent, rgba(0,0,0,0.92))', padding: '1.5rem', borderRadius: '0 0 8px 8px', borderTop: '2px solid rgba(139,92,246,0.5)', borderBottom: '1px solid rgba(167,139,250,0.3)' };
  const titleStyle = { color: '#a78bfa', textShadow: '0 0 12px rgba(139,92,246,0.6), 0 2px 4px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem 0.75rem', flexWrap: 'wrap' };

  return (
    <div
      className="banner-wide"
      style={{
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
      }}
    >
      <Carousel fade interval={3500} className="shadow-sm rounded-0 overflow-hidden">
        {SLIDES.map((slide, index) => (
          <Carousel.Item key={index}>
            <div
              role="img"
              aria-label={slide.title || `Slide ${index + 1}`}
              onMouseDown={(e) => handleMouseDown(index, e)}
              style={{
                height: "500px",
                width: "100%",
                backgroundImage: `url(${slide.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: `${positions[index]?.x ?? 50}% ${positions[index]?.y ?? 50}%`,
                backgroundRepeat: "no-repeat",
                cursor: dragging?.index === index ? "grabbing" : isAdmin ? "grab" : "default",
                userSelect: "none",
              }}
            >
              {isAdmin && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0,0,0,0.7)",
                    color: "#a78bfa",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    pointerEvents: "none",
                  }}
                >
                  Kéo để chỉnh vị trí ảnh
                </div>
              )}
            </div>
            <Carousel.Caption style={captionStyle}>
              <h3 className="fw-bold" style={titleStyle}>
                <PeachBlossomIcon size={26} color="#a78bfa" />
                <PeachBlossomIcon size={22} color="#a78bfa" />
                <LanternIcon size={28} color="#a78bfa" />
                <DragonIcon size={32} color="#a78bfa" />
                <DragonIcon size={28} color="#a78bfa" />
                {slide.title || "Lục Gia Đường"}
                <DragonIcon size={28} color="#a78bfa" />
                <DragonIcon size={32} color="#a78bfa" />
                <LanternIcon size={28} color="#a78bfa" />
                <PeachBlossomIcon size={22} color="#a78bfa" />
                <PeachBlossomIcon size={26} color="#a78bfa" />
                <LionIcon size={30} color="#a78bfa" />
              </h3>
              {slide.subtitle && (
                <p style={{ color: '#faf8f5', textShadow: '0 1px 2px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <PeachBlossomIcon size={18} color="#a78bfa" />
                  {slide.subtitle}
                  <LanternIcon size={20} color="#a78bfa" />
                </p>
              )}
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default Banner;
