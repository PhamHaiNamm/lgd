import Carousel from "react-bootstrap/Carousel";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon } from "./Decorations";

function Banner() {
  const captionStyle = { background: 'linear-gradient(transparent, rgba(0,0,0,0.92))', padding: '1.5rem', borderRadius: '0 0 8px 8px', borderTop: '2px solid rgba(212,160,18,0.5)', borderBottom: '1px solid rgba(232,121,160,0.3)' };
  const titleStyle = { color: '#eab308', textShadow: '0 0 12px rgba(212,160,18,0.6), 0 2px 4px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem 0.75rem', flexWrap: 'wrap' };
  return (
    <Carousel fade interval={3500} className="shadow-sm rounded overflow-hidden">
      {/* Slide 1 */}
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://bizweb.dktcdn.net/thumb/large/100/412/528/themes/799520/assets/slider_1.jpg?1647921135706"
          alt="Slide 1"
          style={{ height: "450px", objectFit: "cover" }}
        />
        <Carousel.Caption style={captionStyle}>
          <h3 className="fw-bold" style={titleStyle}>
            <PeachBlossomIcon size={26} color="#e879a0" />
            <PeachBlossomIcon size={22} color="#e879a0" />
            <LanternIcon size={28} color="#eab308" />
            <DragonIcon size={32} color="#eab308" />
            <DragonIcon size={28} color="#eab308" />
            Lân Sư Rồng Chuyên Nghiệp
            <DragonIcon size={28} color="#eab308" />
            <DragonIcon size={32} color="#eab308" />
            <LanternIcon size={28} color="#eab308" />
            <PeachBlossomIcon size={22} color="#e879a0" />
            <PeachBlossomIcon size={26} color="#e879a0" />
            <LionIcon size={30} color="#eab308" />
          </h3>
          <p style={{ color: '#faf8f5', textShadow: '0 1px 2px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <PeachBlossomIcon size={18} color="#e879a0" />
            Dịch vụ biểu diễn – phụ kiện – trang phục
            <LanternIcon size={20} color="#eab308" />
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      {/* Slide 2 */}
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://bizweb.dktcdn.net/thumb/large/100/412/528/themes/799520/assets/slider_2.jpg?1647921135706"
          alt="Slide 2"
          style={{ height: "450px", objectFit: "cover" }}
        />
        <Carousel.Caption style={captionStyle}>
          <h3 className="fw-bold" style={titleStyle}>
            <PeachBlossomIcon size={24} color="#e879a0" />
            <LanternIcon size={28} color="#eab308" />
            <DragonIcon size={32} color="#eab308" />
            <DragonIcon size={28} color="#eab308" />
            Dịch Vụ Biểu Diễn
            <DragonIcon size={28} color="#eab308" />
            <DragonIcon size={32} color="#eab308" />
            <LanternIcon size={28} color="#eab308" />
            <PeachBlossomIcon size={24} color="#e879a0" />
          </h3>
          <p style={{ color: '#faf8f5', textShadow: '0 1px 2px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <PeachBlossomIcon size={18} color="#e879a0" />
            Giá rẻ – uy tín – book show toàn quốc
            <LanternIcon size={20} color="#eab308" />
          </p>
        </Carousel.Caption>
      </Carousel.Item>

      {/* Slide 3 */}
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://bizweb.dktcdn.net/thumb/large/100/412/528/themes/799520/assets/slider_3.jpg?1647921135706"
          alt="Slide 3"
          style={{ height: "450px", objectFit: "cover" }}
        />
        <Carousel.Caption style={captionStyle}>
          <h3 className="fw-bold" style={titleStyle}>
            <PeachBlossomIcon size={26} color="#e879a0" />
            <PeachBlossomIcon size={22} color="#e879a0" />
            <LanternIcon size={28} color="#eab308" />
            <DragonIcon size={30} color="#eab308" />
            Phụ Kiện Lân Sư Rồng
            <DragonIcon size={30} color="#eab308" />
            <LanternIcon size={28} color="#eab308" />
            <PeachBlossomIcon size={22} color="#e879a0" />
            <PeachBlossomIcon size={26} color="#e879a0" />
          </h3>
          <p style={{ color: '#faf8f5', textShadow: '0 1px 2px #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <LanternIcon size={20} color="#eab308" />
            Full sản phẩm – giá tốt – chất lượng cao
            <PeachBlossomIcon size={18} color="#e879a0" />
          </p>
        </Carousel.Caption>
      </Carousel.Item>

    </Carousel>
  );
}

export default Banner;
