import Carousel from "react-bootstrap/Carousel";

function Banner() {
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
        {/* Nếu không muốn caption thì xóa phần này */}
        <Carousel.Caption>
          <h3 className="fw-bold">Lân Sư Rồng Chuyên Nghiệp</h3>
          <p>Dịch vụ biểu diễn – phụ kiện – trang phục</p>
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
        <Carousel.Caption>
          <h3 className="fw-bold">Dịch Vụ Biểu Diễn</h3>
          <p>Giá rẻ – uy tín – book show toàn quốc</p>
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
        <Carousel.Caption>
          <h3 className="fw-bold">Phụ Kiện Lân Sư Rồng</h3>
          <p>Full sản phẩm – giá tốt – chất lượng cao</p>
        </Carousel.Caption>
      </Carousel.Item>

    </Carousel>
  );
}

export default Banner;
