import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from "./components/Decorations";
import { auth, storage } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ADMIN_EMAILS } from "./config";
import "./PerformanceServices.css";

const defaultServices = [
    { title: "Múa Sư Tử Truyền Thống", img: "/services/su-tu-truyen-thong.jpg" },
    { title: "Múa Song Lân", img: "/services/song-lan.jpg" },
    { title: "Múa Tam Lân", img: "/services/tam-lan.jpg" },
    { title: "Múa Tứ Lân", img: "/services/tu-lan.jpg" },
    { title: "Múa Ngũ Lân", img: "/services/ngu-lan.jpg" },
    { title: "Múa Rồng Nghệ Thuật", img: "/services/rong-nghe-thuat.jpg" },
    { title: "Múa Lân Địa Bửu", img: "/services/lan-dia-buu.jpg" },
];

export default function PerformanceServices() {
    const [services, setServices] = useState(defaultServices);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [uploadingIndex, setUploadingIndex] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    const isAdminUser = user && ADMIN_EMAILS.includes(user.email);

    const handleChange = (index, field, value) => {
        const updated = [...services];
        updated[index][field] = value;
        setServices(updated);
    };

    const handleImageUpload = async (index, e) => {
        if (!user || !isAdminUser) return;
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh.");
            return;
        }
        setUploadingIndex(index);
        try {
            const storageRef = ref(
                storage,
                `performance-services/${user.uid}/${Date.now()}-${file.name}`
            );
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            handleChange(index, "img", url);
        } catch (err) {
            console.error(err);
            alert("Upload ảnh lỗi ❌");
        } finally {
            setUploadingIndex(null);
            e.target.value = "";
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
            <Header />
            <section className="performance-section">
            <Container>
                <div className="text-center mb-5 lgd-pattern-bg">
                    <FestivalStrip iconSize={24} />
                    <h2 className="display-4 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2 flex-wrap">
                      <PeachBlossomIcon size={34} color="#e879a0" />
                      <PeachBlossomIcon size={28} color="#e879a0" />
                      <LanternIcon size={36} color="#eab308" />
                      <DragonIcon size={40} color="#eab308" />
                      <DragonIcon size={36} color="#eab308" />
                      DỊCH VỤ BIỂU DIỄN
                      <DragonIcon size={36} color="#eab308" />
                      <DragonIcon size={40} color="#eab308" />
                      <LanternIcon size={36} color="#eab308" />
                      <PeachBlossomIcon size={28} color="#e879a0" />
                      <PeachBlossomIcon size={34} color="#e879a0" />
                      <LionIcon size={38} color="#eab308" />
                    </h2>
                    <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
                        Các tiết mục Lân – Sư – Rồng chuyên nghiệp, phù hợp lễ hội, khai trương, sự kiện và chương trình nghệ thuật.
                    </p>

                    {/* Chỉ admin đăng nhập mới thấy nút bật chế độ Admin */}
                    {isAdminUser && (
                        <Button
                            variant={isAdmin ? "outline-light" : "danger"}
                            className="mt-4"
                            onClick={() => setIsAdmin(!isAdmin)}
                        >
                            {isAdmin ? "Tắt chế độ Admin" : "Bật chế độ Admin"}
                        </Button>
                    )}
                </div>

                <Row className="g-4 justify-content-center">
                    {services.map((service, index) => (
                        <Col key={index} sm={6} lg={4}>
                            <Card className="service-card h-100">
                                <div className="service-img-container">
                                    <Card.Img
                                        variant="top"
                                        src={service.img}
                                        alt={service.title}
                                        className="service-img"
                                    />
                                </div>

                                <Card.Body className="text-center p-4">
                                    {isAdmin ? (
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
                                                className="admin-input form-control-sm"
                                                value={service.img}
                                                onChange={(e) => handleChange(index, "img", e.target.value)}
                                                placeholder="Đường dẫn ảnh"
                                            />
                                            <Form.Group className="mt-2">
                                                <Form.Label className="small text-muted">Hoặc upload ảnh</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(index, e)}
                                                    disabled={uploadingIndex !== null}
                                                    className="form-control-sm"
                                                />
                                                {uploadingIndex === index && (
                                                    <small className="text-warning">Đang tải lên...</small>
                                                )}
                                            </Form.Group>
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
