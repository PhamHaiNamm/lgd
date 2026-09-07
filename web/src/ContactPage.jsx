import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form, Button, Spinner, Table, Badge, Alert } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './config';
import { DecorativeTitle, FestivalStrip } from './components/Decorations';

const CONTACT_INFO = {
  fullName: 'Phạm Hải Nam',
  phone: '0345422378',
  zaloUrl: 'https://zalo.me/0345422378',
  position: 'Trưởng đoàn Lục Gia Đường',
  address: 'Khu Trới 6, phường Hoành Bồ, tỉnh Quảng Ninh',
};

const SERVICE_OPTIONS = [
  'Múa Lân Khai Trương / Khánh Thành',
  'Múa Lân - Sư - Rồng Trọn Gói',
  'Múa Rồng Lễ Hội / Đình Làng',
  'Múa Sư Tử & Trống Hội',
  'Biểu diễn Tết Trung Thu / Khai Giảng',
  'Biểu diễn Sự kiện / Tiệc Cưới theo yêu cầu',
];

function ContactPage() {
  const { token, isAdmin } = useContext(AuthContext);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    serviceType: SERVICE_OPTIONS[0],
    eventDate: '',
    eventTime: '08:00',
    location: 'Quảng Ninh',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Trạng thái kiểm tra trùng giờ
  const [availability, setAvailability] = useState({
    checked: false,
    checking: false,
    available: true,
    message: '',
  });

  // Tự động kiểm tra trùng giờ khi thay đổi ngày hoặc giờ
  useEffect(() => {
    if (!formData.eventDate || !formData.eventTime) {
      setAvailability({ checked: false, checking: false, available: true, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAvailability((prev) => ({ ...prev, checking: true }));
        const res = await fetch(
          `${API_BASE_URL}/bookings/check-availability?eventDate=${encodeURIComponent(
            formData.eventDate
          )}&eventTime=${encodeURIComponent(formData.eventTime)}`
        );
        const data = await res.json();
        if (data.success && data.data) {
          setAvailability({
            checked: true,
            checking: false,
            available: data.data.available,
            message: data.data.message || (data.data.available ? 'Khung giờ này còn trống!' : 'Trùng lịch'),
          });
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trùng lịch:', err);
        setAvailability({ checked: false, checking: false, available: true, message: '' });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.eventDate, formData.eventTime]);

  // Admin Management State
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'admin_bookings'
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    if (!token || !isAdmin) return;
    try {
      setLoadingBookings(true);
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đặt lịch:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [token, isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'admin_bookings') {
      fetchBookings();
    }
  }, [isAdmin, activeTab, fetchBookings]);

  // Gửi Form Đặt lịch
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setSubmitError('Vui lòng nhập đầy đủ Họ tên và Số điện thoại liên hệ.');
      return;
    }

    if (!formData.eventDate) {
      setSubmitError('Vui lòng chọn Ngày diễn ra sự kiện.');
      return;
    }

    if (availability.checked && !availability.available) {
      setSubmitError(
        `⚠️ Khung giờ ${formData.eventTime} ngày ${formData.eventDate} đã có người đặt hoặc trùng lịch biểu diễn của đoàn. Quý khách vui lòng chọn giờ khác!`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({
          fullName: '',
          phone: '',
          serviceType: SERVICE_OPTIONS[0],
          eventDate: '',
          eventTime: '08:00',
          location: 'Quảng Ninh',
          note: '',
        });
        setAvailability({ checked: false, checking: false, available: true, message: '' });
      } else {
        setSubmitError(data.message || 'Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
      }
    } catch (err) {
      setSubmitError('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin: Cập nhật trạng thái
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
      } else {
        alert(data.message || 'Lỗi cập nhật trạng thái.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Admin: Xóa yêu cầu
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa yêu cầu đặt lịch này?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert(data.message || 'Không thể xóa.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge bg="success">✅ Đã chốt lịch</Badge>;
      case 'contacted':
        return <Badge bg="info" className="text-dark">📞 Đã liên hệ</Badge>;
      case 'cancelled':
        return <Badge bg="danger">❌ Đã hủy</Badge>;
      default:
        return <Badge bg="warning" className="text-dark">⏳ Chờ liên hệ</Badge>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black, #f8f9fc)' }}>
      <Header />

      <section className="container my-5 lgd-section">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#7c3aed' }}>
          <DecorativeTitle showIcons={true}>Liên hệ & Đặt lịch biểu diễn</DecorativeTitle>
        </h2>

        {isAdmin && (
          <div className="text-center mb-4 d-flex justify-content-center gap-2">
            <Button
              variant={activeTab === 'contact' ? 'primary' : 'outline-primary'}
              className="fw-bold"
              onClick={() => setActiveTab('contact')}
            >
              📝 Trang Liên hệ & Form Đặt lịch
            </Button>
            <Button
              variant={activeTab === 'admin_bookings' ? 'primary' : 'outline-primary'}
              className="fw-bold"
              onClick={() => setActiveTab('admin_bookings')}
            >
              📋 Quản lý Yêu cầu Đặt lịch ({bookings.length})
            </Button>
          </div>
        )}

        {/* Tab 1: Trang Liên Hệ & Form Đặt Lịch */}
        {activeTab === 'contact' && (
          <div className="row g-4 justify-content-center" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Cột 1: Thông tin Trực tiếp & Nút Zalo / Điện thoại */}
            <div className="col-lg-5">
              <div
                className="rounded p-4 h-100 d-flex flex-column justify-content-between shadow-sm"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e9d5ff',
                  color: 'var(--lgd-text, #1e1b4b)',
                }}
              >
                <div>
                  <div className="text-center mb-3">
                    <img
                      src="/images/trưởng_đoàn.jpg"
                      alt={CONTACT_INFO.fullName}
                      className="rounded-circle"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        border: '3px solid #7c3aed',
                      }}
                      onError={(e) => {
                        e.target.src = '/images/Logo_full.png';
                      }}
                    />
                    <h4 className="fw-bold mt-3 mb-1" style={{ color: '#1e1b4b' }}>
                      {CONTACT_INFO.fullName}
                    </h4>
                    <p className="text-muted small mb-0">{CONTACT_INFO.position}</p>
                  </div>

                  <hr style={{ borderColor: '#f1f5f9' }} />

                  <div className="mb-3">
                    <span className="text-muted small d-block">📍 Đại bản doanh:</span>
                    <strong style={{ fontSize: '0.95rem' }}>{CONTACT_INFO.address}</strong>
                  </div>

                  <div className="mb-4">
                    <span className="text-muted small d-block">📞 Hotline trực tiếp:</span>
                    <strong style={{ fontSize: '1.25rem', color: '#7c3aed' }}>{CONTACT_INFO.phone}</strong>
                  </div>
                </div>

                {/* Các nút liên hệ nhanh */}
                <div className="d-flex flex-column gap-2 mt-2">
                  <a
                    href={CONTACT_INFO.zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: '#0068ff',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                    }}
                  >
                    <span>💬 Nhắn Zalo ngay (0345422378)</span>
                  </a>

                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="btn w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                    }}
                  >
                    <span>📞 Gọi điện trực tiếp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Cột 2: Form Điền thông tin đặt lịch gửi về cho Admin */}
            <div className="col-lg-7">
              <div
                className="rounded p-4 p-md-5 shadow-sm"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e9d5ff',
                  color: 'var(--lgd-text, #1e1b4b)',
                }}
              >
                <h3 className="fw-bold mb-3" style={{ color: '#7c3aed' }}>
                  📝 Gửi yêu cầu đặt lịch biểu diễn
                </h3>
                <p className="text-muted small mb-4">
                  Vui lòng điền thông tin sự kiện của bạn vào form dưới đây. Trưởng đoàn sẽ tiếp nhận và liên hệ tư vấn báo giá ngay!
                </p>

                {submitSuccess && (
                  <Alert variant="success" className="py-3">
                    🎉 <strong>Gửi yêu cầu thành công!</strong>
                    <br />
                    Đoàn Lân Sư Rồng Lục Gia Đường đã nhận được thông tin. Trưởng đoàn sẽ liên hệ lại với bạn qua số điện thoại/Zalo trong thời gian sớm nhất!
                  </Alert>
                )}

                {submitError && (
                  <Alert variant="danger" className="py-2">
                    {submitError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmitBooking}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Họ và tên quý khách *</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder="VD: Nguyễn Văn A"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted">Số điện thoại liên hệ *</Form.Label>
                        <Form.Control
                          type="tel"
                          required
                          placeholder="VD: 0987654321"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Dịch vụ quan tâm</Form.Label>
                      <Form.Select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                      >
                        {SERVICE_OPTIONS.map((s, idx) => (
                          <option key={idx} value={s}>
                            {s}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold text-muted">
                          📅 Ngày diễn ra sự kiện *
                        </Form.Label>
                        <Form.Control
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold text-muted">
                          ⏰ Khung giờ dự kiến *
                        </Form.Label>
                        <Form.Control
                          type="time"
                          required
                          value={formData.eventTime}
                          onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  {/* Gợi ý chọn nhanh khung giờ */}
                  <div className="d-flex align-items-center gap-1 flex-wrap mb-3">
                    <span className="small text-muted me-1">Giờ phổ biến:</span>
                    {['08:00', '09:30', '14:00', '16:00', '19:30', '20:30'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, eventTime: t })}
                        className="btn btn-sm py-0 px-2 rounded-pill"
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: formData.eventTime === t ? '#7c3aed' : '#f3e8ff',
                          color: formData.eventTime === t ? '#ffffff' : '#6d28d9',
                          border: 'none',
                          fontWeight: 500,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Thông báo kiểm tra trùng lịch Real-time */}
                  {formData.eventDate && formData.eventTime && (
                    <div className="mb-3">
                      {availability.checking ? (
                        <div className="small text-muted py-1 d-flex align-items-center gap-2">
                          <Spinner animation="border" size="sm" style={{ width: '14px', height: '14px' }} />
                          <span>Đang kiểm tra lịch trống...</span>
                        </div>
                      ) : availability.checked && availability.available ? (
                        <div
                          className="py-2 px-3 rounded small d-flex align-items-center gap-2"
                          style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
                        >
                          <span>✅ <strong>Khung giờ trống:</strong> {formData.eventTime} ngày {formData.eventDate} chưa có ai đặt, bạn có thể đặt ngay!</span>
                        </div>
                      ) : availability.checked && !availability.available ? (
                        <div
                          className="py-2 px-3 rounded small"
                          style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
                        >
                          <div className="fw-bold mb-1">⚠️ ĐÃ TRÙNG GIỜ ĐẶT LỊCH:</div>
                          <div>{availability.message}</div>
                          <div className="small text-muted mt-1">
                            👉 Vui lòng chọn một khung giờ khác hoặc gọi hotline <strong>{CONTACT_INFO.phone}</strong> để được sắp xếp thêm đoàn.
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Địa điểm tổ chức sự kiện</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="VD: Hạ Long, Quảng Ninh / Cẩm Phả / Uông Bí..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted">Ghi chú / Yêu cầu chi tiết</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="VD: Yêu cầu 2 Lân 1 Rồng, có trống hội và ông địa..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-100 py-3 fw-bold"
                    style={{
                      background: '#7c3aed',
                      border: '1px solid #6d28d9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: '#ffffff',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      '🚀 Gửi yêu cầu đặt lịch cho Đoàn'
                    )}
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Admin Quản lý Danh sách Đặt lịch từ Khách */}
        {isAdmin && activeTab === 'admin_bookings' && (
          <div
            className="rounded p-4 p-md-5 shadow-sm"
            style={{
              background: '#ffffff',
              border: '1px solid #e9d5ff',
              color: '#1e1b4b',
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h3 className="fw-bold mb-1" style={{ color: '#7c3aed' }}>
                  📋 Danh sách khách hàng gửi yêu cầu đặt lịch
                </h3>
                <p className="text-muted small mb-0">
                  Tổng cộng: <strong>{bookings.length}</strong> yêu cầu
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Lọc trạng thái:</span>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b', width: '160px' }}
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ liên hệ</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="confirmed">Đã chốt lịch</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
                <Button variant="outline-primary" size="sm" onClick={fetchBookings}>
                  🔄 Làm mới
                </Button>
              </div>
            </div>

            {loadingBookings ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" style={{ color: '#7c3aed' }} />
                <p className="mt-2">Đang tải danh sách đặt lịch...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>Không có yêu cầu đặt lịch nào.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover style={{ verticalAlign: 'middle', borderColor: '#f1f5f9' }}>
                  <thead style={{ backgroundColor: '#f5f3ff' }}>
                    <tr style={{ color: '#6d28d9', borderBottom: '2px solid #ddd6fe' }}>
                      <th>Thời gian gửi</th>
                      <th>Khách hàng</th>
                      <th>Số điện thoại</th>
                      <th>Dịch vụ</th>
                      <th>Thời gian sự kiện</th>
                      <th>Địa điểm</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="small text-muted">
                          {new Date(b.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td>
                          <strong>{b.fullName}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{b.phone}</span>
                            <a
                              href={`https://zalo.me/${b.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm py-0 px-2 text-white"
                              style={{ fontSize: '0.75rem', backgroundColor: '#0068ff' }}
                              title="Nhắn tin Zalo cho khách"
                            >
                              Zalo
                            </a>
                            <a
                              href={`tel:${b.phone}`}
                              className="btn btn-sm btn-success py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                              title="Gọi điện trực tiếp"
                            >
                              Gọi
                            </a>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                            {b.serviceType}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong>{b.eventDate || '—'}</strong>
                            {b.eventTime && (
                              <span className="badge ms-2" style={{ backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                                ⏰ {b.eventTime}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{b.location || '—'}</td>
                        <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{b.note || '—'}</td>
                        <td>{getStatusBadge(b.status)}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <Form.Select
                              size="sm"
                              value={b.status}
                              onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b', fontSize: '0.75rem', width: '120px' }}
                            >
                              <option value="pending">⏳ Chờ liên hệ</option>
                              <option value="contacted">📞 Đã liên hệ</option>
                              <option value="confirmed">✅ Đã chốt</option>
                              <option value="cancelled">❌ Đã hủy</option>
                            </Form.Select>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteBooking(b._id)}
                              title="Xóa yêu cầu này"
                              style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                            >
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
