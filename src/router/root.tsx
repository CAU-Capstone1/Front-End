/*사용자가 /what1, /key, /review, /musicResult 같은 경로로 이동할 때 어떤 화면이 나올지 결정*/

import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

const Loading = () => <div>로딩 중.........</div>;
const Main = lazy(() => import("../pages/A_mainPage.tsx"));
const VisualUpload = lazy(() => import("../pages/B_visualUploadPage.tsx"));
const What1 = lazy(() => import("../pages/C_whatPage1.tsx"));
const What2 = lazy(() => import("../pages/D_whatPage2.tsx"));
const InstrumentPage = lazy(() => import("../pages/E_instrumentPage.tsx"));
const KeyPage = lazy(() => import("../pages/F_keyPage.tsx"));
const LengthPage = lazy(() => import("../pages/G_lengthPage.tsx"));
const TempoPage = lazy(() => import("../pages/H_tempoPage.tsx"));
const ReviewPage = lazy(() => import("../pages/I_reviewPage.tsx"));
const MusicResult = lazy(() => import("../pages/J_musicResultPage.tsx"));

const router = createBrowserRouter([
    {
        path: "",
        element: (
            <Suspense fallback={<Loading />}>
                <Main />
            </Suspense>
        ),
    },
    {
        path: "visual",
        element: (
            <Suspense fallback={<Loading />}>
                <VisualUpload />
            </Suspense>
        ),
    },
    {
        path: "what1",
        element: (
            <Suspense fallback={<Loading />}>
                <What1 />
            </Suspense>
        ),
    },
    {
        path: "what2",
        element: (
            <Suspense fallback={<Loading />}>
                <What2 />
            </Suspense>
        ),
    },
    {
        path: "instrument",
        element: (
            <Suspense fallback={<Loading />}>
                <InstrumentPage />
            </Suspense>
        ),
    },
    {
        path: "key",
        element: (
            <Suspense fallback={<Loading />}>
                <KeyPage />
            </Suspense>
        ),
    },
    {
        path: "length",
        element: (
            <Suspense fallback={<Loading />}>
                <LengthPage />
            </Suspense>
        ),
    },
    {
        path: "tempo",
        element: (
            <Suspense fallback={<Loading />}>
                <TempoPage />
            </Suspense>
        ),
    },
    {
        path: "review",
        element: (
            <Suspense fallback={<Loading />}>
                <ReviewPage />
            </Suspense>
        ),
    },
    {
        path: "musicResult",
        element: (
            <Suspense fallback={<Loading />}>
                <MusicResult />
            </Suspense>
        ),
    },
]);

export default router