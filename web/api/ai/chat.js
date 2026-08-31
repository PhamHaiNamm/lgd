const { getClientIp, handleAiChat } = require('../../lib/aiProxy');

module.exports = async (request, response) => {
  const result = await handleAiChat({
    method: request.method,
    headers: request.headers,
    body: request.body,
    ipAddress: getClientIp(request),
  });

  response.status(result.status).json(result.body);
};
