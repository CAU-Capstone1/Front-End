import { Outlet } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import CursorSparkles from "../components/CursorSparkles";

export default function AppLayout() {
    return (
        <>
            <GlobalHeader />
            <Outlet />
            <CursorSparkles />
        </>
    );
}

