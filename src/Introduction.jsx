import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import { DecorativeTitle, FestivalStrip } from './components/Decorations';

const MEMBERS = [
  'Hồ Ngọc Thảo',
  'Phạm Hải Nam',
  'Hạ Gia Minh',
  'Lê Minh Hiếu',
  'Lê Anh Tuấn',
  'Nguyễn Đức Huy',
  'Nguyễn Bảo Long',
  'Hồ Nam',
  'Nguyễn Thị Tâm',
  'Nguyễn Danh Đức',
  'Bảo Nguyên',
  'Ngô Trung Hiếu (Lò Voi)',
  'Đụ Giang Sơn',
  'Tiến Mạnh',
  'Xuân Hiếu',
  'Ngô Quân',
  'Trần Dũng',
  'Trần Duy Mạnh',
  'Trần Gia Hưng',
  'Đào Quốc Trưởng',
  'Phạm Gia Huy',
  'Nguyễn Huy',
  'Nguyễn Tiến Dũng',
  'Phạm Tài',
  
];

function Introduction() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />
      <Banner />

      {/* Giới thiệu chung về đoàn */}
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px rgba(139,92,246,0.4)' }}>
          <DecorativeTitle showIcons={true}>Giới thiệu về đoàn</DecorativeTitle>
        </h2>
        <div
          className="rounded overflow-hidden d-flex flex-column flex-md-row mx-auto"
          style={{
            maxWidth: '960px',
            background: 'linear-gradient(180deg, #1a1510 0%, #141414 100%)',
            border: '2px solid rgba(139,92,246,0.4)',
            color: '#faf8f5',
          }}
        >
          <div className="flex-shrink-0" style={{ width: '100%', maxWidth: '360px' }}>
            <img
              src="/images/giới_thiệu_đoàn.jpg"
              alt="Giới thiệu đoàn Lục Gia Đường"
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '280px' }}
            />
          </div>
          <div className="p-4 p-md-5 flex-grow-1" style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            <p className="mb-3">
              <strong style={{ color: '#a78bfa' }}>Tiền thân của Lục Gia Đường</strong> là đội Kì Lân Khu 6, được hình thành từ những người đam mê nghệ thuật Lân – Sư – Rồng tại địa phương.
              Từ một đội biểu diễn mang tính cộng đồng, qua thời gian tập luyện và phát triển, đội đã mở rộng quy mô và chính thức phát triển thành
              <strong style={{ color: '#a78bfa' }}> đoàn Lân – Sư – Rồng Lục Gia Đường</strong> như ngày nay.
            </p>

            <p className="mb-3">
              Đoàn có đại bản doanh tại <strong>Khu Trới 6, phường Hoành Bồ, tỉnh Quảng Ninh</strong>, là nơi các thành viên cùng nhau tập luyện, gìn giữ
              và phát huy nghệ thuật biểu diễn truyền thống.
            </p>

            <p className="mb-0">
              <strong style={{ color: '#a78bfa' }}>Lục Gia Đường</strong> hiện là một đoàn Lân – Sư – Rồng chuyên nghiệp, chuyên biểu diễn phục vụ
              lễ hội, khai trương, khánh thành và nhiều sự kiện khác. Chúng tôi mang đến các tiết mục
              <strong> Múa Lân, Múa Sư Tử, Múa Rồng</strong> đa dạng từ truyền thống đến hiện đại, cùng trang phục và phụ kiện chất lượng,
              phù hợp với nhiều quy mô sự kiện trong và ngoài địa bàn.
            </p>
          </div>
        </div>
      </section>

      {/* Thành tích nổi bật */}
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px rgba(139,92,246,0.4)' }}>
          <DecorativeTitle showIcons={true}>Thành tích nổi bật</DecorativeTitle>
        </h2>
        <div
          className="rounded p-4 p-md-5"
          style={{
            background: 'linear-gradient(180deg, #1a1510 0%, #141414 100%)',
            border: '2px solid rgba(139,92,246,0.4)',
            borderLeft: '4px solid #8b5cf6',
            color: '#faf8f5',
          }}
        >
          <ul className="mb-0 ps-3 ps-md-4" style={{ listStyle: 'none', fontSize: '1.05rem', lineHeight: 2 }}>
            <li className="mb-2">• Xuất sắc đạt Giải Nhất nội dung Địa Bửu tại Giải giao lưu Đền Gin (Nam Định) lần thứ nhất</li>
            <li className="mb-2">• Đạt Giải Ba nội dung Song Lân tại Giải giao lưu Đền Gin (Nam Định) lần thứ nhất</li>
            <li className="mb-2">• Vinh dự hợp tác và biểu diễn cùng nghệ sĩ Đen Vâu</li>
            <li className="mb-2">• Đội ngũ giàu kinh nghiệm, biểu diễn bài bản và phong cách chuyên nghiệp</li>
            <li className="mb-2">• Thường xuyên biểu diễn phục vụ nhiều lễ hội, khai trương và các sự kiện lớn nhỏ</li>
          </ul>
        </div>
      </section>

      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold lgd-title-gold" style={{ color: '#a78bfa', textShadow: '0 0 16px rgba(139,92,246,0.4)' }}>
          <DecorativeTitle showIcons={true}>Thành viên Lục Gia Đường</DecorativeTitle>
        </h2>
        <div
          className="rounded p-4 p-md-5"
          style={{
            background: 'linear-gradient(180deg, #1a1510 0%, #141414 100%)',
            border: '2px solid rgba(139,92,246,0.4)',
            color: '#faf8f5',
          }}
        >
          <div className="row g-2 g-md-3">
            {MEMBERS.map((name, index) => (
              <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <div
                  className="rounded text-center py-2 px-2"
                  style={{
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    color: '#faf8f5',
                    fontSize: '0.95rem',
                  }}
                >
                  {name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Introduction;
