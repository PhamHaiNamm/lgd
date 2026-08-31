import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './config';
import Header from './components/Header';
import Footer from './components/Footer';
import './ChatPage.css';

export default function ChatPage() {
  const { user, token, isAdmin } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tải danh sách tin nhắn nhóm chung
  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải tin nhắn nhóm:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Tải danh sách thành viên đoàn
  const fetchMembers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/messages/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải thành viên:', err);
    }
  }, [token]);

  // Tự động tải tin nhắn và polling thời gian thực mỗi 2.5s
  useEffect(() => {
    fetchMessages();
    fetchMembers();

    const interval = setInterval(() => {
      fetchMessages();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchMessages, fetchMembers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chọn ảnh đính kèm
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Gửi tin nhắn vào nhóm
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedImage) return;
    if (!token) {
      alert('Vui lòng đăng nhập để gửi tin nhắn.');
      return;
    }

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append('content', messageText.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessageText('');
        handleRemoveImage();
        setMessages((prev) => [...prev, data.data]);
        scrollToBottom();
      } else {
        alert(data.message || 'Lỗi khi gửi tin nhắn.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Xóa tin nhắn
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/messages/${msgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== msgId));
      } else {
        alert(data.message || 'Không thể xóa tin nhắn.');
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="group-chat-page">
      <Header />

      <div className="group-chat-container">
        {!user ? (
          <div className="group-chat-card" style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
            <div style={{ textAlign: 'center', maxWidth: '460px' }}>
              <div style={{ fontSize: '50px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ marginBottom: '10px', color: '#8b5cf6', fontWeight: 'bold' }}>
                Phòng Chat Chung - Lục Gia Đường
              </h3>
              <p style={{ color: '#65676b', marginBottom: '24px', lineHeight: '1.6' }}>
                Không gian trò chuyện, trao đổi công việc và sinh hoạt chung dành cho tất cả thành viên trong đoàn. Vui lòng đăng nhập để tham gia trò chuyện!
              </p>
              <Link
                to="/login"
                className="btn px-4 py-2 fw-bold"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                }}
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="group-chat-card">
            {/* Cột chính: Khu vực Chat nhóm */}
            <div className="chat-feed-area">
              {/* Header nhóm chat */}
              <div className="group-chat-header">
                <div className="group-header-left">
                  <div className="group-icon-badge">
                    🦁
                  </div>
                  <div className="group-header-info">
                    <h3>Phòng Chat Chung Đoàn Lân Sư Rồng Lục Gia Đường</h3>
                    <p>
                      👥 {members.length} thành viên • Trò chuyện & thảo luận trực tuyến
                    </p>
                  </div>
                </div>
              </div>

              {/* Danh sách tin nhắn */}
              <div className="chat-messages-container">
                {loading ? (
                  <div className="chat-empty-box">
                    <p>Đang tải lịch sử tin nhắn...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-box">
                    <div style={{ fontSize: '42px', marginBottom: '10px' }}>👋</div>
                    <h3>Chào mừng đến với Phòng Chat Chung!</h3>
                    <p>Hãy gửi lời chào đầu tiên để bắt đầu cuộc trò chuyện cùng mọi người.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const currentUserId = user?._id || user?.id;
                    const isOutgoing = (msg.sender?._id || msg.sender) === currentUserId;
                    const canDelete = isOutgoing || isAdmin;

                    return (
                      <div
                        key={msg._id}
                        className={`chat-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
                      >
                        {!isOutgoing && (
                          <img
                            src={msg.senderAvatar || 'https://via.placeholder.com/150'}
                            alt={msg.senderName}
                            className="chat-msg-avatar"
                          />
                        )}

                        <div className="chat-msg-content-wrapper">
                          {!isOutgoing && (
                            <div className="chat-msg-author-header">
                              <span className="author-name-text">{msg.senderName}</span>
                              <span
                                className={`author-role-tag ${
                                  msg.senderRole === 'admin' ? 'role-admin' : 'role-user'
                                }`}
                              >
                                {msg.senderRole === 'admin' ? 'Admin' : 'Thành viên'}
                              </span>
                            </div>
                          )}

                          <div className="chat-bubble-box">
                            {msg.content && <div>{msg.content}</div>}
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="Hình ảnh đính kèm"
                                className="chat-attached-image"
                                onClick={() => window.open(msg.imageUrl, '_blank')}
                              />
                            )}
                          </div>

                          <div className="chat-msg-time">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {canDelete && (
                              <button
                                className="btn-msg-delete"
                                onClick={() => handleDeleteMessage(msg._id)}
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Khung soạn thảo & gửi tin nhắn */}
              <div className="chat-input-footer">
                {imagePreview && (
                  <div className="chat-image-preview-strip">
                    <img src={imagePreview} alt="Preview" className="preview-thumb-img" />
                    <button className="btn-remove-thumb-btn" onClick={handleRemoveImage}>
                      ✕
                    </button>
                    <span style={{ fontSize: '13px', color: '#65676b' }}>
                      Đã chọn 1 ảnh đính kèm
                    </span>
                  </div>
                )}

                <form className="chat-form-row" onSubmit={handleSendMessage}>
                  <label className="btn-attach-photo" title="Đính kèm hình ảnh">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleSelectImage}
                    />
                  </label>

                  <input
                    type="text"
                    className="chat-input-field"
                    placeholder={`Gửi tin nhắn đến tất cả thành viên trong đoàn...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="btn-send-message"
                    disabled={isSending || (!messageText.trim() && !selectedImage)}
                    title="Gửi tin nhắn"
                  >
                    {isSending ? '...' : '➤'}
                  </button>
                </form>
              </div>
            </div>

            {/* Cột bên phải: Danh sách thành viên */}
            <div className="group-members-sidebar">
              <div className="members-sidebar-header">
                <h4>Thành viên ({members.length})</h4>
              </div>

              <div className="members-sidebar-list">
                {members.map((m) => (
                  <div className="member-list-item" key={m._id}>
                    <img
                      src={m.avatar || 'https://via.placeholder.com/150'}
                      alt={m.name}
                      className="member-item-avatar"
                    />
                    <div className="member-item-info">
                      <p className="member-item-name">
                        {m.name || m.username}{' '}
                        {m.role === 'admin' && (
                          <span className="author-role-tag role-admin" style={{ marginLeft: '4px' }}>
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="member-item-sub">
                        {m.location ? `📍 ${m.location}` : m.birthYear ? `🎂 ${m.birthYear}` : `@${m.username}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
