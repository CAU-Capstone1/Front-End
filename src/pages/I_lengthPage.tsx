import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

function LengthPage() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState<string>("");

    useEffect(() => {
        const cached = getAnswer("duration");
        if (!cached) return;
        const sanitized = cached.replace(/[^0-9]/g, "");
        if (!sanitized) return;
        const numeric = Math.min(Number(sanitized), 180);
        setSeconds(numeric ? String(numeric) : "");
    }, []);

    const handleNext = () => {
        const trimmed = seconds.trim();
        if (!trimmed) return;
        const numeric = Math.min(Number(trimmed), 180);
        setAnswer("duration", String(numeric));
        navigate("/tempo");
    };

    const handleSkip = () => {
        removeAnswer("duration");
        navigate("/tempo");
    };

    return (
        <QuestionLayout
            title="어느 정도 길이를 원하시나요?"
            description="대략적인 곡의 길이를 초 단위로 알려주세요."
            stepLabel="05 / 06"
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !seconds.trim(), variant: "rainbow" }}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="flex w-full max-w-md items-center gap-4 rounded-[2rem] border-4 border-black/10 bg-white/85 px-8 py-5 shadow-[0_16px_0_rgba(46,31,39,0.08)]">
                    <input
                        value={seconds}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, "");
                            if (!raw) {
                                setSeconds("");
                                return;
                            }
                            const numeric = Math.min(Number(raw), 180);
                            setSeconds(String(numeric));
                        }}
                        placeholder="예: 120"
                        className="flex-1 border-none bg-transparent text-center text-3xl font-semibold text-[var(--text-primary)] outline-none"
                    />
                    <span className="text-lg font-semibold text-[var(--accent-rose)]">초</span>
                </div>
                <p className="text-sm font-medium text-[var(--text-muted)]">
                최대 180초(3분)까지만 입력할 수 있어요.
                </p>
            </div>
        </QuestionLayout>
    );
}

export default LengthPage;

