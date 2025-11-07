import { useNavigate } from "react-router";
import VisualUploader from "../components/visualUploader";
import Button from "../components/button";
import { getAnswer } from "../utils/compositionSession";

function VisualUploadPage() {
    const navigate = useNavigate();

    const handleNext = () => {
        const mainMelody = getAnswer("hummingMain");
        if (!mainMelody) {
            alert("메인 멜로디 허밍을 먼저 업로드해주세요.");
            navigate("/");
            return;
        }
        navigate("/what1");
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-[var(--accent-rose)]/25 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 rounded-full bg-[var(--accent-amber)]/30 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12">
                <header className="text-center space-y-3">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)] shadow-[0_10px_0_rgba(46,31,39,0.08)]">
                        step 02
                    </span>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)]">
                        참고 이미지나 영상을 준비했나요?
                    </h1>
                    <p className="text-base text-[var(--text-muted)]">
                        AI에게 보여주고 싶은 분위기가 있다면 여기에서 업로드해 주세요. 꼭 필요하지는 않으니 건너뛰어도 괜찮아요.
                    </p>
                </header>

                <VisualUploader />

                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={handleNext} variant="rainbow" className="px-12 py-4 text-lg">
                        다음
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VisualUploadPage;

