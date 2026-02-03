import { useState, useEffect } from "react";
import { storage, auth } from "./firebase";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { DragonIcon, LionIcon, PeachBlossomIcon, LanternIcon, FestivalStrip } from "./components/Decorations";
import "./MediaUploadPage.css";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;

function getTypeFromName(name) {
    if (IMAGE_EXT.test(name)) return "image";
    if (VIDEO_EXT.test(name)) return "video";
    return "image";
}

async function loadAllMedia() {
    const mediaRef = ref(storage, "media");
    const { prefixes } = await listAll(mediaRef);
    const list = [];

    for (const folderRef of prefixes) {
        const { items } = await listAll(folderRef);
        for (const itemRef of items) {
            const url = await getDownloadURL(itemRef);
            const type = getTypeFromName(itemRef.name);
            list.push({ url, type });
        }
    }

    return list;
}

export default function MediaUploadPage() {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);

    // Kiểm tra đăng nhập (không redirect, chỉ lưu user)
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    // Load gallery từ Storage cho mọi người xem
    useEffect(() => {
        setLoadingGallery(true);
        loadAllMedia()
            .then(setMediaFiles)
            .catch((err) => {
                console.error(err);
                setMediaFiles([]);
            })
            .finally(() => setLoadingGallery(false));
    }, []);

    const handleUpload = async (e) => {
        if (!user) return;

        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);

        try {
            for (const file of files) {
                const storageRef = ref(
                    storage,
                    `media/${user.uid}/${Date.now()}-${file.name}`
                );

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                const type = file.type.startsWith("image") ? "image" : "video";

                setMediaFiles((prev) => [...prev, { url, type }]);
            }
        } catch (err) {
            console.error(err);
            alert("Upload lỗi ❌");
        }

        setUploading(false);
        e.target.value = "";
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
            <Header />
        <div className="media-upload-section">
            <div className="container">
                <FestivalStrip iconSize={22} />
          <h2 className="mb-4 d-flex align-items-center gap-2 flex-wrap" style={{ color: "#eab308", textShadow: "0 0 16px rgba(212,160,18,0.4)" }}>
            <PeachBlossomIcon size={26} color="#e879a0" />
            <PeachBlossomIcon size={22} color="#e879a0" />
            <LanternIcon size={28} color="#eab308" />
            <DragonIcon size={30} color="#eab308" />
            <DragonIcon size={26} color="#eab308" />
            🎬 Khu vực Media
            <DragonIcon size={26} color="#eab308" />
            <DragonIcon size={30} color="#eab308" />
            <LanternIcon size={28} color="#eab308" />
            <PeachBlossomIcon size={22} color="#e879a0" />
            <PeachBlossomIcon size={26} color="#e879a0" />
            <LionIcon size={28} color="#eab308" />
          </h2>

                {user ? (
                    <div className="upload-card upload-content mb-4">
                        <p style={{ color: "#fafafa" }}>Xin chào: {user.email}</p>
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="form-control"
                            style={{ maxWidth: 320 }}
                        />
                        {uploading && <p className="mt-2" style={{ color: "#eab308" }}>Đang tải lên...</p>}
                    </div>
                ) : (
                    <p style={{ color: "#a3a3a3" }}>Đăng nhập để upload ảnh/video. Bạn có thể xem media bên dưới.</p>
                )}

                <h3 className="mt-4 mb-3" style={{ color: "#eab308", textShadow: "0 0 12px rgba(212,160,18,0.35)" }}>Media thành viên đã đăng</h3>
                {loadingGallery ? (
                    <p style={{ color: "#a3a3a3" }}>Đang tải...</p>
                ) : mediaFiles.length === 0 ? (
                    <p style={{ color: "#a3a3a3" }}>Chưa có media nào.</p>
                ) : (
                    <div className="d-flex flex-wrap gap-3 mt-3">
                        {mediaFiles.map((item, i) => (
                            <div key={i} className="media-item-card rounded overflow-hidden" style={{ width: 200 }}>
                                {item.type === "image" ? (
                                    <img src={item.url} alt="" className="media-display" style={{ width: 200, height: 200 }} />
                                ) : (
                                    <video src={item.url} width={200} height={200} controls className="media-display" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
            <Footer />
        </div>
    );
}
