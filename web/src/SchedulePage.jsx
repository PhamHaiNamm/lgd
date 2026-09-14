import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Container, Row, Col, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthContext } from "./AuthContext";
import { API_BASE_URL } from "./config";
import LunarCalendar from "./components/LunarCalendar";
import { extractMongoId } from "./Introduction";
import "./SchedulePage.css";

export default function SchedulePage() {
  const { user, token, isAdmin } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  const [showModal, setShowModal] = useState(false);

  // State Modal Xem chi tiết show (Dành cho thành viên đăng nhập)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // State Modal Tổng hợp doanh thu dành cho Admin
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueStartDate, setRevenueStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [revenueEndDate, setRevenueEndDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  });

  // State form thêm/sửa lịch
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    location: '',
    description: '',
    note: '',
    phone: '',
    coordinates: '',
    totalPrice: '',
    deposit: '',
    isPaid: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Chuyển chuỗi định dạng hiển thị (VD: "5.000.000,5") sang số thực
  const parseInputValue = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Định dạng số/chuỗi thành dạng có dấu chấm hàng nghìn & phẩy lẻ (VD: "5.000.000,5")
  const formatInputValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const str = String(val).trim();
    if (typeof val === 'number') {
      const parts = String(val).split('.');
      const intFormatted = new Intl.NumberFormat('vi-VN').format(Number(parts[0]));
      return parts.length > 1 ? `${intFormatted},${parts[1]}` : intFormatted;
    }
    const hasTrailingComma = /[,.]$/.test(str);
    const parts = str.replace(/\./g, '').split(/[,.]/);
    const intDigits = parts[0].replace(/\D/g, '');
    const decDigits = parts.length > 1 ? parts[1].replace(/\D/g, '') : null;

    if (!intDigits && decDigits === null) return '';
    const formattedInt = intDigits ? new Intl.NumberFormat('vi-VN').format(Number(intDigits)) : '0';

    if (decDigits !== null) {
      return `${formattedInt},${decDigits}`;
    }
    if (hasTrailingComma) {
      return `${formattedInt},`;
    }
    return formattedInt;
  };

  // Hàm định dạng tiền tệ VNĐ hiển thị
  const formatCurrency = (val) => {
    const num = typeof val === 'number' ? val : parseInputValue(val);
    if (isNaN(num) || num === 0) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(num) + " VNĐ";
  };

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

  // Đánh dấu nhanh hoặc Hủy trạng thái "Đã thanh toán hết" cho 1 show
  const handleTogglePaidStatus = async (item) => {
    if (!token || !isAdmin) return;
    const cleanId = extractMongoId(item._id || item.id);
    if (!cleanId) return;

    const newStatus = !item.isPaid;
    try {
      const res = await fetch(`${API_BASE_URL}/schedules/${cleanId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
      } else {
        alert(data.message || "Lỗi khi cập nhật trạng thái thanh toán.");
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  // Lọc danh sách lịch theo khoảng thời gian tổng hợp doanh thu
  const revenueItems = useMemo(() => {
    if (!revenueStartDate || !revenueEndDate) return items;
    return items.filter((it) => {
      if (!it.date) return false;
      return it.date >= revenueStartDate && it.date <= revenueEndDate;
    });
  }, [items, revenueStartDate, revenueEndDate]);

  // Tính toán số liệu doanh thu cho Admin
  // Quy tắc: Nếu show đã thanh toán hết (isPaid) -> tính 100% tiền show. Nếu chưa -> chỉ cộng tiền cọc đã nhận.
  const revenueStats = useMemo(() => {
    let totalShowPrice = 0;
    let totalDeposit = 0;
    let actualRevenue = 0;
    let remainingDebt = 0;

    revenueItems.forEach((it) => {
      const price = Number(it.totalPrice) || 0;
      const dep = Number(it.deposit) || 0;
      totalShowPrice += price;
      totalDeposit += dep;

      if (it.isPaid) {
        actualRevenue += price;
      } else {
        actualRevenue += dep; // Chưa thanh toán hết -> chỉ cộng tiền cọc vào tổng hợp doanh thu
        remainingDebt += Math.max(0, price - dep);
      }
    });

    return {
      count: revenueItems.length,
      totalShowPrice,
      totalDeposit,
      actualRevenue,
      remainingDebt,
    };
  }, [revenueItems]);

  // Mở modal xem chi tiết lịch (Chỉ người có tài khoản mới bấm được)
  const handleOpenDetailModal = (item) => {
    if (!user && !token) {
      alert("🔒 Vui lòng đăng nhập tài khoản thành viên để xem thông tin chi tiết và giá tiền show!");
      return;
    }
    setDetailItem(item);
    setShowDetailModal(true);
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
      totalPrice: "",
      deposit: "",
      isPaid: false,
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
      totalPrice: item.totalPrice !== undefined && item.totalPrice !== null ? formatInputValue(item.totalPrice) : "",
      deposit: item.deposit !== undefined && item.deposit !== null ? formatInputValue(item.deposit) : "",
      isPaid: Boolean(item.isPaid),
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

      const payload = {
        ...scheduleForm,
        totalPrice: parseInputValue(scheduleForm.totalPrice),
        deposit: parseInputValue(scheduleForm.deposit),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

                <Button
                  variant="warning"
                  className="fw-bold text-dark"
                  onClick={() => setShowRevenueModal(true)}
                >
                  📊 Tổng hợp doanh thu
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
                          <div className="d-flex gap-2 align-items-center flex-wrap">
                            <Button
                              size="sm"
                              variant={item.isPaid ? "success" : "outline-warning"}
                              className="fw-bold"
                              style={{ fontSize: "0.78rem" }}
                              onClick={() => handleTogglePaidStatus(item)}
                              title={item.isPaid ? "Show đã thanh toán hết (Bấm để đổi)" : "Bấm để đánh dấu Đã thanh toán hết"}
                            >
                              {item.isPaid ? "✅ Đã thanh toán hết" : "💵 Đánh dấu ĐÃ THANH TOÁN"}
                            </Button>
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

                      {/* Nút Xem chi tiết & Giá tiền show (Chỉ người có tài khoản mới ấn xem được) */}
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2 border-top" style={{ borderColor: "#f1f5f9" }}>
                        <Button
                          size="sm"
                          style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed", fontWeight: "600" }}
                          onClick={() => handleOpenDetailModal(item)}
                        >
                          👁️ Xem chi tiết show {user ? "" : "🔒 (Cần đăng nhập)"}
                        </Button>

                        {user ? (
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="badge" style={{ backgroundColor: "#f3e8ff", color: "#6b21a8", fontSize: "0.78rem", padding: "6px 10px" }}>
                              💵 Giá: {formatCurrency(item.totalPrice)}
                            </span>
                            <span className="badge bg-success" style={{ fontSize: "0.78rem", padding: "6px 10px" }}>
                              💳 Còn lại: {formatCurrency((item.totalPrice || 0) - (item.deposit || 0))}
                            </span>
                          </div>
                        ) : (
                          <span className="small text-muted" style={{ fontSize: "0.78rem" }}>
                            🔒 Đăng nhập để xem giá show & cọc
                          </span>
                        )}
                      </div>
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

          {/* Modal Xem chi tiết Show (Dành riêng cho người dùng đã đăng nhập) */}
          <Modal
            show={showDetailModal}
            onHide={() => setShowDetailModal(false)}
            size="lg"
            centered
          >
            <Modal.Header closeButton style={{ backgroundColor: "#7c3aed", color: "#ffffff" }}>
              <Modal.Title className="fw-bold fs-5">
                👁️ CHI TIẾT LỊCH BIỂU DIỄN
              </Modal.Title>
            </Modal.Header>
            {detailItem && (
              <Modal.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
                <div className="mb-4">
                  <span className="badge bg-primary mb-2" style={{ fontSize: "0.85rem" }}>
                    📅 Ngày diễn: {detailItem.date ? new Date(detailItem.date).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "Chưa rõ"}
                  </span>
                  <h3 className="fw-bold" style={{ color: "#6b21a8" }}>
                    {detailItem.description || detailItem.content || "Chương trình biểu diễn"}
                  </h3>
                </div>

                <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="small text-muted fw-bold mb-1">⏰ GIỜ BIỂU DIỄN</div>
                      <div className="fw-semibold text-dark">{detailItem.time || "Chưa xác định"}</div>
                    </Col>
                    <Col md={6}>
                      <div className="small text-muted fw-bold mb-1">📞 ĐIỆN THOẠI LIÊN HỆ</div>
                      <div className="fw-semibold">
                        {detailItem.phone ? (
                          <a href={`tel:${detailItem.phone}`} style={{ color: "#7c3aed", textDecoration: "none" }}>
                            {detailItem.phone}
                          </a>
                        ) : (
                          <span className="text-muted">Chưa cập nhật</span>
                        )}
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="small text-muted fw-bold mb-1">📍 ĐỊA ĐIỂM BIỂU DIỄN</div>
                      <div className="fw-semibold text-dark d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <span>{detailItem.location || "Đang cập nhật"}</span>
                        {getDirectionsUrl(detailItem) && (
                          <a
                            href={getDirectionsUrl(detailItem)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-danger fw-bold"
                          >
                            🗺️ Mở chỉ đường Google Maps
                          </a>
                        )}
                      </div>
                    </Col>
                    {detailItem.note && (
                      <Col md={12}>
                        <div className="small text-muted fw-bold mb-1">📝 GHI CHÚ Bổ SUNG</div>
                        <div className="p-2 rounded bg-white text-dark border small">
                          {detailItem.note}
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>

                {/* Khối Bảng Giá Tiền & Đặt Cọc */}
                <div
                  className="p-3 rounded-3 shadow-sm"
                  style={{ backgroundColor: "#faf5ff", border: "2px dashed #a855f7" }}
                >
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "#6b21a8" }}>
                    💰 BẢNG TÍNH GIÁ SHOW & TIỀN CỌC
                  </h5>
                  <Row className="g-3">
                    <Col xs={12} sm={4}>
                      <div className="p-3 rounded text-center bg-white border h-100">
                        <div className="small text-muted fw-bold mb-1">💵 TIỀN SHOW</div>
                        <div className="fs-5 fw-bold text-primary">
                          {formatCurrency(detailItem.totalPrice)}
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} sm={4}>
                      <div className="p-3 rounded text-center bg-white border h-100">
                        <div className="small text-muted fw-bold mb-1">🏦 ĐÃ ĐẶT CỌC</div>
                        <div className="fs-5 fw-bold text-warning">
                          {formatCurrency(detailItem.deposit)}
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} sm={4}>
                      <div className="p-3 rounded text-center bg-white border h-100" style={{ borderColor: "#86efac", backgroundColor: "#f0fdf4" }}>
                        <div className="small text-success fw-bold mb-1">💳 SỐ TIỀN CÒN LẠI</div>
                        <div className="fs-5 fw-bold text-success">
                          {formatCurrency((detailItem.totalPrice || 0) - (detailItem.deposit || 0))}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                          (Tiền show - Đã cọc)
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Modal.Body>
            )}
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
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
            size="lg"
          >
            <Modal.Header closeButton style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e9d5ff" }}>
              <Modal.Title className="fw-bold" style={{ color: "#7c3aed" }}>
                {editingItem ? "✏️ Chỉnh sửa Lịch Biểu Diễn" : "➕ Thêm Lịch Biểu Diễn Mới"}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSaveSchedule}>
              <Modal.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
                <Row>
                  <Col md={6}>
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
                  </Col>

                  <Col md={6}>
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
                  </Col>
                </Row>

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

                {/* Trường Giá tiền show và Đặt cọc cho Admin */}
                <Row className="p-3 mb-3 mx-0 rounded border" style={{ backgroundColor: "#faf5ff", borderColor: "#e9d5ff" }}>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold text-primary">
                        💵 Giá tiền show / Tổng tiền (VNĐ)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="decimal"
                        placeholder="VD: 5.000.000 hoặc 1.500.000,5"
                        value={scheduleForm.totalPrice}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, totalPrice: formatInputValue(e.target.value) })}
                        style={{ backgroundColor: "#ffffff", borderColor: "#c084fc", color: "#1e1b4b" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small fw-bold text-warning">
                        🏦 Số tiền đã cọc (VNĐ)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        inputMode="decimal"
                        placeholder="VD: 1.000.000 hoặc 500.000,5"
                        value={scheduleForm.deposit}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, deposit: formatInputValue(e.target.value) })}
                        style={{ backgroundColor: "#ffffff", borderColor: "#fde047", color: "#1e1b4b" }}
                      />
                    </Form.Group>
                  </Col>

                  {/* Tính toán hiển thị số tiền còn lại */}
                  <Col md={12} className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span className="small fw-bold text-muted">💳 Số tiền còn lại (Tiền show - Tiền cọc):</span>
                    <span className="fw-bold fs-6 text-success">
                      {formatCurrency(parseInputValue(scheduleForm.totalPrice) - parseInputValue(scheduleForm.deposit))}
                    </span>
                  </Col>
                </Row>

                {/* Công tắc đánh dấu Đã thanh toán hết */}
                <Form.Group className="mb-3 p-3 rounded border" style={{ backgroundColor: scheduleForm.isPaid ? "#f0fdf4" : "#fff8f1", borderColor: scheduleForm.isPaid ? "#86efac" : "#fed7aa" }}>
                  <Form.Check
                    type="switch"
                    id="isPaidSwitch"
                    label={<span className="fw-bold text-dark">✅ Đã thanh toán hết (Toàn bộ tiền show đã thu xong)</span>}
                    checked={scheduleForm.isPaid}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, isPaid: e.target.checked })}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: "0.78rem" }}>
                    💡 Khi bật tính năng này, hệ thống sẽ tính 100% tiền show vào bảng <strong>"Tổng hợp doanh thu"</strong>. Nếu chưa bật (chưa thanh toán hết), hệ thống chỉ cộng tiền cọc đã nhận.
                  </Form.Text>
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

          {/* Modal Bảng Tổng Hợp Doanh Thu (Admin Only) */}
          <Modal
            show={showRevenueModal}
            onHide={() => setShowRevenueModal(false)}
            size="xl"
            centered
          >
            <Modal.Header closeButton style={{ backgroundColor: "#1e1b4b", color: "#ffffff" }}>
              <Modal.Title className="fw-bold fs-5">
                📊 BẢNG TỔNG HỢP DOANH THU LỊCH BIỂU DIỄN
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4" style={{ backgroundColor: "#f8fafc" }}>
              {/* Bộ lọc ngày tháng */}
              <div className="bg-white p-3 rounded-3 shadow-sm mb-4 border">
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Từ ngày (YYYY-MM-DD)</Form.Label>
                      <Form.Control
                        type="date"
                        value={revenueStartDate}
                        onChange={(e) => setRevenueStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Đến ngày (YYYY-MM-DD)</Form.Label>
                      <Form.Control
                        type="date"
                        value={revenueEndDate}
                        onChange={(e) => setRevenueEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 fw-bold"
                        onClick={() => {
                          const now = new Date();
                          setRevenueStartDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
                          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                          setRevenueEndDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`);
                        }}
                      >
                        📅 Tháng này
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100 fw-bold"
                        onClick={() => {
                          setRevenueStartDate("2020-01-01");
                          setRevenueEndDate("2030-12-31");
                        }}
                      >
                        🌐 Tất cả lịch
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Các thẻ Thống Kê Tổng Quan */}
              <Row className="g-3 mb-4">
                <Col xs={12} sm={6} lg={3}>
                  <div className="p-3 rounded-3 bg-white border shadow-sm h-100" style={{ borderLeft: "4px solid #7c3aed" }}>
                    <div className="small text-muted fw-bold mb-1">💰 DOANH THU THỰC TẾ ĐÃ THU</div>
                    <div className="fs-5 fw-bold" style={{ color: "#7c3aed" }}>
                      {formatCurrency(revenueStats.actualRevenue)}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }}>
                      (Show thanh toán hết + Tiền cọc các show khác)
                    </div>
                  </div>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <div className="p-3 rounded-3 bg-white border shadow-sm h-100" style={{ borderLeft: "4px solid #3b82f6" }}>
                    <div className="small text-muted fw-bold mb-1">📜 TỔNG HỢP GIÁ SHOWS</div>
                    <div className="fs-5 fw-bold text-primary">
                      {formatCurrency(revenueStats.totalShowPrice)}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }}>
                      (Tổng {revenueStats.count} show trong kỳ)
                    </div>
                  </div>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <div className="p-3 rounded-3 bg-white border shadow-sm h-100" style={{ borderLeft: "4px solid #eab308" }}>
                    <div className="small text-muted fw-bold mb-1">🏦 TỔNG TIỀN ĐÃ CỌC</div>
                    <div className="fs-5 fw-bold text-warning">
                      {formatCurrency(revenueStats.totalDeposit)}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }}>
                      (Tổng cọc khách đã chuyển)
                    </div>
                  </div>
                </Col>

                <Col xs={12} sm={6} lg={3}>
                  <div className="p-3 rounded-3 bg-white border shadow-sm h-100" style={{ borderLeft: "4px solid #ef4444" }}>
                    <div className="small text-muted fw-bold mb-1">💳 CÒN NỢ CHƯA THU</div>
                    <div className="fs-5 fw-bold text-danger">
                      {formatCurrency(revenueStats.remainingDebt)}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "0.72rem" }}>
                      (Tiền còn nợ của các show chưa thanh toán)
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Bảng Chi Tiết Tất Cả Các Show */}
              <div className="bg-white p-3 rounded-3 shadow-sm border">
                <h6 className="fw-bold mb-3 text-dark">📋 Chi tiết danh sách show ({revenueItems.length} show trong khoảng chọn):</h6>
                {revenueItems.length === 0 ? (
                  <div className="text-center py-4 text-muted">Không có show nào trong khoảng thời gian này.</div>
                ) : (
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0" style={{ fontSize: "0.88rem" }}>
                      <thead className="table-light">
                        <tr>
                          <th>Ngày & Giờ</th>
                          <th>Tên Chương Trình / Địa Điểm</th>
                          <th className="text-end">Tiền Show</th>
                          <th className="text-end">Đã Cọc</th>
                          <th className="text-center">Trạng Thái</th>
                          <th className="text-center">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueItems.map((it) => (
                          <tr key={it._id || it.id}>
                            <td className="fw-semibold text-nowrap">
                              <div>{it.date}</div>
                              <small className="text-muted">{it.time || "N/A"}</small>
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{it.description || "Chương trình"}</div>
                              <small className="text-muted">{it.location}</small>
                            </td>
                            <td className="text-end fw-bold text-primary">
                              {formatCurrency(it.totalPrice)}
                            </td>
                            <td className="text-end fw-bold text-warning">
                              {formatCurrency(it.deposit)}
                            </td>
                            <td className="text-center">
                              {it.isPaid ? (
                                <span className="badge bg-success">✅ Đã thanh toán hết</span>
                              ) : (
                                <span className="badge bg-warning text-dark">⏳ Mới cọc (Chỉ cộng cọc)</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                variant={it.isPaid ? "outline-secondary" : "success"}
                                className="py-1 px-2 fw-bold"
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => handleTogglePaidStatus(it)}
                              >
                                {it.isPaid ? "Hủy Đã Thanh Toán" : "✔ Đã Thanh Toán Hết"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowRevenueModal(false)}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </section>

      <Footer />
    </div>
  );
}
