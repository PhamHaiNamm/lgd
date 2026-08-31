import React, { useEffect, useRef, useState } from 'react';
import { useSupportKnowledge } from '../SupportKnowledgeContext';
import './FloatingAIChat.css';

const DEFAULT_MODEL = process.env.REACT_APP_AI_MODEL || 'deepseek-chat';
const API_URL = process.env.REACT_APP_AI_API_URL || '/api/ai/chat';

const INITIAL_MESSAGES = [
  {
    id: 'welcome-floating',
    role: 'assistant',
    text: 'Xin chào, mình là trợ lý AI. Bạn cần tư vấn dịch vụ, lịch biểu diễn hay nội dung giới thiệu?',
  },
];

function extractOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const segments = [];
  (data?.output || []).forEach((item) => {
    (item?.content || []).forEach((content) => {
      if (content?.type === 'output_text' && content?.text) {
        segments.push(content.text);
      }
    });
  });

  return segments.join('\n').trim();
}

async function parseApiResponse(response) {
  const rawText = await response.text();

  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    if (!response.ok) {
      throw new Error('Không kết nối được tới AI server. Hãy kiểm tra backend `npm run server` đang chạy.');
    }
    throw new Error('Phản hồi từ server không hợp lệ.');
  }
}

function FloatingAIChat() {
  const { aiContext } = useSupportKnowledge();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const messagesRef = useRef(null);

  const canSend = input.trim() && !loading && cooldownSeconds === 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowGreeting(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || loading) {
      return;
    }

    const userMessage = {
      id: `floating-user-${Date.now()}`,
      role: 'user',
      text: trimmedInput,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: nextMessages,
          liveContext: aiContext,
        }),
      });

      const data = await parseApiResponse(response);
      if (!response.ok) {
        if (typeof data?.retryAfterSeconds === 'number' && data.retryAfterSeconds > 0) {
          setCooldownSeconds(data.retryAfterSeconds);
        }
        throw new Error(
          (typeof data?.error === 'string' && data.error) ||
          data?.error?.message ||
          'Không thể gọi trợ lý AI.'
        );
      }

      const assistantText = extractOutputText(data) || 'Mình chưa tạo được câu trả lời, bạn thử hỏi lại nhé.';
      setMessages((current) => [
        ...current,
        {
          id: `floating-assistant-${Date.now()}`,
          role: 'assistant',
          text: assistantText,
        },
      ]);
    } catch (apiError) {
      setError(apiError.message || 'Đã xảy ra lỗi khi gửi câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInput('');
    setError('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  };

  return (
    <div className="floating-ai">
      {showGreeting && !isOpen && (
        <button
          type="button"
          className="floating-ai__greeting"
          onClick={() => setIsOpen(true)}
        >
          Xin chào, bạn cần tư vấn gì hôm nay?
        </button>
      )}

      {isOpen && (
        <div className="floating-ai__panel">
          <div className="floating-ai__header">
            <div>
              <div className="floating-ai__title">Trợ lý AI</div>
              <div className="floating-ai__subtitle">Hỗ trợ nhanh cho khách truy cập</div>
            </div>
            <button
              type="button"
              className="floating-ai__close"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
            >
              x
            </button>
          </div>

          <div ref={messagesRef} className="floating-ai__messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`floating-ai__bubble ${message.role === 'user' ? 'floating-ai__bubble--user' : 'floating-ai__bubble--assistant'}`}
              >
                <div className="floating-ai__role">{message.role === 'user' ? 'Bạn' : 'AI'}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
              </div>
            ))}

            {loading && (
              <div className="floating-ai__bubble floating-ai__bubble--assistant">
                <div className="floating-ai__role">AI</div>
                <div className="floating-ai__typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <form className="floating-ai__form" onSubmit={handleSubmit}>
            <div className="floating-ai__input-wrap">
              <textarea
                className="form-control floating-ai__textarea"
                rows="3"
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || cooldownSeconds > 0}
              />
              <button type="submit" className="btn btn-primary btn-sm floating-ai__send" disabled={!canSend}>
                {loading ? '...' : '➤'}
              </button>
            </div>

            {error && <div className="alert alert-danger mt-2 mb-0 py-2">{error}</div>}
            {cooldownSeconds > 0 && (
              <div className="floating-ai__cooldown">
                Hệ thống đang bận, vui lòng thử lại sau {cooldownSeconds} giây.
              </div>
            )}

            <div className="floating-ai__actions">
              <button type="button" className="btn btn-outline-light btn-sm" onClick={handleReset} disabled={loading}>
                Xóa
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        className="floating-ai__trigger"
        onClick={() => {
          setIsOpen((current) => !current);
          setShowGreeting(false);
        }}
        aria-label="Mở trợ lý AI"
      >
        {isOpen ? 'An' : 'AI'}
      </button>
    </div>
  );
}

export default FloatingAIChat;
