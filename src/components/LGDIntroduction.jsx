import { useState, useEffect } from "react";
import { auth, storage, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { ADMIN_EMAILS } from "../config";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from "./Decorations";

const INTRO_IMAGE_KEY = "lgdIntroImage";
const DEFAULT_IMAGE = "/lan-su-rong.jpg";

export default function LucGiaDuongIntroSection() {
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "intro"), (snapshot) => {
      if (snapshot.exists()) {
        setImageUrl(snapshot.data().imageUrl || DEFAULT_IMAGE);
      }
    });
    return () => unsub();
  }, []);


  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleImageUpload = async (e) => {
    if (!user || !isAdmin) return;
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh.");
      return;
    }
    setUploading(true);
    try {
      const storageRef = ref(
        storage,
        `intro/${user.uid}/${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImageUrl(url);
      await setDoc(doc(db, "config", "intro"), { imageUrl: url }, { merge: true });

    } catch (err) {
      console.error(err);
      alert("Upload ảnh lỗi ❌");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <section
      className="w-full py-12 px-4 md:px-10 lg:px-20"
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%)",
        color: "#faf8f5",
      }}
    >
      <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
        {/* Image Side */}
        <div className="w-full h-full">
          <div className="overflow-hidden rounded-2xl shadow-xl" style={{ border: "2px solid rgba(212,160,18,0.45)" }}>
            <img
              src={imageUrl}
              alt="Lân Sư Rồng Lục Gia Đường"
              className="w-full h-full object-cover"
            />
          </div>
          {isAdmin && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1" style={{ color: "#a3a3a3" }}>
                Thay ảnh thông tin đoàn (chỉ admin)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="form-control form-control-sm"
                style={{ backgroundColor: "#1a1510", borderColor: "rgba(212,160,18,0.5)", color: "#faf8f5" }}
              />
              {uploading && (
                <span className="text-sm" style={{ color: "#eab308" }}>Đang tải lên...</span>
              )}
            </div>
          )}
        </div>

        {/* Content Side */}
        <div className="space-y-6">
          <FestivalStrip iconSize={22} />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#eab308", textShadow: "0 0 20px rgba(212,160,18,0.5)", display: "flex", alignItems: "center", gap: "0.35rem 0.75rem", flexWrap: "wrap" }}>
            <PeachBlossomIcon size={30} color="#e879a0" />
            <PeachBlossomIcon size={26} color="#e879a0" />
            <LanternIcon size={32} color="#eab308" />
            <DragonIcon size={36} color="#eab308" />
            <DragonIcon size={32} color="#eab308" />
            ĐOÀN LÂN SƯ RỒNG LỤC GIA ĐƯỜNG
            <DragonIcon size={32} color="#eab308" />
            <DragonIcon size={36} color="#eab308" />
            <LanternIcon size={32} color="#eab308" />
            <PeachBlossomIcon size={26} color="#e879a0" />
            <PeachBlossomIcon size={30} color="#e879a0" />
            <LionIcon size={34} color="#eab308" />
          </h2>

          <p className="text-base leading-relaxed" style={{ color: "#e5e5e5" }}>
            Được thành lập vào năm <strong>2023</strong>, Đoàn Lân Sư Rồng{" "}
            <strong>Lục Gia Đường</strong> hoạt động với mục tiêu gìn giữ và
            phát huy nghệ thuật truyền thống Lân – Sư – Rồng của dân tộc Việt
            Nam. Đoàn xây dựng định hướng phát triển chuyên nghiệp, kỷ luật và
            đề cao tinh thần võ đạo, lấy chất lượng biểu diễn và uy tín làm nền
            tảng lâu dài.
          </p>

          <p className="text-base leading-relaxed" style={{ color: "#e5e5e5" }}>
            Hoạt động chủ yếu tại <strong>Hạ Long, Quảng Ninh</strong>, đoàn
            tham gia biểu diễn trong các dịp lễ hội, khai trương, sự kiện, trung
            thu và chương trình văn hóa nghệ thuật. Dưới sự dẫn dắt của{" "}
            <strong>Trưởng đoàn Phạm Hải Nam</strong>, các thành viên không ngừng
            rèn luyện thể lực, kỹ thuật và tinh thần đồng đội.
          </p>

          <div
            className="rounded-2xl shadow-md p-5 space-y-2"
            style={{ backgroundColor: "#1a1510", border: "2px solid rgba(212,160,18,0.4)" }}
          >
            <h3 className="font-semibold text-lg d-flex align-items-center gap-2" style={{ color: "#eab308", textShadow: "0 0 12px rgba(212,160,18,0.4)" }}>
              <PeachBlossomIcon size={22} color="#e879a0" />
              <PeachBlossomIcon size={18} color="#e879a0" />
              <LanternIcon size={22} color="#eab308" />
              Thành tích nổi bật
            </h3>
            <ul className="list-disc list-inside space-y-1" style={{ color: "#e5e5e5" }}>
              <li>Vô địch Giải Địa Bửu – Hội Đền Gin lần thứ I</li>
              <li>Hạng 3 Giải Song Lân – Đền Gin lần thứ I</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
