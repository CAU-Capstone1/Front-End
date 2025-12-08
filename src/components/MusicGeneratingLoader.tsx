import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
    "AI가 멜로디를 분석하고 있어요...",
    "악기 소리를 조합하고 있어요...",
    "리듬과 템포를 맞추고 있어요...",
    "최종 음악을 완성하고 있어요...",
    "거의 다 완성되었어요!",
];

export default function MusicGeneratingLoader() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000); // 3초마다 메시지 변경

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#fff6da] via-white to-[#fce4ef]">
            {/* 배경 장식 */}
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/25 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

            <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
                {/* 음표 애니메이션 */}
                <div className="relative">
                    <div className="flex items-center justify-center gap-3">
                        {/* 음표 1 */}
                        <div className="music-note" style={{ animationDelay: "0s" }}>
                            <svg
                                viewBox="0 0 24 24"
                                className="w-16 h-16 fill-[var(--accent-rose)]"
                                style={{
                                    animation: "float 2s ease-in-out infinite",
                                }}
                            >
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                        {/* 음표 2 */}
                        <div className="music-note" style={{ animationDelay: "0.3s" }}>
                            <svg
                                viewBox="0 0 24 24"
                                className="w-16 h-16 fill-[var(--accent-amber)]"
                                style={{
                                    animation: "float 2s ease-in-out infinite",
                                }}
                            >
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                        {/* 음표 3 */}
                        <div className="music-note" style={{ animationDelay: "0.6s" }}>
                            <svg
                                viewBox="0 0 24 24"
                                className="w-16 h-16 fill-[var(--accent-mint)]"
                                style={{
                                    animation: "float 2s ease-in-out infinite",
                                }}
                            >
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 로딩 텍스트 */}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
                        음악을 생성하고 있어요
                    </h2>
                    <p className="text-lg sm:text-xl text-[var(--text-muted)] min-h-[2rem] transition-all duration-500">
                        {LOADING_MESSAGES[currentMessageIndex]}
                    </p>
                </div>

                {/* 로딩 바 */}
                <div className="w-full max-w-md">
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--accent-rose)] via-[var(--accent-amber)] to-[var(--accent-mint)] rounded-full"
                            style={{
                                animation: "loading 2s ease-in-out infinite",
                            }}
                        />
                    </div>
                </div>

                {/* 스타일 태그 */}
                <style>{`
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-20px) rotate(10deg);
                        }
                    }
                    @keyframes loading {
                        0% {
                            transform: translateX(-100%);
                        }
                        100% {
                            transform: translateX(100%);
                        }
                    }
                    .music-note {
                        animation: float 2s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
}

