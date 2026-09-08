import { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";

const DEFAULT_IMAGE = "/lan-su-rong.jpg";

export default function LucGiaDuongIntroSection() {
  const { isAdmin } = useContext(AuthContext) || {};
  const [imageUrl] = useState(DEFAULT_IMAGE);
  const [uploading] = useState(false);

  const handleImageUpload = () => {
    alert("Tính năng đang được bảo trì.");
  };

  return (
    <section className="w-full py-12 px-4 md:px-10 lg:px-20" style={{ background: "linear-gradient(180deg,var(--lgd-black) 0%,var(--lgd-black-soft) 50%,var(--lgd-black) 100%)", color: "var(--lgd-text)" }}>
      <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">

        <div>
          <div className="overflow-hidden rounded-2xl shadow-xl" style={{ border: "2px solid rgba(139,92,246,0.45)" }}>
            <img src={imageUrl} alt="Lân Sư Rồng" className="w-full h-full object-cover" />
          </div>

          {isAdmin && (
            <div className="mt-3">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span style={{ color: "#a78bfa" }}>Đang tải lên...</span>}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ color: "#a78bfa" }}>ĐOÀN LÂN SƯ RỒNG LỤC GIA ĐƯỜNG</h2>
          <p>Được thành lập năm 2023 tại Hạ Long, Quảng Ninh.</p>
        </div>

      </div>
    </section>
  );
}