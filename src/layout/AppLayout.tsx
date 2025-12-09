import { Outlet, useLocation } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import CursorSparkles from "../components/CursorSparkles";

export default function AppLayout() {
    const location = useLocation();

    return (
        <>
            <GlobalHeader />
            <div className="page-transition-wrapper">
                <div 
                    key={location.pathname} 
                    className="page-content fade-in-up"
                >
                    <Outlet />
                </div>
            </div>
            <CursorSparkles />
        </>
    );
}

