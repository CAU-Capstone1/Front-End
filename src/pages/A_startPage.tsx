import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { resetAnswers } from "../utils/compositionSession";
import { getCurrentUser } from "../utils/auth";
import DinoGame from "../components/DinoGame";
const SPARKLES = Array.from({ length: 30 }).map((_, idx) => idx);
function StartPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [showGame, setShowGame] = useState(false);
    useEffect(() => {
        resetAnswers();
    }, []);
    const handleStartClick = () => {
        const user = getCurrentUser();
        if (!user) {
            setShowModal(true);
        } else {
            navigate("/main");
        }
    };
    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'logo');
    };
    const handleDragEnd = () => {
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };
    const handleDragLeave = () => {
        setIsDragOver(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setIsDragging(false);
        const data = e.dataTransfer.getData('text/plain');
        if (data === 'logo') {
            setShowGame(true);
        }
    };
    return (
        <div className="start-gradient-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-20 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 animate-[floatUp_9s_ease-in-out_infinite] rounded-full bg-[var(--accent-rose)]/30 blur-3xl" />
            <div className="pointer-events-none absolute right-10 top-16 h-56 w-56 animate-[floatUp_13s_ease-in-out_infinite] rounded-full bg-[var(--accent-mint)]/30 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 bottom-[-3rem] h-72 w-72 -translate-x-1/2 animate-[floatUp_11s_ease-in-out_infinite] rounded-full bg-[var(--accent-amber)]/35 blur-3xl" />
            {SPARKLES.map((sparkle) => (
                <span
                    key={sparkle}
                    className="sparkle-star"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5.5}s`,
                        animationDuration: `${2 + Math.random() * 2.5}s`,
                        transform: `scale(${0.5 + Math.random() * 3})`,
                    }}
                />
            ))}
            <main className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-14 text-center">
                <header className="flex flex-col items-center gap-6">
                    <img
                        src="/HBLG.png"
                        alt="Humming Bird"
                        draggable
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        className={`w-full max-w-4xl animate-[logoBounce_6s_ease-in-out_infinite] drop-shadow-[0_25px_55px_rgba(246,190,95,0.35)] cursor-grab active:cursor-grabbing transition-opacity duration-200 ${
                            isDragging ? 'opacity-50' : ''
                        }`}
                    />
                    {}
                </header>
                <div className="flex flex-col items-center mt-6">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`transition-all duration-200 ${
                            isDragOver ? 'scale-110' : ''
                        }`}
                    >
                        <Button 
                            onClick={handleStartClick} 
                            variant="rainbow" 
                            className={`px-16 py-5 text-lg transition-all duration-200 ${
                                isDragOver ? 'ring-4 ring-white/50 shadow-2xl' : ''
                            }`}
                        >
                            시작하기
                        </Button>
                    </div>
                </div>
            </main>
            {}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative mx-4 w-full max-w-md rounded-[2rem] border-4 border-black/10 bg-white/95 px-8 py-10 shadow-[0_28px_0_rgba(46,31,39,0.15)] animate-fade-in-up">
                        <h2 className="mb-4 text-center text-2xl font-semibold text-[var(--text-primary)]">
                            로그인 먼저 해주세요
                        </h2>
                        <p className="mb-8 text-center text-base text-[var(--text-muted)]">
                            음악을 만들려면 먼저 로그인이 필요해요.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => navigate("/login")}
                                variant="rainbow"
                                className="w-full px-8 py-4 text-lg"
                            >
                                로그인하러 가기
                            </Button>
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="outline"
                                className="w-full px-8 py-4 text-lg"
                            >
                                닫기
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {}
            {showGame && <DinoGame onClose={() => setShowGame(false)} />}
        </div>
    );
}
export default StartPage;
