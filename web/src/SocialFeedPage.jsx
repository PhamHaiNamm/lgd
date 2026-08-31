import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './config';
import Header from './components/Header';
import Footer from './components/Footer';
import './SocialFeedPage.css';

export default function SocialFeedPage() {
  const { user, token, isAdmin, updateUserData, logout } = useContext(AuthContext);

  // States bài đăng & feed
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // States Modal Profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    birthYear: '',
    location: '',
    bio: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // States Modal Admin Users
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [adminUserForm, setAdminUserForm] = useState({
    name: '',
    username: '',
    role: 'user',
    birthYear: '',
    location: '',
    bio: '',
    password: '',
  });
  const [isSavingAdminUser, setIsSavingAdminUser] = useState(false);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    password: '123',
    role: 'user',
    birthYear: '',
    location: '',
    bio: '',
  });

  const fileInputRef = useRef(null);

  // Load danh sách bài viết
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch(`${API_BASE_URL}/posts`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Xử lý chọn ảnh đăng bài
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Tạo bài đăng mới
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Vui lòng đăng nhập để đăng bài.');
      return;
    }
    if (!selectedFile) {
      alert('Vui lòng chọn 1 hình ảnh để đăng.');
      return;
    }

    try {
      setIsPosting(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setCaption('');
        handleRemoveImage();
        fetchPosts();
      } else {
        alert(data.message || 'Lỗi khi đăng bài.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  // Thả tim bài viết
  const handleLikePost = async (postId) => {
    if (!token) {
      alert('Vui lòng đăng nhập để thích bài viết.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              const currentUserId = user?._id || user?.id;
              const hasLiked = p.likes?.some((uid) => uid === currentUserId || uid?._id === currentUserId);
              const updatedLikes = hasLiked
                ? p.likes.filter((uid) => uid !== currentUserId && uid?._id !== currentUserId)
                : [...(p.likes || []), currentUserId];
              return { ...p, likes: updatedLikes };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Xóa bài viết
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else {
        alert(data.message || 'Không thể xóa bài viết.');
      }
    } catch (err) {
      alert('Lỗi khi xóa bài: ' + err.message);
    }
  };

  // Mở Modal Sửa Profile
  const handleOpenProfileModal = () => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      birthYear: user.birthYear || '',
      location: user.location || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
    setAvatarPreview(user.avatar || '');
    setAvatarFile(null);
    setShowProfileModal(true);
  };

  // Lưu Profile cá nhân
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);

      let avatarUrl = profileForm.avatar;

      // Nếu có chọn ảnh avatar mới thì upload lên Cloudinary trước
      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        const uploadRes = await fetch(`${API_BASE_URL}/upload/single`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          avatarUrl = uploadData.data.url;
        }
      }

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileForm,
          avatar: avatarUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateUserData(data.data);
        setShowProfileModal(false);
        fetchPosts(); // Refresh để cập nhật avatar/tên mới trên bài đăng
        alert('Cập nhật thông tin cá nhân thành công!');
      } else {
        alert(data.message || 'Lỗi khi cập nhật thông tin.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Admin: Tải danh sách user
  const fetchUsersForAdmin = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAdminModal = () => {
    setShowAdminModal(true);
    fetchUsersForAdmin();
  };

  // Admin: Chọn user để sửa
  const handleSelectUserToEdit = (targetUser) => {
    setEditingUser(targetUser);
    setAdminUserForm({
      name: targetUser.name || '',
      username: targetUser.username || '',
      role: targetUser.role || 'user',
      birthYear: targetUser.birthYear || '',
      location: targetUser.location || '',
      bio: targetUser.bio || '',
      password: '',
    });
  };

  // Admin: Lưu sửa user
  const handleSaveUserByAdmin = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSavingAdminUser(true);
      const payload = { ...adminUserForm };
      if (!payload.password) delete payload.password; // Nếu không đổi pass thì bỏ qua

      const res = await fetch(`${API_BASE_URL}/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert('Đã cập nhật thông tin thành viên!');
        setEditingUser(null);
        fetchUsersForAdmin();
        fetchPosts();
      } else {
        alert(data.message || 'Lỗi khi cập nhật.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSavingAdminUser(false);
    }
  };

  // Admin: Xóa user
  const handleDeleteUserByAdmin = async (targetUserId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này và tất cả bài viết của họ?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã xóa thành viên!');
        fetchUsersForAdmin();
        fetchPosts();
      } else {
        alert(data.message || 'Lỗi khi xóa.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Admin: Tạo mới user
  const handleCreateUserFromAdminModal = async (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.username.trim() || !newUserForm.password.trim()) {
      alert('Vui lòng điền đủ Họ tên, Username và Password.');
      return;
    }
    try {
      setIsSavingAdminUser(true);
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newUserForm,
          birthYear: newUserForm.birthYear ? Number(newUserForm.birthYear) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Tạo tài khoản thành viên thành công!');
        setIsCreatingNewUser(false);
        setNewUserForm({
          name: '',
          username: '',
          password: '123',
          role: 'user',
          birthYear: '',
          location: '',
          bio: '',
        });
        fetchUsersForAdmin();
      } else {
        alert(data.message || 'Lỗi khi tạo tài khoản.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setIsSavingAdminUser(false);
    }
  };

  return (
    <div className="social-feed-page">
      <Header />

      <div className="social-container">
        {/* Topbar thông tin & điều khiển */}
        <div className="social-topbar">
          <div className="social-topbar-left">
            {user ? (
              <>
                <img
                  src={user.avatar || 'https://via.placeholder.com/150'}
                  alt={user.name}
                  className="user-mini-avatar"
                />
                <div className="user-mini-info">
                  <h4>{user.name || user.username}</h4>
                  <span className={`user-badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>
                    {isAdmin ? 'Quản trị viên (Admin)' : 'Thành viên'}
                  </span>
                </div>
              </>
            ) : (
              <div>
                <h4>Cộng đồng Lục Gia Đường</h4>
                <span className="post-time">Đăng nhập để chia sẻ khoảnh khắc</span>
              </div>
            )}
          </div>

          <div className="social-topbar-actions">
            {user ? (
              <>
                <button className="btn-action btn-secondary-action" onClick={handleOpenProfileModal}>
                  ✏️ Sửa trang cá nhân
                </button>

                {isAdmin && (
                  <button className="btn-action btn-admin-action" onClick={handleOpenAdminModal}>
                    ⚙️ Quản trị thành viên
                  </button>
                )}

                <button className="btn-action btn-secondary-action" onClick={logout}>
                  🚪 Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-action btn-primary-action" style={{ textDecoration: 'none' }}>
                🔑 Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Khung tạo bài viết mới */}
        {user && (
          <div className="create-post-card">
            <div className="create-post-header">
              <img
                src={user.avatar || 'https://via.placeholder.com/150'}
                alt={user.name}
                className="user-mini-avatar"
              />
              <textarea
                className="create-post-textarea"
                rows="3"
                placeholder={`${user.name || user.username} ơi, bạn đang nghĩ gì thế?`}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Preview hình ảnh đã chọn */}
            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="image-preview" />
                <button className="btn-remove-preview" onClick={handleRemoveImage}>
                  ✕
                </button>
              </div>
            )}

            <div className="create-post-footer">
              <label className="file-upload-btn">
                🖼️ Thêm hình ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="file-upload-input"
                  ref={fileInputRef}
                  onChange={handleSelectImage}
                />
              </label>

              <button
                className="btn-submit-post"
                disabled={isPosting || !selectedFile}
                onClick={handleCreatePost}
              >
                {isPosting ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </div>
        )}

        {/* Danh sách bài đăng (Feed Stream) */}
        <div className="feed-stream">
          {loadingPosts ? (
            <div className="feed-empty-state">
              <p>Đang tải bài viết...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="feed-empty-state">
              <h3>Chưa có bài đăng nào</h3>
              <p>Hãy là người đầu tiên chia sẻ hình ảnh đẹp tại đây!</p>
            </div>
          ) : (
            posts.map((post) => {
              const currentUserId = user?._id || user?.id;
              const hasLiked = post.likes?.some(
                (uid) => uid === currentUserId || uid?._id === currentUserId
              );
              const canDelete =
                user &&
                (isAdmin ||
                  post.author === currentUserId ||
                  post.author?._id === currentUserId);

              return (
                <div className="post-card" key={post._id}>
                  {/* Header bài đăng */}
                  <div className="post-card-header">
                    <div className="post-author-box">
                      <img
                        src={post.authorAvatar || 'https://via.placeholder.com/150'}
                        alt={post.authorName}
                        className="post-author-avatar"
                      />
                      <div>
                        <h4 className="post-author-name">{post.authorName}</h4>
                        <span className="post-time">
                          {new Date(post.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        className="btn-delete-post"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </div>

                  {/* Caption */}
                  {post.caption && <div className="post-caption">{post.caption}</div>}

                  {/* Ảnh bài viết */}
                  {post.imageUrl && (
                    <div className="post-image-container">
                      <img
                        src={post.imageUrl}
                        alt={post.caption || 'Bài đăng'}
                        className="post-image"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Footer tương tác */}
                  <div className="post-card-footer">
                    <button
                      className={`btn-like ${hasLiked ? 'liked' : ''}`}
                      onClick={() => handleLikePost(post._id)}
                    >
                      {hasLiked ? '❤️ Đã thích' : '🤍 Thích'} ({post.likes?.length || 0})
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Người dùng tự sửa thông tin cá nhân */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header-box">
              <h3>Chỉnh sửa trang cá nhân</h3>
              <button className="btn-close-modal" onClick={() => setShowProfileModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-body-box">
                {/* Chọn Avatar */}
                <div className="avatar-edit-preview">
                  <img
                    src={avatarPreview || profileForm.avatar || 'https://via.placeholder.com/150'}
                    alt="Avatar"
                    className="avatar-preview-img"
                  />
                  <div>
                    <label className="btn-action btn-secondary-action">
                      📸 Đổi ảnh đại diện
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setAvatarFile(file);
                            setAvatarPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label>Năm sinh</label>
                  <input
                    type="number"
                    className="form-control-custom"
                    placeholder="Ví dụ: 2000"
                    value={profileForm.birthYear}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, birthYear: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-custom">
                  <label>Vị trí / Quê quán</label>
                  <input
                    type="text"
                    className="form-control-custom"
                    placeholder="Ví dụ: Hà Nội, Việt Nam"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, location: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-custom">
                  <label>Tiểu sử / Giới thiệu</label>
                  <textarea
                    rows="3"
                    className="form-control-custom"
                    placeholder="Đôi lời giới thiệu về bạn..."
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-box">
                <button
                  type="button"
                  className="btn-action btn-secondary-action"
                  onClick={() => setShowProfileModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-action btn-primary-action"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin Quản Trị Thành Viên (Sửa tất cả) */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="modal-content-card modal-content-large">
            <div className="modal-header-box">
              <h3>⚙️ Quản trị thành viên (Quyền Admin)</h3>
              <button className="btn-close-modal" onClick={() => setShowAdminModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body-box">
              {editingUser ? (
                /* Form Admin chỉnh sửa thông tin của user */
                <form onSubmit={handleSaveUserByAdmin}>
                  <h4 style={{ marginBottom: '16px', color: '#1877f2' }}>
                    Chỉnh sửa thành viên: <strong>@{editingUser.username}</strong>
                  </h4>

                  <div className="form-group-custom">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={adminUserForm.name}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Vai trò (Role)</label>
                    <select
                      className="form-control-custom"
                      value={adminUserForm.role}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, role: e.target.value })}
                    >
                      <option value="user">User (Thành viên)</option>
                      <option value="admin">Admin (Quản trị viên)</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Năm sinh</label>
                    <input
                      type="number"
                      className="form-control-custom"
                      value={adminUserForm.birthYear}
                      onChange={(e) =>
                        setAdminUserForm({ ...adminUserForm, birthYear: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Vị trí</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      value={adminUserForm.location}
                      onChange={(e) =>
                        setAdminUserForm({ ...adminUserForm, location: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Tiểu sử / Miêu tả</label>
                    <textarea
                      rows="2"
                      className="form-control-custom"
                      value={adminUserForm.bio}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, bio: e.target.value })}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Đặt lại mật khẩu mới (Để trống nếu không đổi)</label>
                    <input
                      type="password"
                      className="form-control-custom"
                      placeholder="Nhập mật khẩu mới cho user..."
                      value={adminUserForm.password}
                      onChange={(e) =>
                        setAdminUserForm({ ...adminUserForm, password: e.target.value })
                      }
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn-action btn-secondary-action"
                      onClick={() => setEditingUser(null)}
                    >
                      Quay lại danh sách
                    </button>
                    <button
                      type="submit"
                      className="btn-action btn-primary-action"
                      disabled={isSavingAdminUser}
                    >
                      {isSavingAdminUser ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                  </div>
                </form>
              ) : isCreatingNewUser ? (
                /* Form Admin tạo mới user */
                <form onSubmit={handleCreateUserFromAdminModal}>
                  <h4 style={{ marginBottom: '16px', color: '#10b981' }}>
                    ➕ Tạo tài khoản thành viên mới
                  </h4>

                  <div className="form-group-custom">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="VD: Nguyễn Văn A"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Tên đăng nhập (Username) *</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="VD: nguyenvana (viết liền không dấu)"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Mật khẩu ban đầu *</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="Mặc định: 123"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Vai trò (Role)</label>
                    <select
                      className="form-control-custom"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                      <option value="user">User (Thành viên)</option>
                      <option value="admin">Admin (Quản trị viên)</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Năm sinh</label>
                    <input
                      type="number"
                      className="form-control-custom"
                      placeholder="VD: 2008"
                      value={newUserForm.birthYear}
                      onChange={(e) => setNewUserForm({ ...newUserForm, birthYear: e.target.value })}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Khu vực / Tỉnh thành</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="VD: Quảng Ninh..."
                      value={newUserForm.location}
                      onChange={(e) => setNewUserForm({ ...newUserForm, location: e.target.value })}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Tiểu sử / Miêu tả</label>
                    <textarea
                      rows="2"
                      className="form-control-custom"
                      placeholder="Giới thiệu về thành viên..."
                      value={newUserForm.bio}
                      onChange={(e) => setNewUserForm({ ...newUserForm, bio: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn-action btn-secondary-action"
                      onClick={() => setIsCreatingNewUser(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn-action btn-primary-action"
                      disabled={isSavingAdminUser}
                    >
                      {isSavingAdminUser ? 'Đang tạo...' : '💾 Tạo tài khoản'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Bảng danh sách thành viên */
                <div className="admin-table-responsive">
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-action btn-primary-action"
                      onClick={() => setIsCreatingNewUser(true)}
                    >
                      ➕ Thêm tài khoản mới
                    </button>
                  </div>
                  {loadingUsers ? (
                    <p>Đang tải danh sách...</p>
                  ) : (
                    <table className="admin-users-table">
                      <thead>
                        <tr>
                          <th>Avatar</th>
                          <th>Tên hiển thị</th>
                          <th>Username</th>
                          <th>Vai trò</th>
                          <th>Năm sinh</th>
                          <th>Vị trí</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <img
                                src={u.avatar || 'https://via.placeholder.com/150'}
                                alt={u.username}
                                className="table-avatar"
                              />
                            </td>
                            <td>{u.name}</td>
                            <td>@{u.username}</td>
                            <td>
                              <span
                                className={`user-badge ${
                                  u.role === 'admin' ? 'badge-admin' : 'badge-user'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td>{u.birthYear || '-'}</td>
                            <td>{u.location || '-'}</td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="btn-tbl-edit"
                                  onClick={() => handleSelectUserToEdit(u)}
                                >
                                  Sửa
                                </button>
                                {u._id !== (user?._id || user?.id) && (
                                  <button
                                    className="btn-tbl-delete"
                                    onClick={() => handleDeleteUserByAdmin(u._id)}
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer-box">
              <button
                type="button"
                className="btn-action btn-secondary-action"
                onClick={() => setShowAdminModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
