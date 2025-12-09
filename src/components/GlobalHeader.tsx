import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { getCurrentUser, logout } from "../utils/auth";
import Button from "./button";

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
                    <Button toWhere="/login" variant="outline" className="px-6 py-2 text-sm">
                        로그인
                    </Button>
                    <Button toWhere="/signup" variant="outline" className="px-6 py-2 text-sm">
                        회원가입
                    </Button>
                </>
            ) : (
                // 로그인된 경우 또는 다른 페이지: 오른쪽에 사용자 이름 (조건부로 로그아웃 버튼)
                <div className="flex items-center gap-4 ml-auto">
                    {user && location.pathname !== "/myPage" && (
                        <button
                            onClick={() => navigate("/myPage")}
                            className="rounded-full border-2 border-black/10 bg-white/90 px-5 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_6px_0_rgba(46,31,39,0.08)] hover:bg-white hover:shadow-[0_4px_0_rgba(46,31,39,0.06)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer"
                        >
                            {user.name}
                        </button>
                    )}
                    {user && showLogoutButton && (
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="px-4 py-2 text-sm"
                        >
                            로그아웃
                        </Button>
                    )}
                </div>
            )}
        </header>
    );
}

