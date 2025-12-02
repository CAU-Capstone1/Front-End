/*사용자가 /what1, /key, /review, /musicResult 같은 경로로 이동할 때 어떤 화면이 나올지 결정*/

import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import AppLayout from "../layout/AppLayout";

const Loading = () => <div>로딩 중.........</div>;
const Start = lazy(() => import("../pages/A_startPage.tsx"));
const Main = lazy(() => import("../pages/B_mainPage.tsx"));
const VisualUpload = lazy(() => import("../pages/C_visualUploadPage.tsx"));
const What1 = lazy(() => import("../pages/D_whatPage1.tsx"));
const What2 = lazy(() => import("../pages/E_whatPage2.tsx"));
const InstrumentPage = lazy(() => import("../pages/F_instrumentPage.tsx"));
const KeyPage = lazy(() => import("../pages/G_keyPage.tsx"));
const LengthPage = lazy(() => import("../pages/I_lengthPage.tsx"));
const TempoPage = lazy(() => import("../pages/H_tempoPage.tsx"));
const ReviewPage = lazy(() => import("../pages/J_reviewPage.tsx"));
const MusicResult = lazy(() => import("../pages/K_musicResultPage.tsx"));
const MyPage = lazy(() => import("../pages/L_myPage.tsx"));
const LoginPage = lazy(() => import("../pages/M_loginPage.tsx"));
const SignupPage = lazy(() => import("../pages/N_signupPage.tsx"));

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                path: "",
                element: (
                    <Suspense fallback={<Loading />}>
                        <Start />
                    </Suspense>
                ),
            },
            {
                path: "main",
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
            {
                path: "myPage",
                element: (
                    <Suspense fallback={<Loading />}>
                        <MyPage />
                    </Suspense>
                ),
            },
            {
                path: "login",
                element: (
                    <Suspense fallback={<Loading />}>
                        <LoginPage />
                    </Suspense>
                ),
            },
            {
                path: "signup",
                element: (
                    <Suspense fallback={<Loading />}>
                        <SignupPage />
                    </Suspense>
                ),
            },
        ],
    },
]);

export default router