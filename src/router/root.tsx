import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

const Loading = () => <div>Loading.........</div>
const Main = lazy(() => import("../pages/mainPage"))
const About = lazy(() => import("../pages/aboutPage"))
const Soohyun = lazy(() => import("../pages/soohyunPage"))
const What1 = lazy(() => import("../pages/whatPage1.tsx"))
const What2 = lazy(() => import("../pages/whatPage2.tsx"))
const MusicResult = lazy(() => import("../pages/musicResultPage.tsx"))

const router = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={<Loading />}><Main /></Suspense>
    },
    {
        path: "about",
        element: <Suspense fallback={<Loading />}><About /></Suspense>
    },
    {
        path: "soohyun",
        element: <Suspense fallback={<Loading />}><Soohyun /></Suspense>
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