import { Outlet, useLocation } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import CursorSparkles from "../components/CursorSparkles";

export default function AppLayout() {
    const location = useLocation();
    // review 페이지(음악 생성 화면)에서는 애니메이션 비활성화
    const isReviewPage = location.pathname === "/review";

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

