import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { getCurrentUser } from "../utils/auth";

export default function GlobalHeader() {
    const [user, setUser] = useState(getCurrentUser());
    const location = useLocation();

    // 페이지 이동 시마다 로그인 상태 확인
    useEffect(() => {
        setUser(getCurrentUser());
    }, [location.pathname]);

    // storage 이벤트 감지 (다른 탭에서 로그인/로그아웃 시)
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(getCurrentUser());
        };

        window.addEventListener("storage", handleStorageChange);
        
        // 주기적으로 확인 (같은 탭에서 로그인/로그아웃 시)
        const interval = setInterval(() => {
            const currentUser = getCurrentUser();
            if (currentUser?.id !== user?.id) {
                setUser(currentUser);
            }
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, [user?.id]);

    if (!user) {
        return null; // 로그인하지 않은 경우 아무것도 표시하지 않음
    }

    return (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg bg-white/90 backdrop-blur-sm border-2 border-[var(--accent-amber)]/30 shadow-[0_8px_0_rgba(46,31,39,0.08)]">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
                {user.name}
            </p>
        </div>
    );
}

