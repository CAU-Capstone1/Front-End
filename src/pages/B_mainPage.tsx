import { useNavigate } from "react-router";
import AudioFileUploader from "../components/audioFile";
import Button from "../components/button";
import { getAnswer } from "../utils/compositionSession";

function MainPage() {
    const navigate = useNavigate();

    const requireMainMelody = () => {
        const mainMelody = getAnswer("hummingMain");
        if (!mainMelody) {
            alert("메인 멜로디 허밍을 먼저 업로드해주세요.");
            return false;
        }
        return true;
    };

    const handleGoVisual = () => {
        if (!requireMainMelody()) return;
        navigate("/visual");
    };

    const handleSkip = () => {
        if (!requireMainMelody()) return;
        navigate("/what1");
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-10 top-0 hidden h-40 w-40 rounded-full bg-[var(--accent-rose)]/35 blur-3xl sm:block" />
            <div className="pointer-events-none absolute -right-6 top-32 hidden h-44 w-44 rounded-full bg-[var(--accent-mint)]/45 blur-3xl sm:block" />
            <div className="pointer-events-none absolute left-1/2 bottom-10 hidden h-48 w-48 -translate-x-1/2 rounded-full bg-[var(--accent-amber)]/30 blur-3xl sm:block" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5">
                <header className="flex w-full items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-m text-[var(--text-muted)]">
                        ← 이전으로
                    </Button>
                    <span />
                </header>
                <AudioFileUploader />

                <div className="flex flex-col items-center gap-4 text-center mt-15">
                    <div className="flex flex-wrap justify-center gap-10">
                        <Button onClick={handleGoVisual} variant="rainbow" className="px-12 py-5 text-lg">
                            이미지 업로드하기
                        </Button>
                        <Button onClick={handleSkip} variant="rainbow" className="px-12 py-5 text-lg">
                             바로 다음 단계로 
                        </Button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export default MainPage;