import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { Form, Button, Modal, Spinner } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './config';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import { DecorativeTitle, FestivalStrip } from './components/Decorations';

const DEFAULT_AVATAR = 'https://res.cloudinary.com/lucgiaduong/image/upload/v1/default-avatar.png';

function Introduction() {
  const { user, token, isAdmin } = useContext(AuthContext);

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Modal tạo tài khoản mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    username: '',
    password: '123',
    role: 'user',
    birthYear: '',
    location: 'Quảng Ninh',
    bio: '',
    avatar: '',
  });

  // Tải danh sách thành viên từ MongoDB Atlas
  const fetchMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE_URL}/users/members`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMembersData(data.data);
      } else {
        setMembersData([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành viên:', err);
      setMembersData([]);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const selectedMember = useMemo(
    () => membersData.find((m) => (m._id === selectedMemberId || m.id === selectedMemberId)) || null,
    [selectedMemberId, membersData]
  );

  const handleMemberFieldChange = (field, value) => {
    if (!selectedMember) return;
    setMembersData((prev) =>
      prev.map((m) => (m._id === selectedMember._id ? { ...m, [field]: value } : m))
    );
  };

  // Upload Avatar cho thành viên
  const handleAvatarUpload = async (memberId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/upload/single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        const newAvatarUrl = data.data.url;
        setMembersData((prev) =>
          prev.map((m) => (m._id === memberId ? { ...m, avatar: newAvatarUrl } : m))
        );
        alert('Đã tải ảnh lên! Nhấn "Lưu thông tin" để cập nhật vào database.');
      } else {
        alert(data.message || 'Lỗi tải ảnh đại diện.');
      }
    } catch (err) {
      alert('Lỗi upload ảnh: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Admin lưu cập nhật thông tin thành viên vào DB
  const handleSaveMember = async (member) => {
    if (!isAdmin || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/${member._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: member.name,
          role: member.role,
          birthYear: member.birthYear ? Number(member.birthYear) : null,
          location: member.location,
          bio: member.bio,
          avatar: member.avatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã lưu thông tin thành viên "${member.name}" vào Database!`);
        fetchMembers();
      } else {
        alert(data.message || 'Lỗi khi cập nhật thành viên.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Admin xóa tài khoản thành viên khỏi DB
  const handleDeleteMember = async (member) => {
    if (!isAdmin || !token) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản thành viên "${member.name}" (@${member.username}) khỏi cơ sở dữ liệu?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${member._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(`Đã xóa thành viên "${member.name}" thành công.`);
        setSelectedMemberId(null);
        fetchMembers();
      } else {
        alert(data.message || 'Không thể xóa thành viên.');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  // Admin tạo tài khoản người dùng mới
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!token || !isAdmin) return;

    if (!newMemberForm.name.trim() || !newMemberForm.username.trim() || !newMemberForm.password.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Tên đăng nhập và Mật khẩu.');
      return;
    }

    try {
      setIsCreating(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newMemberForm,
          birthYear: newMemberForm.birthYear ? Number(newMemberForm.birthYear) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`🎉 Đã tạo thành công tài khoản cho "${newMemberForm.name}"!`);
        setShowCreateModal(false);
        setNewMemberForm({
          name: '',
          username: '',
          password: '123',
          role: 'user',
          birthYear: '',
          location: 'Quảng Ninh',
          bio: '',
          avatar: '',
        });
        fetchMembers();
      } else {
        alert(data.message || 'Lỗi khi tạo tài khoản.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!selectedMemberId) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedMemberId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedMemberId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black, #0f0a1c)' }}>
      <Header />
      <Banner />

      {/* Giới thiệu chung về đoàn */}
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Giới thiệu về đoàn</DecorativeTitle>
        </h2>
        <div
          className="rounded overflow-hidden d-flex flex-column flex-md-row mx-auto"
          style={{
            maxWidth: '960px',
            background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black-soft) 100%)',
            border: '2px solid var(--lgd-purple-glow)',
            color: 'var(--lgd-text)',
          }}
        >
          <div className="flex-shrink-0" style={{ width: '100%', maxWidth: '360px' }}>
            <img
              src="/images/gioi_thieu_doan.jpg"
              alt="Giới thiệu đoàn Lục Gia Đường"
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '280px' }}
              onError={(e) => {
                e.target.src = '/images/Logo_full.png';
              }}
            />
          </div>
          <div className="p-4 p-md-5 flex-grow-1" style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            <p className="mb-3">
              <strong style={{ color: 'var(--lgd-purple)' }}>Tiền thân của Lục Gia Đường</strong> là đội Kì Lân Khu 6, được hình thành từ những người đam mê nghệ thuật Lân – Sư – Rồng tại địa phương.
              Từ một đội biểu diễn mang tính cộng đồng, qua thời gian tập luyện và phát triển, đội đã mở rộng quy mô và chính thức phát triển thành
              <strong style={{ color: 'var(--lgd-purple)' }}> đoàn Lân – Sư – Rồng Lục Gia Đường</strong> như ngày nay.
            </p>

            <p className="mb-3">
              Đoàn có đại bản doanh tại <strong>Khu Trới 6, phường Hoành Bồ, tỉnh Quảng Ninh</strong>, là nơi các thành viên cùng nhau tập luyện, gìn giữ
              và phát huy nghệ thuật biểu diễn truyền thống.
            </p>

            <p className="mb-0">
              <strong style={{ color: 'var(--lgd-purple)' }}>Lục Gia Đường</strong> hiện là một đoàn Lân – Sư – Rồng chuyên nghiệp, chuyên biểu diễn phục vụ
              lễ hội, khai trương, khánh thành và nhiều sự kiện khác. Chúng tôi mang đến các tiết mục
              <strong> Múa Lân, Múa Sư Tử, Múa Rồng</strong> đa dạng từ truyền thống đến hiện đại, cùng trang phục và phụ kiện chất lượng,
              phù hợp với nhiều quy mô sự kiện trong và ngoài địa bàn.
            </p>
          </div>
        </div>
      </section>

      {/* Thành tích nổi bật */}
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Thành tích nổi bật</DecorativeTitle>
        </h2>
        <div
          className="rounded p-4 p-md-5"
          style={{
            background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black-soft) 100%)',
            border: '2px solid var(--lgd-purple-glow)',
            borderLeft: '4px solid #8b5cf6',
            color: 'var(--lgd-text)',
          }}
        >
          <ul className="mb-0 ps-3 ps-md-4" style={{ listStyle: 'none', fontSize: '1.05rem', lineHeight: 2 }}>
            <li className="mb-2">• Xuất sắc đạt Giải Nhất nội dung Địa Bửu tại Giải giao lưu Đền Gin (Nam Định) lần thứ nhất</li>
            <li className="mb-2">• Đạt Giải Ba nội dung Song Lân tại Giải giao lưu Đền Gin (Nam Định) lần thứ nhất</li>
            <li className="mb-2">• Vinh dự hợp tác và biểu diễn cùng nghệ sĩ Đen Vâu</li>
            <li className="mb-2">• Đội ngũ giàu kinh nghiệm, biểu diễn bài bản và phong cách chuyên nghiệp</li>
            <li className="mb-2">• Thường xuyên biểu diễn phục vụ nhiều lễ hội, khai trương và các sự kiện lớn nhỏ</li>
          </ul>
        </div>
      </section>

      {/* Thành viên Lục Gia Đường (Lấy từ Database) */}
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold lgd-title-gold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Thành viên Lục Gia Đường ({membersData.length})</DecorativeTitle>
        </h2>

        {isAdmin && (
          <div className="text-center mb-4 d-flex justify-content-center gap-3 flex-wrap">
            <Button
              variant={isAdminMode ? 'outline-warning' : 'warning'}
              className="fw-bold"
              onClick={() => setIsAdminMode(!isAdminMode)}
            >
              {isAdminMode ? '🔒 Tắt chế độ Quản trị' : '⚙️ Bật chế độ Quản trị Thành viên'}
            </Button>

            {isAdminMode && (
              <Button
                variant="success"
                className="fw-bold"
                onClick={() => setShowCreateModal(true)}
              >
                ➕ Tạo tài khoản thành viên mới
              </Button>
            )}
          </div>
        )}

        <div
          className="rounded p-4 p-md-5"
          style={{
            background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black-soft) 100%)',
            border: '2px solid var(--lgd-purple-glow)',
            color: 'var(--lgd-text)',
          }}
        >
          {loadingMembers ? (
            <div className="text-center py-5 text-secondary">
              <Spinner animation="border" variant="warning" />
              <p className="mt-2">Đang tải danh sách thành viên từ Database...</p>
            </div>
          ) : (
            <div className="row g-2 g-md-3">
              {membersData.map((member) => (
                <div key={member._id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMemberId((prev) => (prev === member._id ? null : member._id))
                    }
                    aria-pressed={selectedMemberId === member._id}
                    className="w-100 rounded text-center py-2 px-2 d-flex flex-column align-items-center justify-content-center"
                    style={{
                      background: selectedMemberId === member._id ? 'var(--lgd-purple-glow)' : 'rgba(139,92,246,0.1)',
                      border: selectedMemberId === member._id ? '2px solid var(--lgd-purple)' : '1px solid var(--lgd-gray-border)',
                      color: 'var(--lgd-text)',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      outline: 'none',
                      fontWeight: selectedMemberId === member._id ? '700' : 'normal',
                      transition: 'all 0.2s ease',
                      minHeight: '60px',
                    }}
                  >
                    <span>{member.name}</span>
                    {member.role === 'admin' && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>👑 Admin</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Modal xem / chỉnh sửa chi tiết 1 thành viên */}
          {selectedMember && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Thông tin thành viên ${selectedMember.name}`}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setSelectedMemberId(null);
              }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(6px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              <div
                className="rounded p-4 p-md-5 w-100"
                style={{
                  maxWidth: 800,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: 'linear-gradient(180deg, #1a132f 0%, #0f0a1c 100%)',
                  border: '2px solid rgba(139,92,246,0.55)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                  <div className="d-flex align-items-center gap-4 gap-md-5 flex-wrap w-100">
                    <div className="text-center">
                      <img
                        src={selectedMember.avatar || DEFAULT_AVATAR}
                        alt={selectedMember.name}
                        width={180}
                        height={180}
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR;
                        }}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #8b5cf6',
                          background: '#0f0a1c',
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '240px' }}>
                      {isAdminMode && isAdmin ? (
                        <>
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#a78bfa' }}>Họ và tên</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={selectedMember.name || ''}
                              onChange={(e) => handleMemberFieldChange('name', e.target.value)}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#a78bfa' }}>Quyền hạn (Role)</Form.Label>
                            <Form.Select
                              size="sm"
                              value={selectedMember.role || 'user'}
                              onChange={(e) => handleMemberFieldChange('role', e.target.value)}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                            >
                              <option value="user">Thành viên (User)</option>
                              <option value="admin">Quản trị viên (Admin)</option>
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#a78bfa' }}>Năm sinh</Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={selectedMember.birthYear || ''}
                              onChange={(e) => handleMemberFieldChange('birthYear', e.target.value)}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#a78bfa' }}>Khu vực / Tỉnh thành</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={selectedMember.location || ''}
                              onChange={(e) => handleMemberFieldChange('location', e.target.value)}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#a78bfa' }}>Tiểu sử / Giới thiệu</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              size="sm"
                              value={selectedMember.bio || ''}
                              onChange={(e) => handleMemberFieldChange('bio', e.target.value)}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold" style={{ color: '#a78bfa' }}>Đổi ảnh đại diện</Form.Label>
                            <Form.Control
                              type="file"
                              size="sm"
                              accept="image/*"
                              onChange={(e) => handleAvatarUpload(selectedMember._id, e)}
                              disabled={uploadingAvatar}
                              style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                            />
                            {uploadingAvatar && <small className="text-warning">Đang tải ảnh lên...</small>}
                          </Form.Group>
                        </>
                      ) : (
                        <>
                          <div className="fw-bold mb-1" style={{ fontSize: '1.8rem', color: '#f6e05e' }}>
                            {selectedMember.name}
                          </div>
                          <div className="mb-2">
                            <span className="text-secondary small">@{selectedMember.username}</span>
                            <span
                              className="badge ms-2"
                              style={{
                                background: selectedMember.role === 'admin' ? '#f59e0b' : '#8b5cf6',
                              }}
                            >
                              {selectedMember.role === 'admin' ? '👑 Quản trị viên' : '👤 Thành viên'}
                            </span>
                          </div>

                          <div style={{ color: 'var(--lgd-text)', marginTop: 8, fontSize: '1.05rem' }}>
                            <strong style={{ color: '#a78bfa' }}>Năm sinh:</strong> {selectedMember.birthYear || 'Đang cập nhật'}
                          </div>

                          <div style={{ color: 'var(--lgd-text)', marginTop: 6, fontSize: '1.05rem' }}>
                            <strong style={{ color: '#a78bfa' }}>Khu vực:</strong> {selectedMember.location || 'Quảng Ninh'}
                          </div>

                          {selectedMember.bio && (
                            <div style={{ color: 'var(--lgd-text)', marginTop: 6, fontSize: '1.05rem' }}>
                              <strong style={{ color: '#a78bfa' }}>Tiểu sử:</strong> {selectedMember.bio}
                            </div>
                          )}

                          <div className="mt-4 text-secondary small">
                            Nhấn <strong>Esc</strong> hoặc bấm ra ngoài để đóng.
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 w-100 pt-3 border-top border-secondary">
                    {isAdminMode && isAdmin && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteMember(selectedMember)}
                        >
                          🗑️ Xóa tài khoản
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleSaveMember(selectedMember)}
                        >
                          💾 Lưu thông tin vào Database
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setSelectedMemberId(null)}
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal Admin Tạo tài khoản mới */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        contentClassName="border border-secondary"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#1a132f' }} className="border-secondary">
          <Modal.Title className="fw-bold" style={{ color: '#f6e05e' }}>
            ➕ Tạo Tài Khoản Thành Viên Mới
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUserSubmit}>
          <Modal.Body style={{ backgroundColor: '#0f0a1c' }} className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">Họ và tên *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="VD: Nguyễn Văn A"
                value={newMemberForm.name}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">Tên đăng nhập (Username) *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="VD: nguyenvana (viết liền không dấu)"
                value={newMemberForm.username}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, username: e.target.value })}
                style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">Mật khẩu ban đầu *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Mặc định: 123"
                value={newMemberForm.password}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary">Quyền hạn</Form.Label>
                  <Form.Select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                  >
                    <option value="user">Thành viên (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-secondary">Năm sinh</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="VD: 2008"
                    value={newMemberForm.birthYear}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, birthYear: e.target.value })}
                    style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">Khu vực / Tỉnh thành</Form.Label>
              <Form.Control
                type="text"
                placeholder="VD: Quảng Ninh..."
                value={newMemberForm.location}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, location: e.target.value })}
                style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-secondary">Tiểu sử / Giới thiệu</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="VD: Thành viên đội múa Lân..."
                value={newMemberForm.bio}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, bio: e.target.value })}
                style={{ backgroundColor: '#120b24', borderColor: '#3b2c64', color: '#f1f5f9' }}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer style={{ backgroundColor: '#1a132f' }} className="border-secondary">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="warning" type="submit" disabled={isCreating} className="fw-bold">
              {isCreating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Đang tạo...
                </>
              ) : (
                '💾 Tạo tài khoản'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Footer />
    </div>
  );
}

export default Introduction;
