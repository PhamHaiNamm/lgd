const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const customerSupportData = require('../data/customerSupportData');
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateStore = new Map();
const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

function getClientIp(request) {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.socket?.remoteAddress || request.connection?.remoteAddress || 'unknown';
}

function isRateLimited(ipAddress) {
  const now = Date.now();
  const attempts = (rateStore.get(ipAddress) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  attempts.push(now);
  rateStore.set(ipAddress, attempts);
  return attempts.length > RATE_LIMIT_MAX;
}

function normalizeMessages(messages) {
  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      role: message.role,
      text: String(message.text || '').trim(),
    }))
    .filter((message) => message.text);
}

function scoreEntry(text, queryTerms) {
  const haystack = text.toLowerCase();
  return queryTerms.reduce((score, term) => {
    if (!term || term.length < 2) {
      return score;
    }
    return haystack.includes(term) ? score + 1 : score;
  }, 0);
}

function buildKnowledgeSnippet(messages, liveContext) {
  const latestUserMessage = [...normalizeMessages(messages)]
    .reverse()
    .find((message) => message.role === 'user');

  const queryText = latestUserMessage?.text?.toLowerCase() || '';
  const queryTerms = queryText
    .split(/[^a-zA-Z0-9\u00C0-\u1EF9]+/)
    .filter(Boolean);

  const serviceMatches = customerSupportData.services
    .map((service) => ({
      score: scoreEntry(
        `${service.name} ${service.summary} ${service.bestFor.join(' ')} ${service.props}`,
        queryTerms
      ),
      service,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ service }) => service);

  const quickMatches = customerSupportData.quickAnswers
    .filter((item) => scoreEntry(`${item.topic} ${item.answer}`, queryTerms) > 0)
    .slice(0, 3);

  return {
    organizationInfo: customerSupportData.organizationInfo,
    contact: customerSupportData.contact,
    supportRules: customerSupportData.supportRules,
    leadCollectionChecklist: customerSupportData.leadCollectionChecklist,
    quickAnswers: quickMatches.length ? quickMatches : customerSupportData.quickAnswers,
    relevantServices: serviceMatches.length ? serviceMatches : customerSupportData.services.slice(0, 3),
    liveContext: liveContext || null,
  };
}

function buildSystemInstruction(messages, liveContext) {
  const knowledge = buildKnowledgeSnippet(messages, liveContext);

  return [
    'Bạn là trợ lý CSKH cho website đoàn Lân Sư Rồng Lục Gia Đường.',
    'Bạn tên là Lục Gia Sư',
    'Nếu khách hỏi giá của nhiều tiết mục, thì hãy cộng tổng giá các tiết mục đó để báo giá tổng, không cần báo giá từng tiết mục một.',
    'Nhiệm vụ của bạn là tư vấn dịch vụ, hỗ trợ khách đặt lịch, giải thích tiết mục và hướng dẫn để lại thông tin liên hệ.',
    'Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, thực tế, tránh lan man.',
    'Thông tin cố định của đoàn: đoàn thành lập từ năm 2023.',
    'Nếu khách hỏi về giá chi tiết hoặc ngày trống cụ thể mà chưa có dữ liệu chính thức, hãy nói rõ cần xác nhận lại với trưởng đoàn.',
    'Nếu phù hợp, hãy chủ động gợi ý khách cung cấp thêm các thông tin cần thiết để báo giá hoặc giữ lịch.',
    'Nếu câu hỏi liên quan tới số lượng thành viên, thông tin thành viên, hoặc lịch biểu diễn, hãy ưu tiên dùng phần liveContext nếu có.',
    'Nếu khách hỏi "lịch sắp tới", chỉ được trả lời bằng các lịch trong hôm nay và 2 ngày tiếp theo, ưu tiên dùng liveContext.upcomingSchedule.',
    'Nếu liveContext.upcomingSchedule không có dữ liệu thì nói hiện chưa có lịch sắp tới trong 3 ngày gần nhất.',
    `Du lieu noi bo CSKH: ${JSON.stringify(knowledge)}`,
  ].join('\n');
}

function buildDeepSeekMessages(messages, liveContext) {
  return [
    {
      role: 'system',
      content: buildSystemInstruction(messages, liveContext),
    },
    ...normalizeMessages(messages).map((message) => ({
      role: message.role,
      content: message.text,
    })),
  ];
}

function extractRetryAfterSeconds(message) {
  if (typeof message !== 'string') {
    return null;
  }

  const match = message.match(/(?:Please retry in|try again in|retry after)\s+([\d.]+)\s*(?:s|seconds?)/i);
  if (!match) {
    return null;
  }

  const seconds = Math.ceil(Number(match[1]));
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function extractDeepSeekText(data) {
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function callDeepSeek({ model, messages, apiKey, liveContext }) {
  const deepseekMessages = buildDeepSeekMessages(messages, liveContext);
  if (deepseekMessages.length <= 1) {
    return { status: 400, body: { error: 'Thiếu nội dung hội thoại.' } };
  }

  const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: deepseekMessages,
      temperature: 0.7,
      max_tokens: 700,
      stream: false,
    }),
  });

  const data = await deepseekResponse.json();
  if (!deepseekResponse.ok) {
    const rawError = data?.error?.message || 'Không thể gọi DeepSeek API.';
    const retryAfterSeconds = extractRetryAfterSeconds(rawError);
    return {
      status: deepseekResponse.status,
      body: {
        error: retryAfterSeconds
          ? `Hệ thống đang bận, vui lòng thử lại sau ${retryAfterSeconds} giây.`
          : rawError,
        retryAfterSeconds,
        rawError,
      },
    };
  }

  return {
    status: 200,
    body: {
      output_text: extractDeepSeekText(data),
    },
  };
}

async function handleAiChat({ method, headers, body, ipAddress }) {
  if (method !== 'POST') {
    return { status: 405, body: { error: 'Method không được hỗ trợ.' } };
  }

  if (isRateLimited(ipAddress)) {
    return { status: 429, body: { error: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.' } };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { status: 500, body: { error: 'Server chưa cấu hình DEEPSEEK_API_KEY.' } };
  }

  try {
    const payload = typeof body === 'string' ? (body ? JSON.parse(body) : {}) : (body || {});
    const model = payload?.model || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];
    const liveContext = payload?.liveContext || null;

    return await callDeepSeek({
      model,
      messages,
      apiKey,
      liveContext,
    });
  } catch (error) {
    return { status: 500, body: { error: error.message || 'Lỗi server khi xử lý yêu cầu AI.' } };
  }
}

module.exports = {
  getClientIp,
  handleAiChat,
};
