import React, { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import { Form, Button, Modal, Spinner } from 'react-bootstrap';
import { AuthContext } from './AuthContext';
import { API_BASE_URL, formatImageUrl } from './config';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import { DecorativeTitle } from './components/Decorations';
import { compressImage } from './utils/imageCompressor';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=LGD&background=7c3aed&color=fff';

export const MEMBER_POSITIONS = [
  'Lân',
  'Sư Tử Truyền Thống',
  'Âm Thanh',
  'Truyền Thông',
];

export const NAME_FRAMES = [
  { id: '', name: 'Mặc định (Viền tím cơ bản)', file: '' },
  { id: 'frame_lan_rong', name: 'Lân & Rồng', file: '/images/frames/frame_lan_rong.png', leaderOnly: false },
  { id: 'frame_dragon', name: 'Rồng Uy Dũng', file: '/images/frames/frame_dragon.png', leaderOnly: false },
  { id: 'frame_trung_thu', name: 'Trung Thu Trăng Rằm', file: '/images/frames/frame_trung_thu.png', leaderOnly: false },
  { id: 'frame_lan', name: 'Lân Sư Oai Vệ', file: '/images/frames/frame_lan.png', leaderOnly: false },
  { id: 'frame_spider', name: 'Khung Nhện Tím (Chỉ Trưởng đoàn)', file: '/images/frames/frame_spider.png', leaderOnly: true },
];

export function getMemberFrameBg(member) {
  if (!member) return null;
  const isLeader = member.username === 'hainam' || (member.name && member.name.toLowerCase().includes('hải nam'));

  if (member.nameFrame === 'frame_spider') {
    return '/images/frames/frame_spider.png';
  }
  if (member.nameFrame && ['frame_lan_rong', 'frame_dragon', 'frame_trung_thu', 'frame_lan'].includes(member.nameFrame)) {
    return `/images/frames/${member.nameFrame}.png`;
  }
  if (isLeader) {
    return '/images/frames/frame_spider.png';
  }
  return null;
}

function Introduction() {
  const { token, isAdmin } = useContext(AuthContext);

  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [introImage, setIntroImage] = useState(() => {
    try {
      return localStorage.getItem('lgd_intro_image') || '/images/gioi_thieu_doan.jpg';
    } catch {
      return '/images/gioi_thieu_doan.jpg';
    }
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingIntroImage, setUploadingIntroImage] = useState(false);

  // Tải ảnh giới thiệu mới nhất từ cơ sở dữ liệu
  useEffect(() => {
    fetch(`${API_BASE_URL}/settings/intro_image`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setIntroImage(data.data);
          try {
            localStorage.setItem('lgd_intro_image', data.data);
          } catch {}
        }
      })
      .catch((err) => console.warn('Lỗi tải ảnh giới thiệu từ backend:', err));
  }, []);

  const handleIntroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert(`File ảnh quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Giới hạn tối đa là 50MB!`);
      return;
    }

    try {
      setUploadingIntroImage(true);
      const processedFile = await compressImage(file, { maxWidth: 2560, maxHeight: 2560, quality: 0.88 });
      const formData = new FormData();
      formData.append('image', processedFile);

      const res = await fetch(`${API_BASE_URL}/upload/single`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        const newUrl = data.data.url;
        setIntroImage(newUrl);
        try {
          localStorage.setItem('lgd_intro_image', newUrl);
        } catch {}

        // Lưu vào Database để mọi thiết bị đều thấy ảnh mới
        if (token && isAdmin) {
          try {
            await fetch(`${API_BASE_URL}/settings/intro_image`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ value: newUrl }),
            });
          } catch (dbErr) {
            console.warn('Lưu DB lỗi:', dbErr);
          }
        }

        alert('🎉 Đã cập nhật ảnh giới thiệu thành công cho tất cả thiết bị!');
      } else {
        alert(data.message || 'Lỗi tải ảnh lên máy chủ.');
      }
    } catch (err) {
      alert('Lỗi upload ảnh: ' + err.message);
    } finally {
      setUploadingIntroImage(false);
    }
  };

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
    nameFrame: '',
  });

  // Tải danh sách thành viên từ MongoDB Atlas
  const fetchMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE_URL}/users/members`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const normalized = data.data.map((m, idx) => {
          let strId = '';
          if (m && m._id) {
            strId = typeof m._id === 'object' ? (m._id.$oid || (m._id.toString ? m._id.toString() : '')) : String(m._id);
          }
          if (!strId && m && m.id) {
            strId = typeof m.id === 'object' ? (m.id.$oid || (m.id.toString ? m.id.toString() : '')) : String(m.id);
          }
          if (!strId || strId === '[object Object]') {
            strId = m?.username ? `u_${m.username}` : `mem_${idx}`;
          }
          return {
            ...m,
            _id: strId,
            id: strId,
          };
        });
        setMembersData(normalized);
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

  // Khử trùng lặp và sắp xếp: Duy nhất "Hải Nam" là Trưởng đoàn đứng đầu danh sách
  const sortedMembers = useMemo(() => {
    const rawList = Array.isArray(membersData) ? membersData : [];

    // Loại bỏ các bản ghi trùng lặp theo tên hoặc username
    const uniqueMap = new Map();
    for (let i = 0; i < rawList.length; i++) {
      const m = rawList[i];
      if (!m || !m.name) continue;
      const lowerName = m.name.trim().toLowerCase();
      // Bỏ qua tài khoản placeholder "admin" hoặc "quản trị viên trưởng"
      if (m.username === 'admin' || lowerName === 'quản trị viên trưởng') {
        continue;
      }
      const uniqueKey = m.username ? `user_${m.username.trim().toLowerCase()}` : `name_${lowerName}`;
      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, m);
      }
    }

    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.sort((a, b) => {
      const aIsTruongDoan = a.username === 'hainam' || a.name?.toLowerCase().includes('hải nam');
      const bIsTruongDoan = b.username === 'hainam' || b.name?.toLowerCase().includes('hải nam');
      if (aIsTruongDoan && !bIsTruongDoan) return -1;
      if (!aIsTruongDoan && bIsTruongDoan) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [membersData]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    const target = String(selectedMemberId);
    return (
      sortedMembers.find(
        (m) => String(m._id) === target || String(m.id) === target || (m.username && `u_${m.username}` === target)
      ) || null
    );
  }, [selectedMemberId, sortedMembers]);

  const handleMemberFieldChange = (field, value) => {
    if (!selectedMember) return;
    const targetId = String(selectedMember._id || selectedMember.id);
    setMembersData((prev) =>
      prev.map((m) => (String(m._id || m.id) === targetId ? { ...m, [field]: value } : m))
    );
  };

  // Upload Avatar cho thành viên & tự động lưu ngay vào DB
  const handleAvatarUpload = async (memberId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert(`File ảnh quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Giới hạn tối đa là 50MB!`);
      return;
    }

    try {
      setUploadingAvatar(true);
      const processedFile = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.88 });
      const formData = new FormData();
      formData.append('image', processedFile);

      const res = await fetch(`${API_BASE_URL}/upload/single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        const newAvatarUrl = data.data.url;

        // Tự động lưu ngay vào database
        const saveRes = await fetch(`${API_BASE_URL}/users/${memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: newAvatarUrl }),
        });
        const saveData = await saveRes.json();

        if (saveData.success) {
          setMembersData((prev) =>
            prev.map((m) => (m._id === memberId ? { ...m, avatar: newAvatarUrl } : m))
          );
          alert('🎉 Đã tải ảnh lên và lưu vào hệ thống thành công!');
          fetchMembers();
        } else {
          setMembersData((prev) =>
            prev.map((m) => (m._id === memberId ? { ...m, avatar: newAvatarUrl } : m))
          );
          alert('Ảnh đã tải lên! Hãy nhấn "Lưu thông tin" để lưu vào hệ thống.');
        }
      } else {
        alert(data.message || 'Lỗi tải ảnh đại diện lên máy chủ.');
      }
    } catch (err) {
      alert('Lỗi upload ảnh: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Admin lưu cập nhật thông tin thành viên vào DB
  const handleSaveMember = async (member) => {
    if (!isAdmin || !token || !member) return;
    const targetId = member._id || member.id || member.username;
    if (!targetId || typeof targetId === 'object') {
      alert('Không tìm thấy mã định danh thành viên hợp lệ.');
      return;
    }

    try {
      const payload = {
        name: member.name,
        username: member.username,
        role: member.role,
        birthYear: member.birthYear ? Number(member.birthYear) : null,
        location: member.location,
        bio: member.bio,
        avatar: member.avatar,
        nameFrame: member.nameFrame || '',
      };
      if (member.newPassword && member.newPassword.trim()) {
        payload.password = member.newPassword.trim();
      }

      const res = await fetch(`${API_BASE_URL}/users/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
    if (!isAdmin || !token || !member) return;
    const targetId = member._id || member.id || member.username;
    if (!targetId || typeof targetId === 'object') {
      alert('Không tìm thấy mã định danh thành viên hợp lệ.');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản thành viên "${member.name}" (@${member.username}) khỏi cơ sở dữ liệu?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${targetId}`, {
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
          nameFrame: '',
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
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black, #f8f9fc)' }}>
      <Header />
      <Banner />

      {/* Giới thiệu chung về đoàn */}
      <section className="container py-2 my-2 lgd-section">
        <h2 className="text-center mb-3 fw-bold" style={{ color: '#7c3aed' }}>
          <DecorativeTitle showIcons={true}>Giới thiệu về đoàn</DecorativeTitle>
        </h2>
        <div
          className="rounded overflow-hidden d-flex flex-column flex-md-row mx-auto shadow-sm"
          style={{
            maxWidth: '960px',
            background: '#ffffff',
            border: '1px solid #e9d5ff',
            color: 'var(--lgd-text)',
          }}
        >
          <div className="flex-shrink-0 position-relative" style={{ width: '100%', maxWidth: '360px', minHeight: '260px' }}>
            <img
              src={formatImageUrl(introImage)}
              alt="Giới thiệu đoàn Lục Gia Đường"
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '260px', display: 'block' }}
              onError={(e) => {
                e.target.src = '/images/gioi_thieu_doan.jpg';
              }}
            />
            {isAdmin && (
              <label
                htmlFor="intro-img-upload-input"
                className="btn btn-sm position-absolute"
                style={{
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(124, 58, 237, 0.92)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                  borderRadius: '20px',
                  padding: '5px 14px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  zIndex: 5,
                  whiteSpace: 'nowrap',
                }}
              >
                {uploadingIntroImage ? '⏳ Đang tải ảnh...' : '📷 Đổi ảnh giới thiệu (Admin)'}
                <input
                  id="intro-img-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={uploadingIntroImage}
                  onChange={handleIntroImageUpload}
                />
              </label>
            )}
          </div>
          <div className="p-3 p-md-4 flex-grow-1" style={{ lineHeight: 1.8, fontSize: '1rem' }}>
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
      <section className="container py-2 my-2 lgd-section">
        <h2 className="text-center mb-3 fw-bold" style={{ color: '#7c3aed' }}>
          <DecorativeTitle showIcons={true}>Thành tích nổi bật</DecorativeTitle>
        </h2>
        <div
          className="rounded p-3 p-md-4 shadow-sm"
          style={{
            background: '#ffffff',
            border: '1px solid #e9d5ff',
            borderLeft: '4px solid #7c3aed',
            color: 'var(--lgd-text)',
          }}
        >
          <ul className="mb-0 ps-3 ps-md-4" style={{ listStyle: 'none', fontSize: '1rem', lineHeight: 1.9 }}>
            <li className="mb-2">• Xuất sắc đạt Giải Nhất nội dung Địa Bửu tại Giải giao lưu Đền Gin (Nam Định) lần thứ nhất</li>
            <li className="mb-2">• Đạt Giải Ba nội dung Song Lân tại Giải giao lưu Đền Gin (Nam Định) lần thứ nhất</li>
            <li className="mb-2">• Vinh dự hợp tác và biểu diễn cùng nghệ sĩ Đen Vâu</li>
            <li className="mb-2">• Đội ngũ giàu kinh nghiệm, biểu diễn bài bản và phong cách chuyên nghiệp</li>
            <li className="mb-2">• Thường xuyên biểu diễn phục vụ nhiều lễ hội, khai trương và các sự kiện lớn nhỏ</li>
          </ul>
        </div>
      </section>

      {/* Thành viên Lục Gia Đường (Lấy từ Database) */}
      <section className="container py-2 my-2 lgd-section">
        <h2 className="text-center mb-3 fw-bold lgd-title-gold" style={{ color: '#7c3aed' }}>
          <DecorativeTitle showIcons={true}>Thành viên Lục Gia Đường ({sortedMembers.length})</DecorativeTitle>
        </h2>

        {isAdmin && (
          <div className="text-center mb-3 d-flex justify-content-center gap-3 flex-wrap">
            <Button
              variant={isAdminMode ? 'outline-primary' : 'primary'}
              className="fw-bold"
              onClick={() => setIsAdminMode(!isAdminMode)}
            >
              {isAdminMode ? '🔒 Tắt chế độ Quản trị' : '⚙️ Quản trị Thành viên'}
            </Button>

            {isAdminMode && (
              <Button
                variant="success"
                className="fw-bold"
                onClick={() => setShowCreateModal(true)}
              >
                ➕ Tạo tài khoản mới
              </Button>
            )}
          </div>
        )}

        <div
          className="rounded p-3 p-md-4 shadow-sm"
          style={{
            background: '#ffffff',
            border: '1px solid #e9d5ff',
            color: 'var(--lgd-text)',
          }}
        >
          {loadingMembers ? (
            <div className="text-center py-5 text-secondary">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Đang tải danh sách thành viên...</p>
            </div>
          ) : (
            <div className="row g-2 g-md-3">
              {sortedMembers.map((member, idx) => {
                const isTruongDoan = member.username === 'hainam' || member.name?.toLowerCase().includes('hải nam');
                const memberIdStr = String(member._id || member.id || (member.username ? `u_${member.username}` : `mem_${idx}`));
                const isSelected = selectedMemberId !== null && String(selectedMemberId) === memberIdStr;
                const frameBg = getMemberFrameBg(member);
                const hasFrame = Boolean(frameBg);

                return (
                  <div key={memberIdStr} className="col-6 col-sm-4 col-md-3 col-lg-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMemberId((prev) => (prev && String(prev) === memberIdStr ? null : memberIdStr))
                      }
                      aria-pressed={isSelected}
                      className="w-100 rounded text-center py-2 px-2 d-flex flex-column align-items-center justify-content-center"
                      style={{
                        background: hasFrame
                          ? `url('${frameBg}') center / 100% 100% no-repeat #ffffff`
                          : (isSelected ? '#f5f3ff' : '#ffffff'),
                        border: hasFrame
                          ? 'none'
                          : (isSelected ? '2px solid #7c3aed' : (isTruongDoan ? '1.5px solid #c4b5fd' : '1px solid #e2e8f0')),
                        color: hasFrame ? '#0f172a' : (isSelected ? '#7c3aed' : '#1e1b4b'),
                        fontSize: '1rem',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: hasFrame
                          ? (isSelected ? '0 6px 20px rgba(124, 58, 237, 0.35)' : '0 4px 14px rgba(124, 58, 237, 0.18)')
                          : (isSelected ? '0 4px 12px rgba(124, 58, 237, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.04)'),
                        transition: 'all 0.2s ease',
                        minHeight: hasFrame ? '64px' : '60px',
                        padding: hasFrame ? '4px 10px' : '8px',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          fontFamily: "'Charm', 'Charmonman', cursive, serif",
                          fontSize: '1.22rem',
                          fontWeight: '500',
                          letterSpacing: '0.4px',
                          color: '#0f172a',
                          textShadow: hasFrame ? '0 0 4px #ffffff, 0 0 2px #ffffff' : 'none',
                        }}
                      >
                        {member.name}
                      </span>
                      {isTruongDoan && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.62rem',
                            background: '#7c3aed',
                            color: '#ffffff',
                            borderRadius: '6px',
                            marginTop: '2px',
                            padding: '1px 6px',
                            fontWeight: '700',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          👑 Trưởng đoàn
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
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
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              <div
                className="rounded p-4 p-md-5 w-100 shadow-lg"
                style={{
                  maxWidth: 800,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: '#ffffff',
                  border: '1px solid #e9d5ff',
                  color: '#1e1b4b',
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                  <div className="d-flex align-items-center gap-4 gap-md-5 flex-wrap w-100">
                    <div className="text-center">
                      <img
                        src={formatImageUrl(selectedMember.avatar) || DEFAULT_AVATAR}
                        alt={selectedMember.name}
                        width={160}
                        height={160}
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR;
                        }}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #7c3aed',
                          background: '#f5f3ff',
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: '240px' }}>
                      {isAdminMode && isAdmin ? (
                        <>
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>Họ và tên</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={selectedMember.name || ''}
                              onChange={(e) => handleMemberFieldChange('name', e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>Quyền hạn (Role)</Form.Label>
                            <Form.Select
                              size="sm"
                              value={selectedMember.role || 'user'}
                              onChange={(e) => handleMemberFieldChange('role', e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            >
                              <option value="user">Thành viên (User)</option>
                              <option value="admin">Quản trị viên (Admin)</option>
                            </Form.Select>
                          </Form.Group>

                          {/* Chọn Khung Tên Hiển Thị */}
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold d-flex justify-content-between align-items-center" style={{ color: '#7c3aed' }}>
                              <span>🎨 Khung hiển thị tên thành viên</span>
                              <span className="text-muted" style={{ fontSize: '0.72rem', fontWeight: 'normal' }}>
                                (Hiện ở danh sách thành viên)
                              </span>
                            </Form.Label>
                            <div className="d-flex flex-column gap-1">
                                {NAME_FRAMES.map((f) => {
                                  const isLeaderMember = selectedMember.username === 'hainam' || selectedMember.name?.toLowerCase().includes('hải nam') || selectedMember.role === 'admin';
                                  const isDisabled = f.leaderOnly && !isLeaderMember;
                                  const isChosen = (selectedMember.nameFrame || (isLeaderMember && !selectedMember.nameFrame ? 'frame_spider' : '')) === f.id;

                                  return (
                                    <div
                                      key={f.id || 'frame_default'}
                                      onClick={() => {
                                        if (!isDisabled) {
                                          handleMemberFieldChange('nameFrame', f.id);
                                        }
                                      }}
                                    className={`p-2 rounded border d-flex align-items-center justify-content-between ${isDisabled ? 'opacity-50' : ''}`}
                                    style={{
                                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                                      backgroundColor: isChosen ? '#f5f3ff' : '#ffffff',
                                      borderColor: isChosen ? '#7c3aed' : '#e2e8f0',
                                      borderWidth: isChosen ? '2px' : '1px',
                                      transition: 'all 0.15s ease',
                                    }}
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <input
                                        type="radio"
                                        name="selectedMember_nameFrame"
                                        checked={isChosen}
                                        disabled={isDisabled}
                                        onChange={() => handleMemberFieldChange('nameFrame', f.id)}
                                        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                      />
                                      <span className="small fw-semibold" style={{ color: '#1e1b4b' }}>
                                        {f.name}
                                      </span>
                                      {isDisabled && (
                                        <span className="badge bg-secondary" style={{ fontSize: '0.62rem' }}>
                                          🔒 Chỉ Trưởng đoàn
                                        </span>
                                      )}
                                    </div>

                                    {f.file ? (
                                      <div
                                        style={{
                                          width: '120px',
                                          height: '32px',
                                          background: `url('${f.file}') center / 100% 100% no-repeat`,
                                          border: '1px solid #e2e8f0',
                                          borderRadius: '4px',
                                        }}
                                      />
                                    ) : (
                                      <span className="small text-muted fst-italic me-2" style={{ fontSize: '0.75rem' }}>Mặc định</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>Năm sinh</Form.Label>
                            <Form.Control
                              type="number"
                              size="sm"
                              value={selectedMember.birthYear || ''}
                              onChange={(e) => handleMemberFieldChange('birthYear', e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>Khu vực / Tỉnh thành</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={selectedMember.location || ''}
                              onChange={(e) => handleMemberFieldChange('location', e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>Vị trí trong đoàn</Form.Label>
                            <Form.Select
                              size="sm"
                              value={selectedMember.bio || ''}
                              onChange={(e) => handleMemberFieldChange('bio', e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            >
                              <option value="">-- Chọn vị trí --</option>
                              {MEMBER_POSITIONS.map((pos) => (
                                <option key={pos} value={pos}>
                                  {pos}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>🔑 Đặt lại mật khẩu mới (để trống nếu không đổi)</Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              placeholder="Nhập mật khẩu mới..."
                              value={selectedMember.newPassword || ''}
                              onChange={(e) => handleMemberFieldChange('newPassword', e.target.value)}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>Đổi ảnh đại diện</Form.Label>
                            <Form.Control
                              type="file"
                              size="sm"
                              accept="image/*"
                              onChange={(e) => handleAvatarUpload(selectedMember._id, e)}
                              disabled={uploadingAvatar}
                              style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                            />
                            {uploadingAvatar && <small className="text-primary">Đang tải ảnh lên...</small>}
                          </Form.Group>
                        </>
                      ) : (
                        <>
                          {getMemberFrameBg(selectedMember) ? (
                            <div
                              className="d-inline-flex align-items-center justify-content-center px-4 py-2 mb-2 shadow-sm rounded"
                              style={{
                                background: `url('${getMemberFrameBg(selectedMember)}') center / 100% 100% no-repeat #ffffff`,
                                minWidth: '240px',
                                minHeight: '64px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '1.9rem',
                                  color: '#0f172a',
                                  fontFamily: "'Charm', 'Charmonman', cursive, serif",
                                  fontWeight: '500',
                                  letterSpacing: '0.5px',
                                  textShadow: '0 0 4px #ffffff',
                                }}
                              >
                                {selectedMember.name}
                              </span>
                            </div>
                          ) : (
                            <div
                              className="mb-1"
                              style={{
                                fontSize: '1.9rem',
                                color: '#0f172a',
                                fontFamily: "'Charm', 'Charmonman', cursive, serif",
                                fontWeight: '500',
                              }}
                            >
                              {selectedMember.name}
                            </div>
                          )}
                          <div className="mb-2">
                            <span className="text-muted small">@{selectedMember.username}</span>
                            <span
                              className="badge ms-2"
                              style={{
                                background: (selectedMember.username === 'hainam' || selectedMember.name?.toLowerCase().includes('hải nam')) ? '#7c3aed' : '#f1f5f9',
                                color: (selectedMember.username === 'hainam' || selectedMember.name?.toLowerCase().includes('hải nam')) ? '#ffffff' : '#475569',
                                border: (selectedMember.username === 'hainam' || selectedMember.name?.toLowerCase().includes('hải nam')) ? 'none' : '1px solid #e2e8f0',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                              }}
                            >
                              {(selectedMember.username === 'hainam' || selectedMember.name?.toLowerCase().includes('hải nam')) ? '👑 Trưởng đoàn / Quản trị viên' : '👤 Thành viên đoàn'}
                            </span>
                          </div>

                          <div style={{ color: 'var(--lgd-text)', marginTop: 8, fontSize: '1rem' }}>
                            <strong style={{ color: '#7c3aed' }}>Năm sinh:</strong> {selectedMember.birthYear || 'Đang cập nhật'}
                          </div>

                          <div style={{ color: 'var(--lgd-text)', marginTop: 6, fontSize: '1rem' }}>
                            <strong style={{ color: '#7c3aed' }}>Khu vực:</strong> {selectedMember.location || 'Quảng Ninh'}
                          </div>

                          {selectedMember.bio && (
                            <div style={{ color: 'var(--lgd-text)', marginTop: 6, fontSize: '1rem' }}>
                              <strong style={{ color: '#7c3aed' }}>Vị trí:</strong> {selectedMember.bio}
                            </div>
                          )}

                          <div className="mt-4 text-muted small">
                            Nhấn <strong>Esc</strong> hoặc bấm ra ngoài để đóng.
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 w-100 pt-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                    {isAdminMode && isAdmin && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteMember(selectedMember)}
                          style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                        >
                          🗑️ Xóa tài khoản
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveMember(selectedMember)}
                          style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                        >
                          💾 Lưu thông tin
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
      >
        <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e9d5ff' }}>
          <Modal.Title className="fw-bold" style={{ color: '#7c3aed' }}>
            ➕ Tạo Tài Khoản Thành Viên Mới
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateUserSubmit}>
          <Modal.Body style={{ backgroundColor: '#ffffff' }} className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Họ và tên *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="VD: Nguyễn Văn A"
                value={newMemberForm.name}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Tên đăng nhập (Username) *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="VD: nguyenvana (viết liền không dấu)"
                value={newMemberForm.username}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, username: e.target.value })}
                style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Mật khẩu ban đầu *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Mặc định: 123"
                value={newMemberForm.password}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
              />
            </Form.Group>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Quyền hạn</Form.Label>
                  <Form.Select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                  >
                    <option value="user">Thành viên (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Năm sinh</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="VD: 2008"
                    value={newMemberForm.birthYear}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, birthYear: e.target.value })}
                    style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Khu vực / Tỉnh thành</Form.Label>
              <Form.Control
                type="text"
                placeholder="VD: Quảng Ninh..."
                value={newMemberForm.location}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, location: e.target.value })}
                style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Vị trí trong đoàn</Form.Label>
              <Form.Select
                value={newMemberForm.bio}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, bio: e.target.value })}
                style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e1b4b' }}
              >
                <option value="">-- Chọn vị trí --</option>
                {MEMBER_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Chọn Khung Tên Khi Tạo Thành Viên */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold" style={{ color: '#7c3aed' }}>
                🎨 Khung hiển thị tên thành viên
              </Form.Label>
              <div className="d-flex flex-column gap-1">
                {NAME_FRAMES.map((f) => {
                  const isLeader = newMemberForm.role === 'admin' || newMemberForm.username === 'hainam';
                  const isDisabled = f.leaderOnly && !isLeader;
                  const isChosen = (newMemberForm.nameFrame || '') === f.id;

                  return (
                    <div
                      key={f.id || 'new_frame_default'}
                      onClick={() => {
                        if (!isDisabled) {
                          setNewMemberForm({ ...newMemberForm, nameFrame: f.id });
                        }
                      }}
                      className={`p-2 rounded border d-flex align-items-center justify-content-between ${isDisabled ? 'opacity-50' : ''}`}
                      style={{
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        backgroundColor: isChosen ? '#f5f3ff' : '#ffffff',
                        borderColor: isChosen ? '#7c3aed' : '#e2e8f0',
                        borderWidth: isChosen ? '2px' : '1px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          name="newMember_nameFrame"
                          checked={isChosen}
                          disabled={isDisabled}
                          onChange={() => setNewMemberForm({ ...newMemberForm, nameFrame: f.id })}
                          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        />
                        <span className="small fw-semibold" style={{ color: '#1e1b4b' }}>
                          {f.name}
                        </span>
                        {isDisabled && (
                          <span className="badge bg-secondary" style={{ fontSize: '0.62rem' }}>
                            🔒 Chỉ Trưởng đoàn
                          </span>
                        )}
                      </div>

                      {f.file ? (
                        <div
                          style={{
                            width: '120px',
                            height: '32px',
                            background: `url('${f.file}') center / 100% 100% no-repeat`,
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <span className="small text-muted fst-italic me-2" style={{ fontSize: '0.75rem' }}>Mặc định</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e9d5ff' }}>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating} className="fw-bold" style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}>
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
