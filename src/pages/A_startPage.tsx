import Button from "../components/button";

const SPARKLES = Array.from({ length: 30 }).map((_, idx) => idx);

function StartPage() {
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
                        className="w-full max-w-4xl animate-[logoBounce_6s_ease-in-out_infinite] drop-shadow-[0_25px_55px_rgba(246,190,95,0.35)]"
                    />
                    {/* <h1 className="start-title text-4xl font-bold tracking-[0.3em] uppercase sm:text-5xl">
                        Humming Bird
                    </h1> */}
                </header>

                <div className="flex flex-col items-center mt-6">
                    <Button toWhere="/main" variant="rainbow" className="px-16 py-5 text-lg">
                        시작하기
                    </Button>
                </div>
            </main>
        </div>
    );
}

export default StartPage;

