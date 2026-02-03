import { useState, useEffect } from "react";
import { auth, storage, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

import { ADMIN_EMAILS } from "../config";

const DEFAULT_IMAGE = "/lan-su-rong.jpg";

export default function LucGiaDuongIntroSection() {
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [uploading, setUploading] = useState(false);

  // 🔹 Theo dõi đăng nhập + tự tạo hồ sơ user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("AUTH USER:", u);
      setUser(u);

      if (!u) return;

      try {
        await setDoc(
          doc(db, "members", u.uid),
          {
            uid: u.uid,
            email: u.email,
            name: u.displayName || "",
            photo: u.photoURL || "",
            role: "member",
            lastLogin: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log("✅ USER SYNC FIRESTORE OK");
      } catch (err) {
        console.error("❌ USER SYNC ERROR:", err);
      }
    });

    return () => unsub();
  }, []);

  // 🔹 Lắng nghe ảnh từ Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "config", "intro"),
      (snapshot) => {
        console.log("FIRESTORE SNAPSHOT:", snapshot.exists(), snapshot.data());
        if (snapshot.exists()) {
          setImageUrl(snapshot.data().imageUrl || DEFAULT_IMAGE);
        }
      },
      (err) => {
        console.error("LISTEN FIRESTORE ERROR:", err);
      }
    );
    return () => unsub();
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleImageUpload = async (e) => {
    if (!user) return alert("Chưa đăng nhập");
    if (!isAdmin) return alert("Bạn không phải admin");

    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Vui lòng chọn file ảnh.");
    }

    setUploading(true);
    try {
      console.log("BẮT ĐẦU UPLOAD STORAGE...");

      const storageRef = ref(storage, `intro/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      console.log("UPLOAD STORAGE OK:", url);

      await setDoc(
        doc(db, "config", "intro"),
        {
          imageUrl: url,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        },
        { merge: true }
      );

      console.log("GHI FIRESTORE THÀNH CÔNG");
      setImageUrl(url);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Lỗi: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <section className="w-full py-12 px-4 md:px-10 lg:px-20" style={{ background: "linear-gradient(180deg,#0a0a0a 0%,#141414 50%,#0a0a0a 100%)", color: "#faf8f5" }}>
      <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">

        <div>
          <div className="overflow-hidden rounded-2xl shadow-xl" style={{ border: "2px solid rgba(212,160,18,0.45)" }}>
            <img src={imageUrl} alt="Lân Sư Rồng" className="w-full h-full object-cover" />
          </div>

          {isAdmin && (
            <div className="mt-3">
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span style={{ color: "#eab308" }}>Đang tải lên...</span>}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ color: "#eab308" }}>ĐOÀN LÂN SƯ RỒNG LỤC GIA ĐƯỜNG</h2>
          <p>Được thành lập năm 2023 tại Hạ Long, Quảng Ninh.</p>
        </div>

      </div>
    </section>
  );
}