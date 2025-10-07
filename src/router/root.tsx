import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

const Loading = () => <div>Loading.........</div>
const Main = lazy(() => import("../pages/mainPage"))
const About = lazy(() => import("../pages/aboutPage"))
const Soohyun = lazy(() => import("../pages/soohyunPage"))

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
    }
]);

export default router