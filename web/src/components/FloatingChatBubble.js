import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { API_BASE_URL } from '../config';
import { useSupportKnowledge } from '../SupportKnowledgeContext';
import './FloatingChatBubble.css';

const DEFAULT_MODEL = process.env.REACT_APP_AI_MODEL || 'deepseek-chat';
const AI_API_URL = process.env.REACT_APP_AI_API_URL || '/api/ai/chat';

export default function FloatingChatBubble() {
  const { user, token } = useContext(AuthContext);
  const { aiContext } = useSupportKnowledge();

  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [activeTab, setActiveTab] = useState('group'); // 'group' | 'ai'

  // Tab 1: Group Messages
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Tab 2: AI Assistant
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'welcome-ai',
      role: 'assistant',
      text: 'Xin chào! Mình là trợ lý AI của Đoàn Lục Gia Đường. Bạn cần tư vấn về dịch vụ múa Lân, lịch biểu diễn hay đặt lịch sự kiện?',
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const panelBodyRef = useRef(null);

  // Tự động cuộn xuống cuối
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tải tin nhắn nhóm chung
  const fetchGroupMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data.slice(-20)); // Lấy 20 tin nhắn gần nhất
      }
    } catch {
      // Bỏ qua lỗi kết nối nền
    }
  }, [token]);

  useEffect(() => {
    // Hiện bóng chào mừng sau 2 giây
    const timer = setTimeout(() => setShowGreeting(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'group' && token) {
      fetchGroupMessages();
      const interval = setInterval(fetchGroupMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab, token, fetchGroupMessages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 60);
    }
  }, [isOpen, messages, aiMessages, activeTab]);

  // Gửi tin nhắn nhóm chung
  const handleSendGroupMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !token || isSending) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append('content', inputText.trim());

      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setInputText('');
        setMessages((prev) => [...prev, data.data]);
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      alert('Không thể gửi tin nhắn: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Gửi tin nhắn tới AI
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: aiInput.trim(),
    };

    const nextAiMessages = [...aiMessages, userMsg];
    setAiMessages(nextAiMessages);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: nextAiMessages,
          liveContext: aiContext,
        }),
      });

      const data = await res.json();
      let reply = 'Mình chưa tạo được câu trả lời, bạn thử hỏi lại nhé.';
      if (typeof data?.output_text === 'string') {
        reply = data.output_text;
      } else if (data?.choices?.[0]?.message?.content) {
        reply = data.choices[0].message.content;
      }

      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: reply,
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: 'Rất tiếc, hiện tại AI đang bận. Bạn có thể liên hệ trực tiếp qua mục Liên hệ / Đặt lịch nhé!',
        },
      ]);
    } finally {
      setAiLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <div className="lgd-floating-bubble-wrapper">
      {/* Balloon chào mừng */}
      {showGreeting && !isOpen && (
        <div className="lgd-bubble-greeting" onClick={() => setIsOpen(true)}>
          <span>💬</span>
          <span>Nhắn tin với đoàn & Trợ lý AI ngay!</span>
        </div>
      )}

      {/* Cửa sổ Chat Popup */}
      {isOpen && (
        <div className="lgd-chat-panel">
          {/* Header */}
          <div className="lgd-panel-header">
            <div className="lgd-panel-title-box">
              <span style={{ fontSize: '20px' }}>🦁</span>
              <div>
                <h4 className="lgd-panel-title">Lục Gia Đường Chat</h4>
                <p className="lgd-panel-sub">Trực tuyến • Hỗ trợ 24/7</p>
              </div>
            </div>
            <button
              type="button"
              className="lgd-panel-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="lgd-panel-tabs">
            <button
              type="button"
              className={`lgd-panel-tab ${activeTab === 'group' ? 'active' : ''}`}
              onClick={() => setActiveTab('group')}
            >
              💬 Phòng Chat ({messages.length})
            </button>
            <button
              type="button"
              className={`lgd-panel-tab ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              🤖 Trợ lý AI Đoàn
            </button>
          </div>

          {/* Nội dung Tab 1: Group Chat */}
          {activeTab === 'group' && (
            <>
              <div className="lgd-panel-body" ref={panelBodyRef}>
                {!token ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔒</div>
                    <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                      Vui lòng đăng nhập để tham gia trò chuyện cùng đoàn.
                    </p>
                    <Link
                      to="/login"
                      className="btn btn-sm btn-primary fw-bold px-3 py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                    <p style={{ fontSize: '0.85rem' }}>Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const currentUserId = user?._id || user?.id;
                    const isOutgoing = (msg.sender?._id || msg.sender) === currentUserId;

                    return (
                      <div
                        key={msg._id}
                        className={`lgd-mini-msg ${isOutgoing ? 'outgoing' : 'incoming'}`}
                      >
                        {!isOutgoing && (
                          <div className="lgd-mini-author">{msg.senderName}</div>
                        )}
                        <div className="lgd-mini-bubble">
                          {msg.content}
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Ảnh"
                              style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '4px', display: 'block' }}
                            />
                          )}
                        </div>
                        <div className="lgd-mini-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {token && (
                <div className="lgd-panel-footer">
                  <form className="lgd-panel-form" onSubmit={handleSendGroupMessage}>
                    <input
                      type="text"
                      className="lgd-panel-input"
                      placeholder="Nhập tin nhắn..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="lgd-panel-send-btn"
                      disabled={isSending || !inputText.trim()}
                    >
                      {isSending ? '...' : '➤'}
                    </button>
                  </form>
                  <div style={{ textAlign: 'right', marginTop: '4px' }}>
                    <Link
                      to="/chat"
                      onClick={() => setIsOpen(false)}
                      style={{ fontSize: '0.72rem', color: '#a78bfa', textDecoration: 'none' }}
                    >
                      Mở phòng chat đầy đủ ↗
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Nội dung Tab 2: Trợ lý AI */}
          {activeTab === 'ai' && (
            <>
              <div className="lgd-panel-body">
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`lgd-mini-msg ${msg.role === 'user' ? 'outgoing' : 'incoming'}`}
                  >
                    {!msg.role === 'user' && (
                      <div className="lgd-mini-author" style={{ color: '#38bdf8' }}>AI Hỗ trợ</div>
                    )}
                    <div className="lgd-mini-bubble">
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="lgd-mini-msg incoming">
                    <div className="lgd-mini-author" style={{ color: '#38bdf8' }}>AI Hỗ trợ</div>
                    <div className="lgd-mini-bubble" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      Đang suy nghĩ...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="lgd-panel-footer">
                <form className="lgd-panel-form" onSubmit={handleSendAiMessage}>
                  <input
                    type="text"
                    className="lgd-panel-input"
                    placeholder="Hỏi AI về giá, dịch vụ, biểu diễn..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={aiLoading}
                  />
                  <button
                    type="submit"
                    className="lgd-panel-send-btn"
                    disabled={aiLoading || !aiInput.trim()}
                  >
                    {aiLoading ? '...' : '➤'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Nút Bong bóng Chat Nổi */}
      <button
        type="button"
        className="lgd-bubble-trigger-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowGreeting(false);
        }}
        title="Mở Chat Lục Gia Đường"
        aria-label="Mở Chat Lục Gia Đường"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span className="lgd-bubble-badge" />}
      </button>
    </div>
  );
}
