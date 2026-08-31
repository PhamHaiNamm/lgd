import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { DecorativeTitle, FestivalStrip, LanternIcon } from './components/Decorations';
import { useSupportKnowledge } from './SupportKnowledgeContext';
import './AIAssistantPage.css';

const DEFAULT_MODEL = process.env.REACT_APP_AI_MODEL || 'deepseek-chat';
const API_URL = process.env.REACT_APP_AI_API_URL || '/api/ai/chat';

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Xin chào, mình là trợ lý AI của Lục Gia Đường. Bạn có thể hỏi về lịch biểu diễn, nội dung giới thiệu, ý tưởng bài đăng hoặc soạn nội dung liên hệ.',
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
      if (content?.type === 'text' && content?.text) {
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

function AIAssistantPage() {
  const { aiContext } = useSupportKnowledge();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [model] = useState(DEFAULT_MODEL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const messagesRef = useRef(null);

  const canSend = input.trim() && !loading && cooldownSeconds === 0;

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const submitPrompt = async (event) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || loading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
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
          model,
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
          'Không thể gọi DeepSeek API.'
        );
      }

      const assistantText = extractOutputText(data) || 'Mình chưa tạo được câu trả lời. Bạn thử hỏi lại theo cách khác nhé.';

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
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

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setError('');
    setInput('');
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
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black)' }}>
      <Header />

      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <div className="ai-hero-card rounded-4 p-4 p-lg-5">
          <div className="row g-4 align-items-center justify-content-center">
            <div className="col-lg-8 text-center mx-auto">
              <p className="ai-eyebrow mb-3 justify-content-center">
                <LanternIcon size={20} className="me-2" />
                Trợ lý AI cho website
              </p>
              <h1 className="fw-bold mb-3" style={{ color: 'var(--lgd-accent-bright)' }}>
                <DecorativeTitle showIcons={true}>Trợ lý Lục Gia Sư</DecorativeTitle>
              </h1>
                <p className="mb-0 ai-hero-copy">
                Khung chat này dùng AI để trả lời câu hỏi, hỗ trợ viết nội dung và tư vấn nhanh cho khách truy cập website.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="container mb-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="ai-control-card rounded-4 p-4 h-100">
              <h3 className="h5 fw-bold mb-3">Cấu hình trợ lý</h3>

              <label className="form-label fw-semibold">Trợ Lý</label>
              <input
                className="form-control mb-3"
                value={'LỤC GIA SƯ'}
                disabled
                readOnly
              />

              <div className="ai-tip-box rounded-4 p-3 mb-3">
                <strong className="d-block mb-2">Model đang dùng</strong>
                <p className="mb-0"><code>{model}</code> để tiết kiệm quota và chi phí hơn.</p>
              </div>

              <button type="button" className="btn btn-outline-light w-100" onClick={clearChat} disabled={loading}>
                Xóa hội thoại
              </button>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="ai-chat-card rounded-4 p-3 p-md-4">
              <div ref={messagesRef} className="ai-messages mb-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`ai-message-bubble ${message.role === 'user' ? 'ai-message-user' : 'ai-message-assistant'}`}
                  >
                    <div className="ai-message-role">{message.role === 'user' ? 'Bạn' : 'Trợ lý AI'}</div>
                    <div className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
                  </div>
                ))}

                {loading && (
                  <div className="ai-message-bubble ai-message-assistant">
                    <div className="ai-message-role">Trợ lý AI</div>
                    <div className="ai-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={submitPrompt}>
                <label htmlFor="ai-prompt" className="form-label fw-semibold">
                  Nhập câu hỏi cho trợ lý
                </label>
                <div className="ai-input-wrap">
                  <textarea
                    id="ai-prompt"
                    className="form-control ai-input-textarea"
                    rows="5"
                    placeholder="Ví dụ: Viết giúp tôi nội dung giới thiệu dịch vụ múa lân cho lễ khai trương."
                    value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading || cooldownSeconds > 0}
                />
                  <button type="submit" className="btn btn-primary ai-input-send" disabled={!canSend}>
                    {loading ? '...' : '➤'}
                  </button>
                </div>

                {error && (
                  <div className="alert alert-danger mt-3 mb-0">
                    {error}
                  </div>
                )}

                <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center mt-3">
                  <small style={{ color: 'var(--lgd-text-muted)' }}>
                    {cooldownSeconds > 0
                      ? `Hệ thống đang bận, vui lòng thử lại sau ${cooldownSeconds} giây.`
                      : 'Bản này dùng backend proxy nên phù hợp hơn để public website.'}
                  </small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AIAssistantPage;
