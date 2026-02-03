import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                alert("Bạn phải đăng nhập trước");
                window.location.href = "/login";
            } else {
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);

    if (loading) return <p>Đang kiểm tra đăng nhập...</p>;
    return children;
}