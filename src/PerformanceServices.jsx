import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from "./components/Decorations";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ADMIN_EMAILS } from "./config";
import "./PerformanceServices.css";

const withPosition = (s) => ({ ...s, position: s.position ?? { x: 50, y: 50 } });

const defaultServices = [
    { title: "Múa Sư Tử Truyền Thống", img: "/images/sư_tử.jpg", position: { x: 50, y: 50 } },
    { title: "Múa Song Lân", img: "/images/song_lân.jpg", position: { x: 50, y: 50 } },
    { title: "Múa Tam Lân", img: "/images/tam-lân.jpg", position: { x: 50, y: 50 } },
    { title: "Múa Tứ Lân", img: "/images/tứ_lân.jpg", position: { x: 50, y: 50 } },
    { title: "Múa Ngũ Lân", img: "/images/ngũ_lân.jpg", position: { x: 50, y: 50 } },
    { title: "Múa Rồng Nghệ Thuật", img: "/images/múa_rồng.jpg", position: { x: 50, y: 50 } },
    { title: "Múa Lân Địa Bửu", img: "/images/địa_bửu.jpg", position: { x: 50, y: 50 } },
];

const CONFIG_KEY = "performanceServices";

export default function PerformanceServices() {
    const [services, setServices] = useState(defaultServices);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    useEffect(() => {
        let cancelled = false;
        getDoc(doc(db, "config", CONFIG_KEY))
            .then((snapshot) => {
                if (cancelled) return;
                if (snapshot.exists() && Array.isArray(snapshot.data().services) && snapshot.data().services.length > 0) {
                    setServices(snapshot.data().services.map(withPosition));
                }
            })
            .catch(() => setServices(defaultServices));
        return () => { cancelled = true; };
    }, []);

    const isAdminUser = user && ADMIN_EMAILS.includes(user.email);

    const handleChange = (index, field, value) => {
        if (!isAdminUser) return;
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
    };

    const saveToFirestore = (nextServices) => {
        setDoc(doc(db, "config", CONFIG_KEY), { services: nextServices }).catch((err) =>
            console.error("Save performance services error:", err)
        );
    };

    const handleSave = () => {
        if (!isAdminUser) return;
        saveToFirestore(services);
        alert("Đã lưu.");
    };

    const handleAdd = () => {
        if (!isAdminUser) return;
        const newService = { title: "Dịch vụ mới", img: "/images/sư_tử.jpg", position: { x: 50, y: 50 } };
        const next = [...services, newService];
        setServices(next);
        saveToFirestore(next);
    };

    const [dragService, setDragService] = useState(null);
    const [failedImgKeys, setFailedImgKeys] = useState(() => new Set());
    const sensitivity = 0.2;

    const handleServiceImageMouseDown = useCallback((index, e) => {
        if (!isAdmin || !isAdminUser || e.button !== 0) return;
        e.preventDefault();
        const svc = services[index];
        const pos = svc.position ?? { x: 50, y: 50 };
        setDragService({ index, startX: e.clientX, startY: e.clientY, startPX: pos.x, startPY: pos.y });
    }, [isAdmin, isAdminUser, services]);

    useEffect(() => {
        if (dragService == null) return;
        const { index, startX, startY, startPX, startPY } = dragService;
        const handleMove = (e) => {
            const dx = (e.clientX - startX) * sensitivity;
            const dy = (e.clientY - startY) * sensitivity;
            setServices((prev) => {
                const next = prev.map((s, i) =>
                    i === index
                        ? { ...s, position: { x: Math.min(100, Math.max(0, startPX + dx)), y: Math.min(100, Math.max(0, startPY + dy)) } }
                        : s
                );
                return next;
            });
        };
        const handleUp = () => {
            setServices((prev) => {
                saveToFirestore(prev);
                return prev;
            });
            setDragService(null);
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [dragService, saveToFirestore]);

    const handleDelete = (index) => {
        if (!isAdminUser) return;
        if (!window.confirm("Xóa dịch vụ này?")) return;
        const next = services.filter((_, i) => i !== index);
        setServices(next);
        saveToFirestore(next.length ? next : defaultServices);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
            <Header />
            <section className="performance-section">
            <Container>
                <div className="text-center mb-5 lgd-pattern-bg">
                    <FestivalStrip iconSize={24} />
                    <h2 className="display-4 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2 flex-wrap">
                      <PeachBlossomIcon size={34} color="#a78bfa" />
                      <PeachBlossomIcon size={28} color="#a78bfa" />
                      <LanternIcon size={36} color="#a78bfa" />
                      <DragonIcon size={40} color="#a78bfa" />
                      <DragonIcon size={36} color="#a78bfa" />
                      DỊCH VỤ BIỂU DIỄN
                      <DragonIcon size={36} color="#a78bfa" />
                      <DragonIcon size={40} color="#a78bfa" />
                      <LanternIcon size={36} color="#a78bfa" />
                      <PeachBlossomIcon size={28} color="#a78bfa" />
                      <PeachBlossomIcon size={34} color="#a78bfa" />
                      <LionIcon size={38} color="#a78bfa" />
                    </h2>
                    <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
                        Các tiết mục Lân – Sư – Rồng chuyên nghiệp, phù hợp lễ hội, khai trương, sự kiện và chương trình nghệ thuật.
                    </p>

                    {/* Chỉ admin mới thấy: bật chế độ Admin, Thêm dịch vụ, Lưu */}
                    {isAdminUser && (
                        <div className="d-flex align-items-center justify-content-center gap-2 mt-4 flex-wrap">
                            <Button
                                variant={isAdmin ? "outline-light" : "danger"}
                                onClick={() => setIsAdmin(!isAdmin)}
                            >
                                {isAdmin ? "Tắt chế độ Admin" : "Bật chế độ Admin"}
                            </Button>
                            {isAdmin && (
                                <>
                                    <Button variant="outline-success" onClick={handleAdd}>
                                        Thêm dịch vụ
                                    </Button>
                                    <Button variant="outline-warning" onClick={handleSave}>
                                        Lưu thay đổi
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <Row className="g-4 justify-content-center">
                    {services.map((service, index) => (
                        <Col key={index} sm={6} lg={4}>
                            <Card className="service-card h-100">
                                <div
                                    className="service-img-container"
                                    onMouseDown={(e) => handleServiceImageMouseDown(index, e)}
                                    style={{
                                        cursor: isAdmin && isAdminUser ? (dragService?.index === index ? "grabbing" : "grab") : undefined,
                                        userSelect: "none",
                                        position: "relative",
                                    }}
                                >
                                    <Card.Img
                                        variant="top"
                                        src={
                                            failedImgKeys.has(`${index}-${service.img}`)
                                                ? defaultServices[0].img
                                                : (service.img || defaultServices[0].img)
                                        }
                                        alt={service.title}
                                        className="service-img"
                                        style={{
                                            objectPosition: `${service.position?.x ?? 50}% ${service.position?.y ?? 50}%`,
                                        }}
                                        onError={() => setFailedImgKeys((prev) => new Set(prev).add(`${index}-${service.img}`))}
                                    />
                                    {isAdmin && isAdminUser && (
                                        <div
                                            className="service-img-hint"
                                            style={{
                                                position: "absolute",
                                                bottom: 6,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                background: "rgba(0,0,0,0.75)",
                                                color: "#a78bfa",
                                                padding: "2px 8px",
                                                borderRadius: 4,
                                                fontSize: 11,
                                                pointerEvents: "none",
                                            }}
                                        >
                                            Kéo để chỉnh ảnh
                                        </div>
                                    )}
                                </div>

                                <Card.Body className="text-center p-4">
                                    {isAdmin && isAdminUser ? (
                                        <>
                                            <Form.Control
                                                type="text"
                                                className="admin-input"
                                                value={service.title}
                                                onChange={(e) => handleChange(index, "title", e.target.value)}
                                                placeholder="Tiêu đề"
                                            />
                                            <Form.Control
                                                type="text"
                                                className="admin-input form-control-sm mt-2"
                                                value={service.img}
                                                onChange={(e) => handleChange(index, "img", e.target.value)}
                                                placeholder="Link ảnh (hoặc đường dẫn ảnh fix cứng)"
                                            />
                                            <small className="text-muted d-block mt-1">Ảnh: link hoặc ảnh mặc định</small>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => handleDelete(index)}
                                            >
                                                Xóa
                                            </Button>
                                        </>
                                    ) : (
                                        <Card.Title className="service-title mb-0">{service.title}</Card.Title>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
            <Footer />
        </div>
    );
}
