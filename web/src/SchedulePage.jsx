import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Row, Col, Button, Form, Modal, Spinner } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthContext } from "./AuthContext";
import { API_BASE_URL } from "./config";
import LunarCalendar from "./components/LunarCalendar";
import { extractMongoId } from "./Introduction";
import "./SchedulePage.css";

export default function SchedulePage() {
  const { token, isAdmin } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  const [showModal, setShowModal] = useState(false);

  // State form thêm/sửa lịch
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    location: '',
    description: '',
    note: '',
    coordinates: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Tải danh sách lịch từ Backend (MongoDB Atlas)
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/schedules`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const normalized = data.data.map((item, idx) => {
          const validId = extractMongoId(item._id || item.id, `sched_${idx}`);
          return {
            ...item,
            _id: validId,
            id: validId,
          };
        });
        setItems(normalized);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch biểu diễn:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Tạo URL chỉ đường Google Maps (Chỉ hiển thị khi Admin có nhập tọa độ / link bản đồ)
  const getDirectionsUrl = (item) => {
    if (!item) return null;
    const coords = (item.coordinates || item.mapUrl || '').trim();
    if (!coords) return null;

    if (coords.startsWith('http://') || coords.startsWith('https://')) {
      return coords;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;
  };

  // Mở modal thêm lịch mới cho ngày đang chọn
  const handleOpenAddModal = (dateStr) => {
    const targetDate = dateStr || selectedDate;
    setEditingItem(null);
    setScheduleForm({
      date: targetDate,
      time: "",
      location: "",
      description: "",
      phone: "",
      note: "",
      coordinates: "",
    });
    setShowEditModal(true);
  };

  // Mở modal sửa lịch
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setScheduleForm({
      date: item.date || selectedDate,
      time: item.time || "",
      location: item.location || "",
      description: item.description || item.content || "",
      phone: item.phone || "",
      note: item.note || "",
      coordinates: item.coordinates || item.mapUrl || "",
    });
    setShowEditModal(true);
  };

  // Lưu lịch (Thêm mới hoặc Cập nhật) vào MongoDB Atlas
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!token || !isAdmin) {
      alert("Bạn cần đăng nhập bằng tài khoản Quản trị viên (Admin) để thực hiện.");
      return;
    }

    if (!scheduleForm.date || !scheduleForm.location.trim() || !scheduleForm.description.trim()) {
      alert("Vui lòng điền đầy đủ Ngày, Địa điểm và Mô tả chương trình.");
      return;
    }

    const editId = editingItem ? extractMongoId(editingItem._id || editingItem.id) : null;

    try {
      setIsSaving(true);
      const url = editId
        ? `${API_BASE_URL}/schedules/${editId}`
        : `${API_BASE_URL}/schedules`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleForm),
      });

      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        fetchSchedules();
        alert(editId ? "🎉 Đã cập nhật lịch biểu diễn!" : "🎉 Đã thêm lịch biểu diễn thành công!");
      } else {
        alert(data.message || "Lỗi khi lưu lịch.");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Xóa lịch khỏi MongoDB Atlas
  const handleDeleteSchedule = async (id) => {
    if (!isAdmin || !token) return;
    const cleanScheduleId = extractMongoId(id);
    if (!cleanScheduleId) {
      alert("Không tìm thấy mã định danh lịch hợp lệ.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch biểu diễn này?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/schedules/${cleanScheduleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
        alert("Đã xóa lịch biểu diễn thành công.");
      } else {
        alert(data.message || "Không thể xóa lịch.");
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  // Lọc lịch theo ngày được chọn
  const selectedItems = items.filter((it) => it.date === selectedDate);

  // Sắp xếp theo giờ
  selectedItems.sort((a, b) => {
    const timeA = a.time || "";
    const timeB = b.time || "";
    if (timeA && timeB) return timeA.localeCompare(timeB);
    if (!timeA && timeB) return -1;
    if (timeA && !timeB) return 1;
    return 0;
  });

  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc", color: "#1e1b4b" }}>
      <Header />

      <section className="performance-section pb-5 pt-5">
        <Container>
          <div className="text-center mb-4">
            <h2 className="display-5 fw-bold mb-3" style={{ color: "#7c3aed" }}>
              LỊCH BIỂU DIỄN
            </h2>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: "640px" }}>
              Xem các lịch biểu diễn dự kiến của Đoàn Lân Sư Rồng Lục Gia Đường. Chọn một ngày trên lịch để xem chi tiết.
            </p>

            {isAdmin && (
              <div className="d-flex align-items-center justify-content-center gap-3 mt-3 flex-wrap">
                <Button
                  variant={isAdminMode ? "outline-primary" : "primary"}
                  className="fw-bold"
                  onClick={() => setIsAdminMode((v) => !v)}
                >
                  {isAdminMode ? "🔒 Tắt chế độ Admin" : "⚙️ Quản trị lịch"}
                </Button>

                {isAdminMode && (
                  <Button
                    variant="success"
                    className="fw-bold"
                    onClick={() => handleOpenAddModal(selectedDate)}
                  >
                    ➕ Thêm lịch cho ngày {new Date(selectedDate).toLocaleDateString("vi-VN")}
                  </Button>
                )}
              </div>
            )}
          </div>

          <Row className="g-4">
            <Col lg={10} xl={8} className="mx-auto">
              <div className="bg-white rounded shadow-sm p-3" style={{ border: "1px solid #e9d5ff" }}>
                {loading ? (
                  <div className="text-center py-5 text-secondary">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải dữ liệu lịch...</p>
                  </div>
                ) : (
                  <LunarCalendar
                    items={items}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                )}

                {/* Bảng chú thích ký hiệu lịch biểu diễn */}
                <div
                  className="mt-3 p-3 rounded-3 d-flex flex-column gap-2"
                  style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff" }}
                >
                  {/* Chú thích 1: Dấu chấm */}
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: "28px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "#7c3aed",
                          display: "inline-block",
                          boxShadow: "0 0 6px rgba(124, 58, 237, 0.6)",
                        }}
                      />
                    </div>
                    <span className="small" style={{ color: "#1e1b4b" }}>
                      <strong>Dấu chấm tím:</strong> Có lịch biểu diễn
                    </span>
                  </div>

                  {/* Chú thích 2: Ô màu tím */}
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: "28px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          backgroundColor: "#7c3aed",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        15
                      </span>
                    </div>
                    <span className="small" style={{ color: "#1e1b4b" }}>
                      <strong>Ô tím đậm:</strong> Ngày đang chọn xem
                    </span>
                  </div>

                  {/* Chú thích 3: Ô viền tím (Hôm nay) */}
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: "28px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          backgroundColor: "#ede9fe",
                          border: "2px solid #7c3aed",
                          color: "#7c3aed",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          fontWeight: "bold",
                        }}
                      >
                        Nay
                      </span>
                    </div>
                    <span className="small" style={{ color: "#1e1b4b" }}>
                      <strong>Ô viền tím:</strong> Ngày hôm nay
                    </span>
                  </div>

                  {/* Chú thích 4: Dương lịch & Âm lịch */}
                  <div className="d-flex align-items-center gap-2 pt-1 mt-1 border-top" style={{ borderColor: "#e9d5ff" }}>
                    <div style={{ width: "28px", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "1rem" }}>ℹ️</span>
                    </div>
                    <span className="small text-muted" style={{ fontSize: "0.82rem" }}>
                      Số lớn: <strong style={{ color: "#1e1b4b" }}>Dương lịch</strong> • Số nhỏ góc phải: <strong style={{ color: "#7c3aed" }}>Âm lịch</strong>
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Modal xem danh sách lịch của ngày được chọn */}
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e9d5ff" }}>
              <Modal.Title className="fw-bold" style={{ color: "#7c3aed" }}>
                📅 Lịch: {formattedSelectedDate}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
              {isAdmin && isAdminMode && (
                <div className="mb-4 text-center pb-3 border-bottom" style={{ borderColor: "#f1f5f9" }}>
                  <Button
                    variant="success"
                    onClick={() => {
                      setShowModal(false);
                      handleOpenAddModal(selectedDate);
                    }}
                  >
                    ➕ Thêm lịch mới cho ngày này
                  </Button>
                </div>
              )}

              {selectedItems.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0">Không có lịch biểu diễn nào trong ngày này.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="schedule-card mb-1"
                    >
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                        <h5 className="fw-bold mb-0" style={{ color: "#7c3aed" }}>
                          {item.description || item.content || "Chương trình biểu diễn"}
                        </h5>
                        {isAdmin && isAdminMode && (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {
                                setShowModal(false);
                                handleOpenEditModal(item);
                              }}
                            >
                              ✏️ Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteSchedule(item._id || item.id)}
                            >
                              🗑️ Xóa
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="mb-2" style={{ color: "#334155" }}>
                        <i className="bi bi-clock me-2 text-primary"></i>
                        <strong>Giờ:</strong> {item.time || "Chưa xác định"}
                      </div>

                      {item.phone && (
                        <div className="mb-2" style={{ color: "#334155" }}>
                          <i className="bi bi-telephone-fill me-2 text-success"></i>
                          <strong>Liên hệ:</strong>{" "}
                          <a href={`tel:${item.phone}`} style={{ color: "#7c3aed", fontWeight: "600", textDecoration: "none" }}>
                            {item.phone}
                          </a>
                        </div>
                      )}

                      <div className="mb-2 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ color: "#334155" }}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-geo-alt-fill me-2 text-danger fs-5"></i>
                          <div>
                            <strong>Địa điểm:</strong> {item.location || "Đang cập nhật"}
                          </div>
                        </div>
                        {getDirectionsUrl(item) && (
                          <a
                            href={getDirectionsUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-google-maps"
                            title="Mở Google Maps để chỉ đường đến địa điểm này"
                          >
                            <span className="map-icon-box">
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                              </svg>
                            </span>
                            <span className="map-text">Chỉ đường Google Maps</span>
                            <span className="map-arrow">➔</span>
                          </a>
                        )}
                      </div>

                      {item.note && (
                        <div
                          className="mt-2 small p-2 rounded"
                          style={{ backgroundColor: "#f8fafc", color: "#64748b", border: "1px dashed #cbd5e1" }}
                        >
                          <strong>Ghi chú:</strong> {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e9d5ff" }}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal Thêm / Sửa lịch biểu diễn (Dành cho Admin) */}
          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            centered
            backdrop="static"
          >
            <Modal.Header closeButton style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e9d5ff" }}>
              <Modal.Title className="fw-bold" style={{ color: "#7c3aed" }}>
                {editingItem ? "✏️ Chỉnh sửa Lịch Biểu Diễn" : "➕ Thêm Lịch Biểu Diễn Mới"}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSaveSchedule}>
              <Modal.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Ngày biểu diễn (YYYY-MM-DD) *</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Giờ biểu diễn (HH:mm)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: 18:00, 08:30..."
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Mô tả / Tên chương trình *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="VD: Khai trương cửa hàng ABC, biểu diễn 2 Lân..."
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Địa điểm biểu diễn *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="VD: 123 Hoàn Kiếm, Hà Nội / Trung tâm Hội nghị..."
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">
                    📞 Số điện thoại liên hệ <span className="text-secondary fw-normal">(Không bắt buộc)</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="VD: 0912345678 (SĐT khách hàng hoặc người phụ trách)"
                    value={scheduleForm.phone || ""}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, phone: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Ghi chú thêm</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="VD: Đem theo trang phục Lân đỏ, chuẩn bị trước 30p..."
                    value={scheduleForm.note}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, note: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">
                    Tọa độ GPS / Link Google Maps <span className="text-secondary fw-normal">(Tùy chọn)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="VD: 21.028511, 105.854444 hoặc link Google Maps"
                    value={scheduleForm.coordinates}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, coordinates: e.target.value })}
                    style={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e1b4b" }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: "0.78rem" }}>
                    💡 Nhập tọa độ hoặc link bản đồ giúp người xem bấm <strong>"Chỉ đường Google Maps"</strong> để mở app chỉ đường chính xác từng mét.
                  </Form.Text>
                </Form.Group>
              </Modal.Body>

              <Modal.Footer style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e9d5ff" }}>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving} className="fw-bold" style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed" }}>
                  {isSaving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang lưu...
                    </>
                  ) : (
                    "💾 Lưu lịch vào Database"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
