import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from "./components/Decorations";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ADMIN_EMAILS } from "./config";
import "./PerformanceServices.css";

const withPosition = (s) => ({ ...s, position: s.position ?? { x: 50, y: 50 } });

const performances = [
    {
        id: "song_lan",
        title: "Song Lân (Hai Lân)",
        duration: "7 – 8 phút",
        props: "2 đầu lân, ông Địa",
        sound: "Trống lỗ – xõa",
        description: "Song Lân là tiết mục với hai chú lân biểu diễn phối hợp nhịp nhàng theo tiếng trống rộn ràng. Hai con lân thể hiện các động tác chào hỏi, vui đùa, tranh mồi và tương tác cùng ông Địa, mang đến không khí sôi động và vui tươi. Tiết mục tượng trưng cho song hỷ lâm môn, may mắn và phát tài, thường được biểu diễn trong các dịp khai trương, khánh thành hoặc lễ hội."
    },
    {
        id: "tam_lan",
        title: "Tam Lân (Ba Lân)",
        duration: "7 – 8 phút",
        props: "3 đầu lân, ông Địa",
        sound: "Trống lỗ – xõa",
        description: "Tam Lân tượng trưng cho tam tài: Thiên – Địa – Nhân, mang ý nghĩa hòa hợp và thịnh vượng. Ba chú lân biểu diễn theo đội hình linh hoạt, kết hợp các động tác di chuyển, tương tác và tạo hình đẹp mắt theo nhịp trống. Tiết mục mang lại không khí rộn ràng và sôi động cho các chương trình lễ hội hoặc sự kiện."
    },
    {
        id: "tu_lan",
        title: "Tứ Lân (Bốn Lân)",
        duration: "7 – 8 phút",
        props: "4 đầu lân, ông Địa",
        sound: "Trống lỗ – xõa",
        description: "Tứ Lân tượng trưng cho bốn phương tụ hội – bốn phương phát tài. Bốn chú lân biểu diễn đồng bộ theo nhịp trống mạnh mẽ, tạo nên đội hình hoành tráng và đầy màu sắc. Sự phối hợp nhịp nhàng giữa các chú lân mang đến không khí lễ hội sôi động và ấn tượng cho khán giả."
    },
    {
        id: "ngu_lan",
        title: "Ngũ Lân (Năm Lân)",
        duration: "7 – 8 phút",
        props: "5 đầu lân, ông Địa",
        sound: "Trống lỗ – xõa",
        description: "Ngũ Lân đại diện cho ngũ phúc: Phú – Quý – Thọ – Khang – Ninh. Năm chú lân cùng biểu diễn tạo nên màn trình diễn rực rỡ và đầy năng lượng. Tiết mục mang ý nghĩa mang tài lộc, may mắn và thịnh vượng đến cho gia chủ hoặc đơn vị tổ chức."
    },
    {
        id: "dia_buu",
        title: "Múa Lân Địa Bửu",
        duration: "7 – 8 phút",
        props: "Đầu lân, ông Địa, bục biểu diễn, ghế và các đạo cụ địa bửu (lì xì, lộc đỏ, cuộn lụa, trái cây...)",
        sound: "Trống lỗ – xõa",
        description: "Múa Lân Địa Bửu là tiết mục mang đậm nét truyền thống và ý nghĩa phong thủy. Trong màn biểu diễn, chú lân sẽ tìm kiếm và khai mở 'địa bửu' tượng trưng cho tài lộc và may mắn. Các động tác được thực hiện linh hoạt trên bục và ghế, thể hiện sự khéo léo và sức mạnh của người biểu diễn trước khi mang lộc trao cho gia chủ hoặc đơn vị tổ chức."
    },
    {
        id: "rong",
        title: "Múa Rồng Nghệ Thuật",
        duration: "7 – 8 phút",
        props: "Rồng dài",
        sound: "Trống lỗ – xõa",
        description: "Múa rồng nghệ thuật là màn biểu diễn tập thể với hình ảnh con rồng uốn lượn mạnh mẽ theo nhịp trống. Các nghệ nhân điều khiển thân rồng tạo nên các động tác xoay vòng, uốn lượn và cuộn sóng đẹp mắt, thể hiện sức mạnh, sự thịnh vượng và tinh thần đoàn kết."
    },
    {
        id: "su_tu",
        title: "Múa Sư Tử Truyền Thống (Kết Hợp Múa Lửa)",
        duration: "7 – 8 phút",
        props: "Đầu sư tử, dụng cụ múa lửa",
        sound: "Trống lỗ – xõa",
        description: "Múa sư tử truyền thống mang phong cách mạnh mẽ và đậm chất võ thuật. Tiết mục kết hợp với màn múa lửa tạo nên hiệu ứng thị giác ấn tượng và thu hút. Sự kết hợp giữa những động tác uyển chuyển của sư tử và ngọn lửa rực cháy mang đến không khí sôi động cho các chương trình lễ hội và biểu diễn nghệ thuật."
    }
];


