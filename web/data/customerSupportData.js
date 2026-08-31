const customerSupportData = {
  businessName: 'Lục Gia Đường',
  brandVoice: {
    language: 'Tiếng Việt',
    style: [
      'Thân thiện, lễ phép, rõ ràng',
      'Ưu tiên hỗ trợ khách hàng ra quyết định nhanh',
      'Không khẳng định những thông tin chưa chắc chắn',
      'Nếu thiếu dữ liệu cụ thể như báo giá hoặc ngày trống, hướng dẫn khách liên hệ trực tiếp',
    ],
  },
  supportRules: [
    'Luôn xưng hô lịch sự, ưu tiên dùng "quý khách" hoặc "anh/chị".',
    'Nếu khách hỏi cách đặt lịch, hãy hướng dẫn liên hệ trực tiếp với trưởng đoàn.',
    'Không tự bịa giá chi tiết nếu website chưa có bảng giá chính thức.',
    'Nếu khách hỏi lịch trống, nói rằng cần kiểm tra lịch biểu diễn thực tế để xác nhận.',
    'Nếu khách muốn báo giá nhanh, hãy hỏi ngày tổ chức, địa điểm, loại tiết mục và thời lượng mong muốn.',
  ],
  quickAnswers: [
    {
      topic: 'đặt lịch',
      answer: 'Quý khách có thể đặt lịch bằng cách liên hệ trực tiếp trưởng đoàn để trao đổi ngày diễn, địa điểm, loại tiết mục và quy mô sự kiện.',
    },
    {
      topic: 'báo giá',
      answer: 'Một số gói múa lân cơ bản đã có giá tham khảo. Tuy nhiên với các tiết mục đặc biệt hoặc yêu cầu riêng, quý khách vẫn nên liên hệ trực tiếp để được báo giá chính xác.',
    },
    {
      topic: 'lịch biểu diễn',
      answer: 'Lịch biểu diễn có thể thay đổi theo từng thời điểm. Nếu quý khách cần kiểm tra ngày trống, vui lòng để lại ngày mong muốn hoặc liên hệ trực tiếp để được xác nhận.',
    },
  ],
  contact: {
    primaryContact: {
      fullName: 'Phạm Hải Nam',
      role: 'Trưởng đoàn',
      phone: '0345422378',
    },
    secondaryContact: {
      fullName: 'Hồ Ngọc Thảo',
      phone: '0379872058',
    },
  },
  organizationInfo: {
    headquarters: 'Khu Trới 6, phường Hoành Bồ, tỉnh Quảng Ninh',
    summary: 'Lục Gia Đường là đoàn Lân - Sư - Rồng chuyên biểu diễn cho lễ hội, khai trương, khánh thành và nhiều sự kiện khác.',
    strengths: [
      'Đội ngũ giàu kinh nghiệm, biểu diễn bài bản và chuyên nghiệp',
      'Từng hợp tác và biểu diễn cùng nghệ sĩ Đen Vâu',
      'Có thành tích tại Giải giao lưu Đền Gin (Nam Định)',
    ],
  },
  services: [
    {
      id: 'song_lan',
      name: 'Song Lân (Hai Lân)',
      price: '2.500.000 VNĐ',
      duration: '7 - 8 phút',
      props: '2 đầu lân, ông Địa',
      bestFor: ['khai trương', 'khánh thành', 'sự kiện cần không khí vui tươi'],
      summary: 'Tiết mục hai chú lân phối hợp nhịp nhàng, tượng trưng cho song hỷ lâm môn, may mắn và phát tài.',
    },
    {
      id: 'tam_lan',
      name: 'Tam Lân (Ba Lân)',
      price: '3.000.000 VNĐ',
      duration: '7 - 8 phút',
      props: '3 đầu lân, ông Địa',
      bestFor: ['lễ hội', 'sự kiện cộng đồng', 'chương trình cần đội hình đẹp'],
      summary: 'Tiết mục tượng trưng cho Thiên - Địa - Nhân, tạo cảm giác rộn ràng và thịnh vượng.',
    },
    {
      id: 'tu_lan',
      name: 'Tứ Lân (Bốn Lân)',
      price: '3.500.000 VNĐ',
      duration: '7 - 8 phút',
      props: '4 đầu lân, ông Địa',
      bestFor: ['khai trương lớn', 'sự kiện sân khấu', 'chương trình cần đội hình hoành tráng'],
      summary: 'Bốn chú lân đồng bộ, tượng trưng cho bốn phương tụ hội, bốn phương phát tài.',
    },
    {
      id: 'ngu_lan',
      name: 'Ngũ Lân (Năm Lân)',
      price: '4.000.000 VNĐ',
      duration: '7 - 8 phút',
      props: '5 đầu lân, ông Địa',
      bestFor: ['sự kiện lớn', 'lễ hội đông người', 'khai trương cần màn mở màn nổi bật'],
      summary: 'Tiết mục đại diện cho ngũ phúc: Phú - Quý - Thọ - Khang - Ninh.',
    },
    {
      id: 'dia_buu',
      name: 'Múa Lân Địa Bửu',
      duration: '7 - 8 phút',
      props: 'Đầu lân, ông Địa, bục biểu diễn, ghế và đạo cụ địa bửu',
      bestFor: ['khai trương', 'khánh thành', 'sự kiện chú trọng yếu tố tài lộc'],
      summary: 'Tiết mục mang nét truyền thống và ý nghĩa phong thủy, chú lân tìm kiếm và khai mở địa bửu tượng trưng cho tài lộc.',
    },
    {
      id: 'rong',
      name: 'Múa Rồng Nghệ Thuật',
      duration: '7 - 8 phút',
      props: 'Rồng dài',
      bestFor: ['sự kiện sân khấu', 'chương trình nghệ thuật', 'lễ hội quy mô lớn'],
      summary: 'Biểu diễn tập thể với hình ảnh rồng uốn lượn mạnh mẽ, thể hiện sức mạnh, thịnh vượng và tinh thần đoàn kết.',
    },
    {
      id: 'su_tu',
      name: 'Múa Sư Tử Truyền Thống (kết hợp múa lửa)',
      duration: '7 - 8 phút',
      props: 'Đầu sư tử, dụng cụ múa lửa',
      bestFor: ['lễ hội', 'sự kiện nghệ thuật', 'khách thích tiết mục mạnh mẽ'],
      summary: 'Tiết mục đậm chất võ thuật, kết hợp múa lửa để tạo hiệu ứng thị giác ấn tượng.',
    },
  ],
  leadCollectionChecklist: [
    'Ngày tổ chức',
    'Địa điểm tổ chức',
    'Loại tiết mục mong muốn',
    'Khung giờ biểu diễn',
    'Quy mô sự kiện',
    'Tên người liên hệ và số điện thoại',
  ],
  priceList: [
    { service: '2 lân', price: '2.500.000 VNĐ' },
    { service: '3 lân', price: '3.000.000 VNĐ' },
    { service: '4 lân', price: '3.500.000 VNĐ' },
    { service: '5 lân', price: '4.000.000 VNĐ' },
  ],
};

module.exports = customerSupportData;
