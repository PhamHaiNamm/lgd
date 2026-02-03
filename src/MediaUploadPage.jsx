import { useState, useEffect } from "react";
import { storage, auth } from "./firebase";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import Footer from "./components/Footer";
import {
    DragonIcon,
    LionIcon,
    PeachBlossomIcon,
    LanternIcon,
    FestivalStrip,
} from "./components/Decorations";
import "./MediaUploadPage.css";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)$/i;

function getTypeFromName(name) {
    if (IMAGE_EXT.test(name)) return "image";
    if (VIDEO_EXT.test(name)) return "video";
    return "image";
}

// 🔥 LOAD TOÀN BỘ MEDIA TỪ STORAGE
async function loadAllMedia() {
    const mediaRef = ref(storage, "media");
    const list = [];

    try {
        const { prefixes, items } = await listAll(mediaRef);

        // File nằm trực tiếp trong /media
        for (const itemRef of items) {
            const url = await getDownloadURL(itemRef);
            list.push({ url, type: getTypeFromName(itemRef.name) });
        }

        // File nằm trong từng thư mục userId
        for (const folderRef of prefixes) {
            const { items: userItems } = await listAll(folderRef);
            for (const itemRef of userItems) {
                const url = await getDownloadURL(itemRef);
                list.push({ url, type: getTypeFromName(itemRef.name) });
            }
        }
    } catch (err) {
        console.error("Load media error:", err);
    }

    return list;
}

export default function MediaUploadPage() {
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);

    // Theo dõi đăng nhập
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    // Load gallery
    useEffect(() => {
        loadAllMedia().then((data) => {
            setMediaFiles(data);
            setLoadingGallery(false);
        });
    }, []);

    // 🔥 UPLOAD FILE
    const handleUpload = async (e) => {
        if (!user) return alert("Bạn cần đăng nhập");

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

                setMediaFiles((prev) => [
                    ...prev,
                    { url, type: file.type.startsWith("image") ? "image" : "video" },
                ]);
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

                    <h2 className="mb-4" style={{ color: "#eab308" }}>
                        🎬 Khu vực Media
                    </h2>

                    {user ? (
                        <div className="upload-card mb-4">
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
                            {uploading && <p style={{ color: "#eab308" }}>Đang tải lên...</p>}
                        </div>
                    ) : (
                        <p style={{ color: "#a3a3a3" }}>
                            Đăng nhập để upload. Bạn vẫn xem được media bên dưới.
                        </p>
                    )}

                    <h3 style={{ color: "#eab308" }}>Media thành viên</h3>

                    {loadingGallery ? (
                        <p style={{ color: "#a3a3a3" }}>Đang tải...</p>
                    ) : mediaFiles.length === 0 ? (
                        <p style={{ color: "#a3a3a3" }}>Chưa có media.</p>
                    ) : (
                        <div className="d-flex flex-wrap gap-3 mt-3">
                            {mediaFiles.map((item, i) => (
                                <div key={i} style={{ width: 200 }}>
                                    {item.type === "image" ? (
                                        <img src={item.url} width={200} height={200} alt="" />
                                    ) : (
                                        <video src={item.url} width={200} height={200} controls />
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