import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { DecorativeTitle, FestivalStrip } from './components/Decorations';

const CONTACT = {
  fullName: 'Phạm Hải Nam',
  phone: '0345422378',
  position: 'Trưởng đoàn',
};

function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />
      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#a78bfa', textShadow: '0 0 16px rgba(139,92,246,0.4)' }}>
          <DecorativeTitle showIcons={true}>Liên hệ / Đặt lịch</DecorativeTitle>
        </h2>
        <p className="text-center text-secondary mb-4 mx-auto" style={{ maxWidth: '560px' }}>
          Quý khách vui lòng liên hệ trực tiếp để đặt lịch biểu diễn hoặc tư vấn dịch vụ.
        </p>
        <div
          className="rounded overflow-hidden d-flex flex-column flex-md-row mx-auto align-items-stretch"
          style={{
            maxWidth: '900px',
            background: 'linear-gradient(180deg, #1a1510 0%, #141414 100%)',
            border: '2px solid rgba(139,92,246,0.4)',
            color: '#faf8f5',
            minHeight: '320px',
          }}
        >
          <div className="flex-shrink-0" style={{ width: '100%', maxWidth: '380px' }}>
            <img
              src="/images/giới_thiệu_đoàn.jpg"
              alt="Liên hệ Lục Gia Đường"
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '280px' }}
            />
          </div>
          <div className="p-4 p-md-5 flex-grow-1 d-flex flex-column justify-content-center">
            <div className="mb-4">
              <label className="d-block small text-uppercase mb-1" style={{ color: '#a78bfa' }}>Họ và tên</label>
              <div className="fw-bold" style={{ fontSize: '1.15rem' }}>{CONTACT.fullName}</div>
            </div>
            <div className="mb-4">
              <label className="d-block small text-uppercase mb-1" style={{ color: '#a78bfa' }}>Số điện thoại</label>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-decoration-none fw-bold" style={{ color: '#faf8f5', fontSize: '1.15rem' }}>
                {CONTACT.phone}
              </a>
            </div>
            <div>
              <label className="d-block small text-uppercase mb-1" style={{ color: '#a78bfa' }}>Vị trí</label>
              <div className="fw-bold" style={{ fontSize: '1.15rem' }}>{CONTACT.position}</div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default ContactPage;
