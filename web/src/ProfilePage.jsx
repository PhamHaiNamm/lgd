import React, { useState, useContext, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './config';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, token, updateUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    birthYear: '',
    location: '',
    bio: '',
    avatar: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        birthYear: user.birthYear || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertInfo({ show: true, type: 'danger', message: 'Vui lòng chọn 1 file định dạng hình ảnh.' });
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo({ show: false, type: '', message: '' });

    if (!formData.name.trim()) {
      setAlertInfo({ show: true, type: 'danger', message: 'Họ và tên không được để trống.' });
      return;
    }

    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 6) {
        setAlertInfo({ show: true, type: 'danger', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setAlertInfo({ show: true, type: 'danger', message: 'Mật khẩu xác nhận không trùng khớp.' });
        return;
      }
    }

    try {
      setLoading(true);

      let finalAvatarUrl = formData.avatar;

      // Nếu có chọn file ảnh đại diện mới thì tải lên server
      if (avatarFile) {
        setUploadingAvatar(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', avatarFile);

        const uploadRes = await fetch(`${API_BASE_URL}/upload/single`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data?.url) {
          finalAvatarUrl = uploadJson.data.url;
        } else {
          throw new Error(uploadJson.message || 'Lỗi khi tải ảnh đại diện lên máy chủ.');
        }
        setUploadingAvatar(false);
      }

      // Gửi yêu cầu cập nhật Profile
      const payload = {
        name: formData.name.trim(),
        birthYear: formData.birthYear ? Number(formData.birthYear) : null,
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        avatar: finalAvatarUrl,
      };

      if (passwordData.newPassword) {
        payload.password = passwordData.newPassword;
      }

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (resData.success) {
        updateUserData(resData.data);
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setAvatarFile(null);
        setAlertInfo({
          show: true,
          type: 'success',
          message: '🎉 Cập nhật thông tin cá nhân thành công!',
        });
      } else {
        setAlertInfo({
          show: true,
          type: 'danger',
          message: resData.message || 'Không thể cập nhật thông tin.',
        });
      }
    } catch (err) {
      setAlertInfo({
        show: true,
        type: 'danger',
        message: 'Lỗi: ' + (err.message || 'Không thể kết nối đến máy chủ.'),
      });
    } finally {
      setLoading(false);
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="profile-page-container">
      <Header />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            {alertInfo.show && (
              <Alert
                variant={alertInfo.type}
                dismissible
                onClose={() => setAlertInfo({ show: false, type: '', message: '' })}
                className="mb-4 shadow-sm"
              >
                {alertInfo.message}
              </Alert>
            )}

            <Card className="profile-card border-0">
              <div className="profile-header-banner"></div>

              <Card.Body className="px-4 pb-5 pt-0">
                {/* Avatar Section */}
                <div className="profile-avatar-wrapper text-center">
                  <img
                    src={avatarPreview || 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png'}
                    alt="Avatar"
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.name || 'User') + '&background=6b21a8&color=fff';
                    }}
                  />
                  <div
                    className="profile-avatar-btn"
                    onClick={handleTriggerFileInput}
                    title="Đổi ảnh đại diện"
                  >
                    <i className="bi bi-camera-fill">📷</i>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-1" style={{ color: 'var(--lgd-title-gold, #f6e05e)' }}>
                    {formData.name || 'Họ và tên'}
                  </h3>
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <span className="text-secondary">@{formData.username}</span>
                    <span className={user?.role === 'admin' ? 'profile-badge-admin' : 'profile-badge-user'}>
                      {user?.role === 'admin' ? '👑 QUẢN TRỊ VIÊN' : '👤 THÀNH VIÊN'}
                    </span>
                  </div>
                  {uploadingAvatar && (
                    <div className="text-warning small mt-2">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý ảnh...
                    </div>
                  )}
                </div>

                {/* Form chỉnh sửa */}
                <Form onSubmit={handleSubmit}>
                  <h5 className="fw-bold mb-3 pb-2 border-bottom border-secondary" style={{ color: '#a78bfa' }}>
                    <i className="bi bi-person-lines-fill me-2"></i>Thông tin cơ bản
                  </h5>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Tên đăng nhập (Username)</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.username}
                          disabled
                          className="profile-form-control"
                        />
                        <Form.Text className="text-muted small">Tên đăng nhập cố định không thể thay đổi.</Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Họ và tên *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên đầy đủ"
                          required
                          className="profile-form-control"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Năm sinh</Form.Label>
                        <Form.Control
                          type="number"
                          name="birthYear"
                          value={formData.birthYear}
                          onChange={handleInputChange}
                          placeholder="VD: 2000"
                          min="1920"
                          max={new Date().getFullYear()}
                          className="profile-form-control"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Khu vực / Tỉnh thành</Form.Label>
                        <Form.Control
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="VD: Hà Nội, TP.HCM..."
                          className="profile-form-control"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Tiểu sử / Giới thiệu</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Giới thiệu đôi nét về bản thân hoặc vị trí trong đoàn..."
                          className="profile-form-control"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <h5 className="fw-bold mb-3 pb-2 border-bottom border-secondary" style={{ color: '#a78bfa' }}>
                    <i className="bi bi-shield-lock-fill me-2"></i>Bảo mật & Đổi mật khẩu
                  </h5>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Mật khẩu mới</Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Để trống nếu không muốn đổi"
                          minLength={6}
                          className="profile-form-control"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">Xác nhận mật khẩu mới</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Nhập lại mật khẩu mới"
                          minLength={6}
                          className="profile-form-control"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-end pt-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="btn-save-profile"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Đang lưu...
                        </>
                      ) : (
                        '💾 Lưu thay đổi thông tin'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}
