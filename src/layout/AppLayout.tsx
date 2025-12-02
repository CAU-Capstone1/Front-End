import { Outlet } from "react-router";
import GlobalHeader from "../components/GlobalHeader";

export default function AppLayout() {
    return (
        <>
            <GlobalHeader />
            <Outlet />
        </>
    );
}

