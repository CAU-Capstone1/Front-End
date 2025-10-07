import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

const Loading = () => <div>로딩 중.........</div>
const Main = lazy(() => import("../pages/A_mainPage.tsx"))
const What1 = lazy(() => import("../pages/B_whatPage1.tsx"))
const What2 = lazy(() => import("../pages/C_whatPage2.tsx"))
const MusicResult = lazy(() => import("../pages/D_musicResultPage.tsx"))

const router = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={<Loading />}><Main /></Suspense>
    },
    {
        path: "what1",
        element: <Suspense fallback={<Loading />}><What1 /></Suspense>
    },
    {
        path: "what2",
        element: <Suspense fallback={<Loading />}><What2 /></Suspense>
    },
    {
        path: "musicResult",
        element: <Suspense fallback={<Loading />}><MusicResult /></Suspense>
    }
]);

export default router