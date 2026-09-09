import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form, Button, Spinner, Table, Badge, Alert, InputGroup } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContext } from './AuthContext';
import { API_BASE_URL, formatImageUrl } from './config';
import { DecorativeTitle } from './components/Decorations';

const CONTACT_INFO = {
  fullName: 'Phạm Hải Nam',
  phone: '0345422378',
  zaloUrl: 'https://zalo.me/0345422378',
  facebookUrl: 'https://www.facebook.com/profile.php?id=100092666694525',
  messengerUrl: 'https://m.me/100092666694525',
  position: 'Trưởng đoàn Lục Gia Đường',
  address: 'Khu Trới 6, phường Hoành Bồ, tỉnh Quảng Ninh',
};

const SERVICE_OPTIONS = [
  { id: '2_lan', name: '2 Lân', icon: '🦁' },
  { id: '3_lan', name: '3 Lân', icon: '🦁' },
  { id: '4_lan', name: '4 Lân', icon: '🦁' },
  { id: '5_lan', name: '5 Lân', icon: '🦁' },
  { id: 'dia_buu', name: 'Địa Bửu', icon: '🎋' },
  { id: 'mua_rong', name: 'Múa Rồng', icon: '🐉' },
];

function ContactPage() {
  const { token, isAdmin } = useContext(AuthContext);

  // Dynamic Leader Avatar
  const [leaderAvatar, setLeaderAvatar] = useState('/images/trưởng_đoàn.jpg');

  useEffect(() => {
    fetch(`${API_BASE_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const leader = data.data.find(
            (u) => u.role === 'admin' || (u.name && u.name.toLowerCase().includes('hải nam'))
          );
          if (leader && leader.avatar) {
            setLeaderAvatar(formatImageUrl(leader.avatar));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    serviceTypes: ['2 Lân'],
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

  // Chọn / Bỏ chọn nhiều dịch vụ
  const toggleService = (serviceName) => {
    setFormData((prev) => {
      const current = prev.serviceTypes || [];
      const exists = current.includes(serviceName);
      let updated;
      if (exists) {
        updated = current.filter((s) => s !== serviceName);
      } else {
        updated = [...current, serviceName];
      }
      return {
        ...prev,
        serviceTypes: updated.length > 0 ? updated : [serviceName],
      };
    });
  };

  // Xử lý thay đổi số điện thoại: Tự động bỏ số 0 ở đầu, giới hạn đúng 9 số sau +84
  const handlePhoneChange = (e) => {
    let val = e.target.value || '';
    // Chỉ giữ chữ số
    val = val.replace(/\D/g, '');
    // Tự động bỏ số 0 ở đầu nếu khách gõ hoặc paste
    val = val.replace(/^0+/, '');
    // Giới hạn tối đa đúng 9 chữ số
    if (val.length > 9) {
      val = val.slice(0, 9);
    }
    setFormData((prev) => ({ ...prev, phone: val }));
  };

  // Gửi Form Đặt lịch
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!formData.fullName.trim()) {
      setSubmitError('Vui lòng nhập đầy đủ Họ tên quý khách.');
      return;
    }

    const cleanPhone = (formData.phone || '').trim();
    if (!cleanPhone) {
      setSubmitError('Vui lòng nhập Số điện thoại liên hệ.');
      return;
    }

    if (cleanPhone.length !== 9) {
      setSubmitError('Số điện thoại không hợp lệ! Vui lòng nhập đủ 9 chữ số (sau mã +84, không bao gồm số 0 ở đầu).');
      return;
    }

    if (!formData.serviceTypes || formData.serviceTypes.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất một dịch vụ biểu diễn quan tâm.');
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
        body: JSON.stringify({
          ...formData,
          phone: `+84${cleanPhone}`,
          serviceType: formData.serviceTypes.join(' + '),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({
          fullName: '',
          phone: '',
          serviceTypes: ['2 Lân'],
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

  // Admin: Duyệt yêu cầu và tự động thêm thẳng vào Lịch Biểu Diễn
  const handleApproveBooking = async (booking) => {
    if (!booking.eventDate) {
      alert('Yêu cầu này chưa có ngày diễn, không thể tự động thêm vào lịch biểu diễn.');
      return;
    }

    const confirmMsg = `Xác nhận DUYỆT yêu cầu đặt lịch của khách hàng "${booking.fullName}" (${booking.phone}) vào ngày ${booking.eventDate}${booking.eventTime ? ' lúc ' + booking.eventTime : ''} và THÊM THẲNG VÀO LỊCH BIỂU DIỄN chính thức của đoàn?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${booking._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        alert('🎉 Đã duyệt yêu cầu và tự động thêm vào Lịch Biểu Diễn thành công! Khán giả và thành viên có thể theo dõi trực tiếp tại trang Lịch Biểu Diễn.');
        setBookings((prev) =>
          prev.map((b) =>
            b._id === booking._id
              ? { ...b, status: 'confirmed', isScheduled: true, scheduleId: data.data?.schedule?._id }
              : b
          )
        );
      } else {
        alert(data.message || 'Lỗi khi duyệt đặt lịch.');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
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

  const getStatusBadge = (status, isScheduled) => {
    if (isScheduled || status === 'confirmed') {
      return (
        <span className="d-inline-flex flex-column gap-1">
          <Badge bg="success" className="px-2 py-1">✅ Đã chốt lịch</Badge>
          <Badge bg="primary" style={{ backgroundColor: '#7c3aed' }} className="px-2 py-1">
            📅 Đã lên lịch
          </Badge>
        </span>
      );
    }
    switch (status) {
      case 'contacted':
        return <Badge bg="info" className="text-dark px-2 py-1">📞 Đã liên hệ</Badge>;
      case 'cancelled':
        return <Badge bg="secondary" className="px-2 py-1">❌ Đã hủy</Badge>;
      default:
        return <Badge bg="warning" className="text-dark px-2 py-1">⏳ Chờ duyệt</Badge>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black, #f8f9fc)' }}>
      <Header />

      <section className="container my-5 lgd-section">
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
                    <div className="d-inline-block position-relative">
                      <img
                        src={leaderAvatar || '/images/trưởng_đoàn.jpg'}
                        alt={CONTACT_INFO.fullName}
                        className="rounded-circle shadow"
                        style={{
                          width: '160px',
                          height: '160px',
                          objectFit: 'cover',
                          border: '4px solid #7c3aed',
                          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                        }}
                        onError={(e) => {
                          e.target.src = '/images/Logo_full.png';
                        }}
                      />
                      <span
                        className="position-absolute bottom-0 end-0 badge rounded-pill px-2 py-1"
                        style={{ backgroundColor: '#10b981', border: '2px solid #ffffff', fontSize: '0.75rem' }}
                      >
                        🟢 Online
                      </span>
                    </div>
                    <h4 className="fw-bold mt-3 mb-1" style={{ color: '#1e1b4b', fontSize: '1.4rem' }}>
                      {CONTACT_INFO.fullName}
                    </h4>
                    <span
                      className="badge px-3 py-1 rounded-pill"
                      style={{ backgroundColor: '#f3e8ff', color: '#7c3aed', fontSize: '0.85rem' }}
                    >
                      👑 {CONTACT_INFO.position}
                    </span>
                  </div>

                  <hr style={{ borderColor: '#f1f5f9' }} />

                  <div className="d-flex flex-column gap-3 mb-4">
                    <div className="d-flex align-items-start gap-2">
                      <span style={{ fontSize: '1.2rem' }}>📍</span>
                      <div>
                        <span className="text-muted small d-block">Đại bản doanh:</span>
                        <strong style={{ fontSize: '0.95rem', color: '#1e1b4b' }}>{CONTACT_INFO.address}</strong>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-2">
                      <span style={{ fontSize: '1.2rem' }}>📞</span>
                      <div>
                        <span className="text-muted small d-block">Hotline trực tiếp & Zalo:</span>
                        <a
                          href={`tel:${CONTACT_INFO.phone}`}
                          style={{ fontSize: '1.35rem', color: '#7c3aed', fontWeight: 'bold', textDecoration: 'none' }}
                        >
                          {CONTACT_INFO.phone}
                        </a>
                      </div>
                    </div>

                    {/* Phần thông tin bổ sung để lấp đầy khoảng trống */}
                    <div
                      className="p-3 rounded-3"
                      style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}
                    >
                      <div className="small mb-2 d-flex align-items-center gap-2" style={{ color: '#6d28d9', fontWeight: 600 }}>
                        <span>⚡</span>
                        <span>Cam kết dịch vụ Lục Gia Đường:</span>
                      </div>
                      <ul className="list-unstyled mb-0 small text-muted d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
                        <li className="d-flex align-items-center gap-2">
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span><strong>Tư vấn 24/7:</strong> Luôn sẵn sàng tiếp nhận & xếp lịch</span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span><strong>Khu vực:</strong> Toàn tỉnh Quảng Ninh & các tỉnh lân cận</span>
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span><strong>Chuyên nghiệp:</strong> Trang phục mới đẹp, đúng giờ hoàng đạo</span>
                        </li>
                      </ul>
                    </div>
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
                    href={CONTACT_INFO.messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #00B2FF 0%, #006AFF 50%, #A033FF 100%)',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 12px rgba(0, 106, 255, 0.25)',
                    }}
                  >
                    <span>⚡ Nhắn Messenger Fanpage</span>
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
                    <span>📞 Gọi điện trực tiếp ({CONTACT_INFO.phone})</span>
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
                        <Form.Label className="small fw-bold text-muted d-flex justify-content-between align-items-center">
                          <span>Số điện thoại liên hệ *</span>
                          <span style={{ color: '#7c3aed', fontSize: '0.75rem', fontWeight: 'normal' }}>
                            (9 số sau +84)
                          </span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text
                            style={{
                              backgroundColor: '#f5f3ff',
                              borderColor: '#e2e8f0',
                              color: '#7c3aed',
                              fontWeight: '700',
                              fontSize: '0.92rem',
                              userSelect: 'none',
                            }}
                          >
                            +84
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            required
                            placeholder="345422378"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            maxLength={9}
                            style={{
                              backgroundColor: '#ffffff',
                              borderColor: '#e2e8f0',
                              color: '#1e1b4b',
                              fontWeight: '600',
                              letterSpacing: '0.5px',
                            }}
                          />
                        </InputGroup>
                        {formData.phone ? (
                          <div className="mt-1" style={{ fontSize: '0.75rem' }}>
                            {formData.phone.length === 9 ? (
                              <span className="text-success fw-bold">✓ Số hợp lệ: +84 {formData.phone} (0{formData.phone})</span>
                            ) : (
                              <span className="text-danger fw-semibold">
                                Đã nhập {formData.phone.length}/9 số (còn thiếu {9 - formData.phone.length} số)
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-muted mt-1" style={{ fontSize: '0.73rem' }}>
                            💡 Tự động bỏ số 0 ở đầu. Chỉ nhập 9 số tiếp theo.
                          </div>
                        )}
                      </Form.Group>
                    </div>
                  </div>

                  {/* Chọn Nhiều Dịch Vụ Quan Tâm */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="small fw-bold text-muted mb-0">
                        🎭 Dịch vụ quan tâm (Chọn nhiều mục cùng lúc):
                      </Form.Label>
                      <span className="badge" style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                        Đã chọn: {formData.serviceTypes?.length || 0} dịch vụ
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      {SERVICE_OPTIONS.map((item) => {
                        const isSelected = formData.serviceTypes?.includes(item.name);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleService(item.name)}
                            className="btn btn-sm d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-start"
                            style={{
                              backgroundColor: isSelected ? '#7c3aed' : '#ffffff',
                              color: isSelected ? '#ffffff' : '#334155',
                              border: isSelected ? '1.5px solid #6d28d9' : '1px solid #e2e8f0',
                              boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.2)' : 'none',
                              fontSize: '0.85rem',
                              fontWeight: isSelected ? 600 : 500,
                              transition: 'all 0.15s ease',
                              cursor: 'pointer',
                            }}
                          >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                            {isSelected ? (
                              <span
                                className="badge rounded-circle p-1 ms-1"
                                style={{ backgroundColor: '#ffffff', color: '#7c3aed', fontSize: '0.65rem' }}
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className="badge rounded-circle p-1 ms-1 text-muted"
                                style={{ backgroundColor: '#f1f5f9', fontSize: '0.65rem' }}
                              >
                                +
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
                          ⏰ Khung giờ dự kiến (Chuẩn 24h) *
                        </Form.Label>
                        <Form.Select
                          required
                          value={formData.eventTime}
                          onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                        >
                          {[
                            '06:00', '06:30', '07:00', '07:30',
                            '08:00', '08:30', '09:00', '09:30',
                            '10:00', '10:30', '11:00', '11:30',
                            '12:00', '12:30', '13:00', '13:30',
                            '14:00', '14:30', '15:00', '15:30',
                            '16:00', '16:30', '17:00', '17:30',
                            '18:00', '18:30', '19:00', '19:30',
                            '20:00', '20:30', '21:00', '21:30',
                            '22:00', '22:30', '23:00'
                          ].map((t) => (
                            <option key={t} value={t}>
                              {t} {parseInt(t) < 12 ? '(Sáng)' : parseInt(t) < 18 ? '(Chiều)' : '(Tối)'}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Gợi ý chọn nhanh khung giờ 24h */}
                  <div className="d-flex align-items-center gap-1 flex-wrap mb-3">
                    <span className="small text-muted me-1">Giờ 24h nhanh:</span>
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
                              href={`https://zalo.me/${b.phone.startsWith('+84') ? '0' + b.phone.replace(/\D/g, '').slice(2) : b.phone.replace(/\D/g, '')}`}
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
                        <td>{getStatusBadge(b.status, b.isScheduled)}</td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap align-items-center">
                            {/* Khi đã duyệt thì hiển thị huy hiệu cố định thông báo đã duyệt, chưa duyệt thì hiển thị nút bấm duyệt */}
                            {b.isScheduled || b.status === 'confirmed' ? (
                              <span
                                className="badge d-inline-flex align-items-center gap-1 py-2 px-2"
                                style={{
                                  backgroundColor: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  fontSize: '0.78rem',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Đơn này đã được duyệt và đã tự động thêm vào Lịch Biểu Diễn của đoàn"
                              >
                                ✓ Đã duyệt vào lịch
                              </span>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleApproveBooking(b)}
                                title="Duyệt yêu cầu và tự động đưa vào Lịch Biểu Diễn chính thức."
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap',
                                  backgroundColor: '#7c3aed',
                                  borderColor: '#7c3aed',
                                  color: '#ffffff',
                                }}
                              >
                                ⚡ Duyệt & Lên lịch
                              </Button>
                            )}

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
