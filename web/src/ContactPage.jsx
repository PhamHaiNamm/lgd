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
    location: 'Quảng Ninh',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
          location: 'Quảng Ninh',
          note: '',
        });
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
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black, #0f0a1c)' }}>
      <Header />

      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Liên hệ & Đặt lịch biểu diễn</DecorativeTitle>
        </h2>

        {isAdmin && (
          <div className="text-center mb-4 d-flex justify-content-center gap-2">
            <Button
              variant={activeTab === 'contact' ? 'warning' : 'outline-warning'}
              className="fw-bold"
              onClick={() => setActiveTab('contact')}
            >
              📝 Trang Liên hệ & Form Đặt lịch
            </Button>
            <Button
              variant={activeTab === 'admin_bookings' ? 'warning' : 'outline-warning'}
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
                className="rounded p-4 h-100 d-flex flex-column justify-content-between"
                style={{
                  background: 'linear-gradient(180deg, var(--lgd-black-card, #1a132f) 0%, var(--lgd-black-soft, #100a20) 100%)',
                  border: '2px solid var(--lgd-purple-glow, rgba(139,92,246,0.4))',
                  color: 'var(--lgd-text, #f1f5f9)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div>
                  <div className="text-center mb-3">
                    <img
                      src="/images/trưởng_đoàn.jpg"
                      alt={CONTACT_INFO.fullName}
                      className="rounded-circle"
                      style={{
                        width: '130px',
                        height: '130px',
                        objectFit: 'cover',
                        border: '3px solid #f59e0b',
                        boxShadow: '0 0 16px rgba(245,158,11,0.5)',
                      }}
                      onError={(e) => {
                        e.target.src = '/images/Logo_full.png';
                      }}
                    />
                    <h4 className="fw-bold mt-3 mb-1" style={{ color: '#f6e05e' }}>
                      {CONTACT_INFO.fullName}
                    </h4>
                    <p className="text-secondary small mb-0">{CONTACT_INFO.position}</p>
                  </div>

                  <hr style={{ borderColor: 'rgba(139,92,246,0.3)' }} />

                  <div className="mb-3">
                    <span className="text-secondary small d-block">📍 Đại bản doanh:</span>
                    <strong style={{ fontSize: '0.95rem' }}>{CONTACT_INFO.address}</strong>
                  </div>

                  <div className="mb-4">
                    <span className="text-secondary small d-block">📞 Hotline trực tiếp:</span>
                    <strong style={{ fontSize: '1.25rem', color: '#38bdf8' }}>{CONTACT_INFO.phone}</strong>
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
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 14px rgba(0,104,255,0.4)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>💬</span>
                    <span>Nhắn Zalo ngay (0345422378)</span>
                  </a>

                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="btn w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>📞</span>
                    <span>Gọi điện trực tiếp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Cột 2: Form Điền thông tin đặt lịch gửi về cho Admin */}
            <div className="col-lg-7">
              <div
                className="rounded p-4 p-md-5"
                style={{
                  background: 'linear-gradient(180deg, var(--lgd-black-card, #1a132f) 0%, var(--lgd-black-soft, #100a20) 100%)',
                  border: '2px solid var(--lgd-purple-glow, rgba(139,92,246,0.4))',
                  color: 'var(--lgd-text, #f1f5f9)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <h3 className="fw-bold mb-3" style={{ color: '#a78bfa' }}>
                  📝 Gửi yêu cầu đặt lịch biểu diễn
                </h3>
                <p className="text-secondary small mb-4">
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
                        <Form.Label className="small fw-bold text-secondary">Họ và tên quý khách *</Form.Label>
                        <Form.Control
                          type="text"
                          required
                          placeholder="VD: Nguyễn Văn A"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Số điện thoại liên hệ *</Form.Label>
                        <Form.Control
                          type="tel"
                          required
                          placeholder="VD: 0987654321"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Dịch vụ quan tâm</Form.Label>
                        <Form.Select
                          value={formData.serviceType}
                          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                          style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                        >
                          {SERVICE_OPTIONS.map((s, idx) => (
                            <option key={idx} value={s}>
                              {s}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Ngày giờ dự kiến sự kiện</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="VD: 15/09/2026 - 08:30 sáng"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-secondary">Địa điểm tổ chức sự kiện</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="VD: Hạ Long, Quảng Ninh / Cẩm Phả / Uông Bí..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-secondary">Ghi chú / Yêu cầu chi tiết</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="VD: Yêu cầu 2 Lân 1 Rồng, có trống hội và ông địa..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-100 py-3 fw-bold"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      border: '1px solid #a78bfa',
                      borderRadius: '10px',
                      fontSize: '1.05rem',
                      boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
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
            className="rounded p-4 p-md-5"
            style={{
              background: 'linear-gradient(180deg, var(--lgd-black-card, #1a132f) 0%, var(--lgd-black-soft, #100a20) 100%)',
              border: '2px solid var(--lgd-purple-glow, rgba(139,92,246,0.4))',
              color: 'var(--lgd-text, #f1f5f9)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h3 className="fw-bold mb-1" style={{ color: '#f6e05e' }}>
                  📋 Danh sách khách hàng gửi yêu cầu đặt lịch
                </h3>
                <p className="text-secondary small mb-0">
                  Tổng cộng: <strong>{bookings.length}</strong> yêu cầu
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="small text-secondary">Lọc trạng thái:</span>
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9', width: '160px' }}
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ liên hệ</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="confirmed">Đã chốt lịch</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
                <Button variant="outline-light" size="sm" onClick={fetchBookings}>
                  🔄 Làm mới
                </Button>
              </div>
            </div>

            {loadingBookings ? (
              <div className="text-center py-5 text-secondary">
                <Spinner animation="border" variant="warning" />
                <p className="mt-2">Đang tải danh sách đặt lịch...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <p>Không có yêu cầu đặt lịch nào.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover variant="dark" style={{ verticalAlign: 'middle', backgroundColor: 'transparent' }}>
                  <thead>
                    <tr style={{ color: '#a78bfa', borderBottom: '2px solid rgba(139,92,246,0.4)' }}>
                      <th>Thời gian gửi</th>
                      <th>Khách hàng</th>
                      <th>Số điện thoại</th>
                      <th>Dịch vụ</th>
                      <th>Ngày sự kiện</th>
                      <th>Địa điểm</th>
                      <th>Ghi chú</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                        <td className="small text-secondary">
                          {new Date(b.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td>
                          <strong>{b.fullName}</strong>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{b.phone}</span>
                            <a
                              href={`https://zalo.me/${b.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
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
                          <span className="badge bg-secondary">{b.serviceType}</span>
                        </td>
                        <td>{b.eventDate || '—'}</td>
                        <td>{b.location || '—'}</td>
                        <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>{b.note || '—'}</td>
                        <td>{getStatusBadge(b.status)}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <Form.Select
                              size="sm"
                              value={b.status}
                              onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9', fontSize: '0.75rem', width: '120px' }}
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
