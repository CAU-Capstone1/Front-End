import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { getCurrentUser, logout } from "../utils/auth";

export default function GlobalHeader() {
    const [user, setUser] = useState(getCurrentUser());
    const location = useLocation();
    const navigate = useNavigate();

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

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            navigate("/");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    const isStartPage = location.pathname === "/" || location.pathname === "";
    const showLogoutButton = isStartPage;
    const showLoginButtons = !user && isStartPage;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
            {showLoginButtons ? (
                // 시작 페이지에서 로그인하지 않은 경우: 양쪽 끝에 로그인/회원가입 버튼
                <>
                    <button
                        onClick={() => navigate("/login")}
                        className="rainbow-text-hover-parent rounded-full border-2 border-black/10 bg-white/90 px-7 py-3 text-sm font-semibold shadow-[0_6px_0_rgba(46,31,39,0.08)] hover:bg-white hover:shadow-[0_4px_0_rgba(46,31,39,0.06)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer"
                    >
                        <span className="text-[var(--text-primary)] rainbow-text-hover">로그인</span>
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="rainbow-text-hover-parent rounded-full border-2 border-black/10 bg-white/90 px-7 py-3 text-sm font-semibold shadow-[0_6px_0_rgba(46,31,39,0.08)] hover:bg-white hover:shadow-[0_4px_0_rgba(46,31,39,0.06)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer ml-auto"
                    >
                        <span className="text-[var(--text-primary)] rainbow-text-hover">회원가입</span>
                    </button>
                </>
            ) : (
                // 로그인된 경우 또는 다른 페이지: 왼쪽에 로그아웃 버튼, 오른쪽에 사용자 이름
                <>
                    {user && showLogoutButton && (
                        <button
                            onClick={handleLogout}
                            className="rainbow-text-hover-parent rounded-full border-2 border-black/10 bg-white/90 px-7 py-3 text-sm font-semibold shadow-[0_6px_0_rgba(46,31,39,0.08)] hover:bg-white hover:shadow-[0_4px_0_rgba(46,31,39,0.06)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer"
                        >
                            <span className="text-[var(--text-primary)] rainbow-text-hover">로그아웃</span>
                        </button>
                    )}
                    {user && location.pathname !== "/myPage" && (
                        <button
                            onClick={() => navigate("/myPage")}
                            className="rainbow-text-hover-parent rounded-full border-2 border-black/10 bg-white/90 px-7 py-3 text-sm font-semibold shadow-[0_6px_0_rgba(46,31,39,0.08)] hover:bg-white hover:shadow-[0_4px_0_rgba(46,31,39,0.06)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer ml-auto"
                        >
                            <span className="text-[var(--text-primary)] rainbow-text-hover">{user.name}</span>
                        </button>
                    )}
                </>
            )}
        </header>
    );
}

