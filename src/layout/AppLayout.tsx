import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import GlobalHeader from "../components/GlobalHeader";
import CursorSparkles from "../components/CursorSparkles";
import { isLoggedIn, refreshCurrentUser } from "../utils/auth";
export default function AppLayout() {
    const location = useLocation();
    const isReviewPage = location.pathname === "/review";
    useEffect(() => {
        const validateToken = async () => {
            if (isLoggedIn()) {
                try {
                    await refreshCurrentUser();
                } catch (error) {
                    console.warn("토큰 유효성 검사 실패, 자동 로그아웃 처리");
                }
            }
        };
        validateToken();
    }, []);
    return (
        <>
            <GlobalHeader />
            <div className="page-transition-wrapper">
                <div 
                    key={location.pathname} 
                    className={`page-content ${isReviewPage ? "" : "fade-in-up"}`}
                >
                    <Outlet />
                </div>
            </div>
            <CursorSparkles />
        </>
    );
}