const defaultServices = [
    { id: "su_tu", title: "Múa Sư Tử Truyền Thống", img: "/images/sư_tử.jpg", position: { x: 50, y: 50 } },
    { id: "song_lan", title: "Múa Song Lân", img: "/images/song_lân.jpg", position: { x: 50, y: 50 } },
    { id: "tam_lan", title: "Múa Tam Lân", img: "/images/tam-lân.jpg", position: { x: 50, y: 50 } },
    { id: "tu_lan", title: "Múa Tứ Lân", img: "/images/tứ_lân.jpg", position: { x: 50, y: 50 } },
    { id: "ngu_lan", title: "Múa Ngũ Lân", img: "/images/ngũ_lân.jpg", position: { x: 50, y: 50 } },
    { id: "rong", title: "Múa Rồng Nghệ Thuật", img: "/images/múa_rồng.jpg", position: { x: 50, y: 50 } },
    { id: "dia_buu", title: "Múa Lân Địa Bửu", img: "/images/địa_bửu.jpg", position: { x: 50, y: 50 } },
];

const CONFIG_KEY = "performanceServices";

export default function PerformanceServices() {
    const [services, setServices] = useState(defaultServices);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

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

    const saveToFirestore = useCallback((nextServices) => {
        setDoc(doc(db, "config", CONFIG_KEY), { services: nextServices }).catch((err) =>
            console.error("Save performance services error:", err)
        );
    }, []);

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
        <div style={{ minHeight: "100vh", background: "var(--lgd-black)" }}>
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

                    <Row className="g-4">
                        {/* Left Column: Tab List */}
                        <Col lg={4}>
                            <div className="performance-tabs">
                                {services.map((service, index) => (
                                    <button
                                        key={index}
                                        className={`performance-tab ${activeTab === index ? 'active' : ''}`}
                                        onClick={() => setActiveTab(index)}
                                    >
                                        {/* Find corresponding detailed performance info locally if standard service */}
                                        {isAdmin && isAdminUser ? (
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    className="admin-input form-control-sm mb-0 w-75"
                                                    value={service.title}
                                                    onChange={(e) => handleChange(index, "title", e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder="Tiêu đề"
                                                />
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(index);
                                                    }}
                                                >
                                                    Xóa
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <span>{service.title}</span>
                                                <span className="ms-2">›</span>
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </Col>

                        {/* Right Column: Tab Details */}
                        <Col lg={8}>
                            {services[activeTab] && (
                                <div className="performance-details-container">
                                    <div
                                        className="performance-details-img-wrapper"
                                        onMouseDown={(e) => handleServiceImageMouseDown(activeTab, e)}
                                        style={{
                                            cursor: isAdmin && isAdminUser ? (dragService?.index === activeTab ? "grabbing" : "grab") : undefined,
                                            userSelect: "none",
                                            position: "relative",
                                        }}
                                    >
                                        <img
                                            src={
                                                failedImgKeys.has(`${activeTab}-${services[activeTab].img}`)
                                                    ? defaultServices[0].img
                                                    : (services[activeTab].img || defaultServices[0].img)
                                            }
                                            alt={services[activeTab].title}
                                            className="performance-details-img"
                                            style={{
                                                objectPosition: `${services[activeTab].position?.x ?? 50}% ${services[activeTab].position?.y ?? 50}%`,
                                            }}
                                            onError={() => setFailedImgKeys((prev) => new Set(prev).add(`${activeTab}-${services[activeTab].img}`))}
                                        />
                                        {isAdmin && isAdminUser && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: 10,
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    background: "rgba(0,0,0,0.75)",
                                                    color: "#a78bfa",
                                                    padding: "4px 12px",
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    pointerEvents: "none",
                                                    zIndex: 10
                                                }}
                                            >
                                                Kéo để chỉnh vị trí ảnh
                                            </div>
                                        )}
                                    </div>

                                    <div className="performance-details-content">
                                        {isAdmin && isAdminUser ? (
                                            <div className="mb-4">
                                                <Form.Control
                                                    type="text"
                                                    className="admin-input form-control-sm mb-2"
                                                    value={services[activeTab].img}
                                                    onChange={(e) => handleChange(activeTab, "img", e.target.value)}
                                                    placeholder="Link ảnh"
                                                />
                                                <small className="text-muted">Đường dẫn ảnh cho dịch vụ này</small>
                                            </div>
                                        ) : null}

                                        <h3 className="performance-detail-title">{services[activeTab].title}</h3>

                                        {/* Look up static detailed info */}
                                        {(() => {
                                            const perfInfo = performances.find(
                                                p => p.id === services[activeTab].id
                                            );
                                            if (perfInfo) {
                                                return (
                                                    <>
                                                        <div className="performance-info-row">
                                                            <div className="performance-info-label">Thời lượng:</div>
                                                            <div className="performance-info-value">{perfInfo.duration}</div>
                                                        </div>
                                                        <div className="performance-info-row">
                                                            <div className="performance-info-label">Nhân sự/Đạo cụ:</div>
                                                            <div className="performance-info-value">{perfInfo.props}</div>
                                                        </div>
                                                        <div className="performance-info-row">
                                                            <div className="performance-info-label">Âm thanh:</div>
                                                            <div className="performance-info-value">{perfInfo.sound}</div>
                                                        </div>
                                                        <div className="performance-description">
                                                            {perfInfo.description}
                                                        </div>
                                                    </>
                                                );
                                            } else {
                                                // Fallback if no matching standard performance
                                                return (
                                                    <div className="performance-description text-center py-4">
                                                        <p>Đang cập nhật thêm thông tin chi tiết về tiết mục này.</p>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
            <Footer />
        </div>
    );
}
