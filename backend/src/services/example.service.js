/**
 * Service xử lý logic nghiệp vụ ví dụ
 */
function getWelcomeMessage() {
  return {
    projectName: 'Luc Gia Duong Backend',
    version: '1.0.0',
    description: 'RESTful API Server được xây dựng bằng NodeJS và Express',
  };
}

module.exports = {
  getWelcomeMessage,
};
