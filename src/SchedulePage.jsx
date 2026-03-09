import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Button, Form, Modal } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ADMIN_EMAILS } from "./config";
import LunarCalendar from "./components/LunarCalendar";

const CONFIG_KEY = "schedule";

const defaultItems = [
  {
    id: Date.now(),
    date: "",
    time: "",
    location: "",
    content: "",
    note: "",
  },
];

export default function SchedulePage() {
  const [items, setItems] = useState(defaultItems);
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // default to today
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const isAdminUser = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "config", CONFIG_KEY))
      .then((snapshot) => {
        if (cancelled) return;
        if (snapshot.exists() && Array.isArray(snapshot.data().items) && snapshot.data().items.length > 0) {
          setItems(snapshot.data().items);
        } else {
          setItems([]);
        }
      })
      .catch(() => setItems([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const saveToFirestore = useCallback((nextItems) => {
    setDoc(doc(db, "config", CONFIG_KEY), { items: nextItems }).then(() => {
      console.log("Saved to database:", nextItems);
    }).catch((err) => {
      console.error("Save schedule error:", err);
      alert("Lỗi khi lưu Firestore: " + err.message);
    });
  }, []);

  const handleChange = (id, field, value) => {
    if (!isAdminUser) return;
    setItems((prevItems) => {
      const updated = prevItems.map(it => it.id === id ? { ...it, [field]: value } : it);
      return updated;
    });
  };

  const handleAdd = () => {
    if (!isAdminUser) return;
    const newItem = {
      id: Date.now(),
      date: selectedDate, // Default new item to the currently selected calendar date
      time: "",
      location: "",
      content: "",
      note: "",
    };
    setItems((prev) => {
      const next = [...prev, newItem];
      saveToFirestore(next);
      return next;
    });
  };

  const handleDelete = (id) => {
    if (!isAdminUser) return;
    if (!window.confirm("Xóa lịch này?")) return;
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id);
      saveToFirestore(next);
      return next;
    });
  };

  const handleSave = () => {
    if (!isAdminUser) return;
    setItems((prev) => {
      saveToFirestore(prev);
      return prev;
    });
    alert("Đã lưu lịch biểu diễn thành công.");
  };

  const handleModalClose = () => {
    if (isAdminMode && isAdminUser) {
      setItems((prev) => {
        saveToFirestore(prev);
        return prev;
      });
    }
    setShowModal(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  // Filter items for the selected Date
  const selectedItems = items.filter((it) => it.date === selectedDate);

  // Sort items by time (later times on top, earlier times below)
  selectedItems.sort((a, b) => {
    const timeA = a.time || "";
    const timeB = b.time || "";
    if (timeA < timeB) return 1;
    if (timeA > timeB) return -1;
    return 0;
  });

  // Format selected date nicely
  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--lgd-black)" }}>
      <Header />
      <section className="performance-section pb-5 pt-5">
        <Container>
          <div className="text-center mb-4 lgd-pattern-bg">
            <h2 className="display-4 fw-bold mb-3">LỊCH BIỂU DIỄN</h2>
            <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "640px" }}>
              Xem các lịch biểu diễn dự kiến của Lục Gia Đường. Chọn một ngày trên lịch để xem chi tiết.
            </p>

            {isAdminUser && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-3 flex-wrap">
                <Button
                  variant={isAdminMode ? "outline-light" : "primary"}
                  onClick={() => setIsAdminMode((v) => !v)}
                >
                  {isAdminMode ? "Tắt chế độ Admin" : "Bật chế độ Admin"}
                </Button>
                {isAdminMode && (
                  <>
                    <Button variant="outline-warning" onClick={handleSave}>
                      Lưu tất cả thay đổi
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          <Row className="g-4">
            {/* Calendar Column */}
            <Col lg={10} xl={8} className="mx-auto">
              <div className="bg-dark rounded shadow" style={{ border: '1px solid var(--lgd-gray-border)' }}>
                <LunarCalendar
                  items={items}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>
            </Col>
          </Row>

          <Modal
            show={showModal}
            onHide={handleModalClose}
            size="lg"
            centered
            contentClassName="bg-dark text-light border border-secondary"
          >
            <Modal.Header closeButton closeVariant="white" className="border-bottom border-secondary" style={{ backgroundColor: 'var(--lgd-black-card)' }}>
              <Modal.Title className="fw-bold lgd-title-gold">Lịch: {formattedSelectedDate}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: 'var(--lgd-black)' }}>

              {isAdminMode && isAdminUser && (
                <div className="mb-4 text-center pb-3 border-bottom border-secondary">
                  <Button variant="success" onClick={handleAdd}>
                    + Thêm lịch cho ngày {new Date(selectedDate).toLocaleDateString("vi-VN")}
                  </Button>
                </div>
              )}

              {selectedItems.length === 0 ? (
                <div className="text-center py-4 text-secondary">
                  <p>Không có lịch biểu diễn nào trong ngày này.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="p-3 rounded shadow-sm position-relative" style={{ backgroundColor: 'var(--lgd-black-card)', border: '1px solid var(--lgd-gray-border)' }}>
                      {isAdminMode && isAdminUser ? (
                        <div className="admin-editor-form">
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold text-secondary">Giờ</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              placeholder="Ví dụ: 18:00"
                              value={item.time || ""}
                              onChange={(e) => handleChange(item.id, "time", e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold text-secondary">Địa điểm</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              placeholder="Địa điểm biểu diễn"
                              value={item.location || ""}
                              onChange={(e) => handleChange(item.id, "location", e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold text-secondary">Nội dung</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              placeholder="Tên chương trình / dịp"
                              value={item.content || ""}
                              onChange={(e) => handleChange(item.id, "content", e.target.value)}
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">Ghi chú</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              size="sm"
                              placeholder="Ghi chú thêm (nếu có)"
                              value={item.note || ""}
                              onChange={(e) => handleChange(item.id, "note", e.target.value)}
                            />
                          </Form.Group>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            Xóa lịch khoản này
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h5 className="fw-bold mb-2" style={{ color: 'var(--lgd-accent-light)' }}>
                            {item.content || "Chương trình biểu diễn"}
                          </h5>
                          <div className="mb-1 text-light">
                            <i className="bi bi-clock me-2 text-warning"></i>
                            <strong>Giờ:</strong> {item.time || "Đang cập nhật"}
                          </div>
                          <div className="mb-1 text-light">
                            <i className="bi bi-geo-alt me-2 text-success"></i>
                            <strong>Địa điểm:</strong> {item.location || "Đang cập nhật"}
                          </div>
                          {item.note && (
                            <div className="mt-2 text-secondary small p-2 rounded" style={{ backgroundColor: 'var(--lgd-black-soft)' }}>
                              <strong>Ghi chú:</strong> {item.note}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>
            {isAdminMode && isAdminUser && (
              <Modal.Footer className="border-secondary" style={{ backgroundColor: 'var(--lgd-black-card)' }}>
                <Button variant="secondary" onClick={handleModalClose}>Đóng</Button>
                <Button variant="warning" onClick={() => { handleSave(); setShowModal(false); }}>
                  Lưu thay đổi
                </Button>
              </Modal.Footer>
            )}
          </Modal>

        </Container>
      </section>
      <Footer />

      <style>{`
        /* Scoped styles for admin forms */
        .admin-editor-form input, .admin-editor-form textarea {
           border-color: var(--lgd-gray-border);
           background-color: var(--lgd-black);
           color: var(--lgd-text);
        }
        .admin-editor-form input:focus, .admin-editor-form textarea:focus {
           border-color: var(--lgd-purple);
           box-shadow: 0 0 0 0.2rem var(--lgd-purple-glow);
           background-color: var(--lgd-black);
           color: var(--lgd-text);
        }
      `}</style>
    </div>
  );
}

