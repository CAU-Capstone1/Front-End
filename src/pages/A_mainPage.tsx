import { useNavigate } from "react-router";
import AudioFileUploader from "../components/audioFile";
import Button from "../components/button";
import { getAnswer } from "../utils/compositionSession";

function MainPage() {
    const navigate = useNavigate();

    const handleSkip = () => {
        const mainMelody = getAnswer("hummingMain");
        if (!mainMelody) {
            alert("메인 멜로디 허밍을 먼저 업로드해주세요.");
            return;
        }
        navigate("/what1");
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-10 top-0 hidden h-40 w-40 rounded-full bg-[var(--accent-rose)]/35 blur-3xl sm:block" />
            <div className="pointer-events-none absolute -right-6 top-32 hidden h-44 w-44 rounded-full bg-[var(--accent-mint)]/45 blur-3xl sm:block" />
            <div className="pointer-events-none absolute left-1/2 bottom-10 hidden h-48 w-48 -translate-x-1/2 rounded-full bg-[var(--accent-amber)]/30 blur-3xl sm:block" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-14">
                <header className="text-center space-y-4">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-amber)] shadow-[0_10px_0_rgba(46,31,39,0.08)]">
                        welcome
                    </span>
                    <h1 className="text-[2.8rem] font-semibold leading-tight text-[var(--text-primary)]">
                        지금부터 당신만의 음악을 설계해볼까요?
                    </h1>
                    <p className="text-base text-[var(--text-muted)]">
                        필요하다면 멜로디 구간을 나눠서 올리고, 참고 이미지를 추가해 분위기를 설명해보세요.
                    </p>
                </header>

                <AudioFileUploader />

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button toWhere="/visual" variant="outline" className="px-10">
                        이미지 업로드하기
                        </Button>
                        <Button onClick={handleSkip} className="px-12 py-4 text-lg">
                            업로드 완료
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainPage;