import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { storage, auth, db } from "./firebase";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { FestivalStrip } from "./components/Decorations";
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
    const list = [];

    try {
        const { prefixes, items } = await listAll(mediaRef);

        for (const itemRef of items) {
            const url = await getDownloadURL(itemRef);
            list.push({ url, type: getTypeFromName(itemRef.name) });
        }

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
    const [members, setMembers] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

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

    // 🔥 LOAD MEMBERS FROM FIRESTORE
    useEffect(() => {
        const loadMembers = async () => {
            const snap = await getDocs(collection(db, "members"));
            const arr = snap.docs.map(d => d.data());
            setMembers(arr);
        };
        loadMembers();
    }, []);

    // 🔥 UPLOAD + SAVE MEMBER PROFILE
    const handleUpload = async (e) => {
        if (!user) return alert("Bạn cần đăng nhập");

        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);

        try {
            for (const file of files) {
                const storageRef = ref(storage, `media/${user.uid}/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                // 1 USER = 1 MEMBER DOC
                await setDoc(doc(db, "members", user.uid), {
                    name: user.email,
                    avatar: url,
                    userId: user.uid,
                    createdAt: serverTimestamp()
                }, { merge: true });

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
        <div style={{ minHeight: "100vh", background: "var(--lgd-black)" }}>
            <Header />
            <div className="media-upload-section">
                <div className="container">
                    <FestivalStrip iconSize={22} />

                    <h2 className="mb-4" style={{ color: "#a78bfa" }}>
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
                            {uploading && <p style={{ color: "#a78bfa" }}>Đang tải lên...</p>}
                        </div>
                    ) : (
                        <p style={{ color: "#a3a3a3" }}>
                            Đăng nhập để upload. Khách vẫn xem được bên dưới.
                        </p>
                    )}

                    <h3 style={{ color: "#a78bfa" }}>Media thành viên</h3>

                    {loadingGallery ? (
                        <p style={{ color: "#a3a3a3" }}>Đang tải...</p>
                    ) : (
                        <div className="media-gallery-container mt-3">
                            {mediaFiles.map((item, i) => (
                                <div
                                    key={i}
                                    className="media-gallery-item"
                                    onClick={() => setSelectedMedia(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {item.type === "image" ? (
                                        <img src={item.url} alt="" />
                                    ) : (
                                        <video src={item.url} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Lightbox Modal */}
                    <Modal
                        show={!!selectedMedia}
                        onHide={() => setSelectedMedia(null)}
                        centered
                        size="xl"
                        contentClassName="bg-transparent border-0"
                    >
                        <Modal.Body className="p-0 position-relative">
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow"
                                style={{ zIndex: 1051 }}
                            ></button>
                            {selectedMedia && (
                                <div className="text-center">
                                    {selectedMedia.type === "image" ? (
                                        <img
                                            src={selectedMedia.url}
                                            alt="Full size"
                                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <video
                                            src={selectedMedia.url}
                                            controls
                                            autoPlay
                                            style={{ maxWidth: '100%', maxHeight: '90vh' }}
                                        />
                                    )}
                                </div>
                            )}
                        </Modal.Body>
                    </Modal>

                    <h3 style={{ color: "#a78bfa", marginTop: 40 }}>Thành viên</h3>

                    <div className="d-flex flex-wrap gap-3 mt-3">
                        {members.map((m, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <img src={m.avatar} alt={m.name ? `Avatar ${m.name}` : ""} width={120} height={120} style={{ borderRadius: "50%" }} />
                                <p style={{ color: "#fafafa", marginTop: 8 }}>{m.name}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}