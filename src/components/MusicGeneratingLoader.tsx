import { useEffect, useState } from "react";
import DinoGame from "./DinoGame";
const LOADING_MESSAGES = [
    "아이디어를 멜로디로 바꾸는 중이에요...",
    "AI가 멜로디를 분석하고 있어요...",
    "악기 소리를 조합하고 있어요...",
    "리듬과 템포를 맞추고 있어요...",
    "멋진 사운드를 상상하는 중이에요...",
    "거의 다 완성되었어요!",
];
export default function MusicGeneratingLoader() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [showGame, setShowGame] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000); 
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#fff6da] via-white to-[#fce4ef]">
            {}
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/25 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
            <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
                {}
                <div className="relative">
                    <div className="flex items-center justify-center gap-3">
                        {}
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
                        {}
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
                        {}
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
                {}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
                        음악을 생성하고 있어요
                    </h2>
                    <p className="text-lg sm:text-xl text-[var(--text-muted)] min-h-[2rem] transition-all duration-500">
                        {LOADING_MESSAGES[currentMessageIndex]}
                    </p>
                </div>
                {}
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
                {}
                <button
                    onClick={() => setShowGame(true)}
                    className="mt-8 px-8 py-4 rounded-full border-2 border-[var(--accent-amber)] bg-white text-[var(--text-primary)] font-semibold text-lg shadow-[0_8px_0_rgba(242,137,130,0.32)] hover:bg-[var(--accent-amber)]/10 hover:translate-y-[2px] hover:shadow-[0_6px_0_rgba(242,137,130,0.25)] transition-all duration-300"
                >
                    START!
                </button>
                <p className="text-sm text-[var(--text-muted)] mt-2">기다리는 동안 게임을 즐겨보세요!</p>
                {}
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
            {}
            {showGame && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/30 backdrop-blur-sm">
                    <div className="relative">
                        <DinoGame onClose={() => setShowGame(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
