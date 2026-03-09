import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import { DecorativeTitle, FestivalStrip } from './components/Decorations';

const MEMBER_AVATAR_DIR = '/images/thành_viên';
const DEFAULT_AVATAR = '/images/Logo_full.png';
const AVATAR_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

const MEMBERS = [
  { id: 'ho-ngoc-thao', name: 'Hồ Ngọc Thảo', role: 'Đang cập nhật', birthYear: '2009', avatarUrl: '/images/Logo_full.png' },
  { id: 'pham-hai-nam', name: 'Phạm Hải Nam', role: 'Xách Nước Bổ Cam', birthYear: '2004', avatarUrl: '/images/Logo_full.png' },
  { id: 'ly-manh-hung', name: 'Lý Mạnh Hưng', role: 'Âm Thanh', birthYear: '2005', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-xuan-bach', name: 'Nguyễn Xuân Bách', role: 'Đang cập nhật', birthYear: '2005', avatarUrl: '/images/Logo_full.png' },
  { id: 'ha-gia-minh', name: 'Hạ Gia Minh', role: 'Đang cập nhật', birthYear: '2008', avatarUrl: '/images/Logo_full.png' },
  { id: 'le-minh-hieu', name: 'Lê Minh Hiếu', role: 'Đang cập nhật', birthYear: '2008', avatarUrl: '/images/Logo_full.png' },
  { id: 'le-anh-tuan', name: 'Lê Anh Tuấn', role: 'Đang cập nhật', birthYear: '2009', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-duc-huy', name: 'Nguyễn Đức Huy', role: 'Đang cập nhật', birthYear: '2009', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-bao-long', name: 'Nguyễn Bảo Long', role: 'Đang cập nhật', birthYear: '2008', avatarUrl: '/images/Logo_full.png' },
  { id: 'ho-nam', name: 'Hồ Nam', role: 'Đang cập nhật', birthYear: '2006', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-thi-tam', name: 'Nguyễn Thị Tâm', role: 'Truyền Thông', birthYear: '2008', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-danh-duc', name: 'Nguyễn Danh Đức', role: 'Đang cập nhật', birthYear: '2012', avatarUrl: '/images/Logo_full.png' },
  { id: 'bao-nguyen', name: 'Bảo Nguyên', role: 'Đang cập nhật', birthYear: '2013', avatarUrl: '/images/Logo_full.png' },
  { id: 'ngo-trung-hieu-lo-voi', name: 'Ngô Trung Hiếu (Lò Voi)', role: 'Đuôi Lân', birthYear: '2009', avatarUrl: '/images/Logo_full.png' },
  { id: 'du-giang-son', name: 'Đụ Giang Sơn', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },
  { id: 'tien-manh', name: 'Tiến Mạnh', role: 'Đang cập nhật', birthYear: 'Đang cập nhật', avatarUrl: '/images/Logo_full.png' },
  { id: 'xuan-hieu', name: 'Xuân Hiếu', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },
  { id: 'ngo-quan', name: 'Ngô Quân', role: 'Đang cập nhật', birthYear: '2012', avatarUrl: '/images/Logo_full.png' },
  { id: 'tran-dung', name: 'Trần Dũng', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },
  { id: 'tran-duy-manh', name: 'Trần Duy Mạnh', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },
  { id: 'tran-gia-hung', name: 'Trần Gia Hưng', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },
  { id: 'dao-quoc-truong', name: 'Đào Quốc Trưởng', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },
  { id: 'pham-gia-huy', name: 'Phạm Gia Huy', role: 'Đang cập nhật', birthYear: 'Đang cập nhật', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-huy', name: 'Nguyễn Huy', role: 'Đang cập nhật', birthYear: 'Đang cập nhật', avatarUrl: '/images/Logo_full.png' },
  { id: 'nguyen-tien-dung', name: 'Nguyễn Tiến Dũng', role: 'Đang cập nhật', birthYear: '2009', avatarUrl: '/images/Logo_full.png' },
  { id: 'pham-tai', name: 'Phạm Tài', role: 'Đang cập nhật', birthYear: '2010', avatarUrl: '/images/Logo_full.png' },

];

function Introduction() {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [avatarAttempt, setAvatarAttempt] = useState(0);
  const selectedMember = useMemo(
    () => MEMBERS.find((m) => m.id === selectedMemberId) || null,
    [selectedMemberId]
  );

  const avatarCandidates = useMemo(() => {
    if (!selectedMember) return [];
    const base = `${MEMBER_AVATAR_DIR}/${selectedMember.id}`;
    const candidates = AVATAR_EXTS.map((ext) => `${base}.${ext}`);
    candidates.push(selectedMember.avatarUrl || DEFAULT_AVATAR);
    candidates.push(DEFAULT_AVATAR);
    return candidates;
  }, [selectedMember]);

  useEffect(() => {
    if (!selectedMemberId) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setAvatarAttempt(0);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedMemberId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedMemberId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lgd-black)' }}>
      <Header />
      <Banner />

      {/* Giới thiệu chung về đoàn */}
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Giới thiệu về đoàn</DecorativeTitle>
        </h2>
        <div
          className="rounded overflow-hidden d-flex flex-column flex-md-row mx-auto"
          style={{
            maxWidth: '960px',
            background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black-soft) 100%)',
            border: '2px solid var(--lgd-purple-glow)',
            color: 'var(--lgd-text)',
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
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Thành tích nổi bật</DecorativeTitle>
        </h2>
        <div
          className="rounded p-4 p-md-5"
          style={{
            background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black-soft) 100%)',
            border: '2px solid var(--lgd-purple-glow)',
            borderLeft: '4px solid #8b5cf6',
            color: 'var(--lgd-text)',
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
        <h2 className="text-center mb-4 fw-bold lgd-title-gold" style={{ color: '#a78bfa', textShadow: '0 0 16px var(--lgd-purple-glow)' }}>
          <DecorativeTitle showIcons={true}>Thành viên Lục Gia Đường</DecorativeTitle>
        </h2>
        <div
          className="rounded p-4 p-md-5"
          style={{
            background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black-soft) 100%)',
            border: '2px solid var(--lgd-purple-glow)',
            color: 'var(--lgd-text)',
          }}
        >
          <div className="row g-2 g-md-3">
            {MEMBERS.map((member) => (
              <div key={member.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMemberId((prev) => (prev === member.id ? null : member.id))
                  }
                  aria-pressed={selectedMemberId === member.id}
                  className="w-100 rounded text-center py-2 px-2"
                  style={{
                    background: selectedMemberId === member.id ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.1)',
                    border: selectedMemberId === member.id ? '1px solid rgba(253,224,71,0.9)' : '1px solid rgba(139,92,246,0.35)',
                    color: 'var(--lgd-text)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {member.name}
                </button>
              </div>
            ))}
          </div>

          {selectedMember && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Thông tin thành viên ${selectedMember.name}`}
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setSelectedMemberId(null);
              }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.78)',
                backdropFilter: 'blur(6px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              <div
                className="rounded p-4 p-md-5 w-100"
                style={{
                  maxWidth: 960,
                  background: 'linear-gradient(180deg, var(--lgd-black-card) 0%, var(--lgd-black) 100%)',
                  border: '2px solid rgba(139,92,246,0.55)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                }}
              >
                <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                  <div className="d-flex align-items-center gap-4 gap-md-5 flex-wrap">
                    <img
                      src={avatarCandidates[Math.min(avatarAttempt, Math.max(0, avatarCandidates.length - 1))]}
                      alt={selectedMember.name}
                      width={240}
                      height={240}
                      onError={() => setAvatarAttempt((v) => v + 1)}
                      style={{
                        borderRadius: 26,
                        objectFit: 'cover',
                        border: '2px solid rgba(139,92,246,0.7)',
                        background: 'var(--lgd-black)',
                      }}
                    />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '1.9rem', lineHeight: 1.15, color: '#fde047' }}>
                        {selectedMember.name}
                      </div>
                      <div style={{ color: 'var(--lgd-text)', marginTop: 12, fontSize: '1.2rem' }}>
                        <span style={{ color: '#a78bfa', fontWeight: 800 }}>Vị trí:</span> {selectedMember.role || 'Đang cập nhật'}
                      </div>
                      <div style={{ color: 'var(--lgd-text)', marginTop: 8, fontSize: '1.2rem' }}>
                        <span style={{ color: '#a78bfa', fontWeight: 800 }}>Năm sinh:</span> {selectedMember.birthYear || 'Đang cập nhật'}
                      </div>
                      <div className="mt-3" style={{ color: 'rgba(250,248,245,0.75)', fontSize: '0.95rem' }}>
                        Nhấn <strong>Esc</strong> hoặc bấm ra ngoài để đóng.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMemberId(null)}
                    className="btn btn-outline-light"
                    style={{
                      borderColor: 'rgba(139,92,246,0.75)',
                      padding: '10px 16px',
                      fontWeight: 800,
                    }}
                    aria-label="Đóng"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Introduction;
