import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const TEMPO_OPTIONS = [
    { label: "아주 빠르게", value: "very-fast", helper: "에너지 넘치는 160BPM 이상" },
    { label: "빠르게", value: "fast", helper: "활기찬 130~150BPM" },
    { label: "보통", value: "medium", helper: "익숙하고 편안한 110~120BPM" },
    { label: "느리게", value: "slow", helper: "잔잔한 80~100BPM" },
    { label: "아주 느리게", value: "very-slow", helper: "감성적인 60BPM 이하" },
];

function TempoPage() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
        const cached = getAnswer("tempo");
        if (cached) setSelected(cached);
    }, []);

    const handleNext = () => {
        if (!selected) return;
        setAnswer("tempo", selected);
        navigate("/review");
    };

    const handleSkip = () => {
        removeAnswer("tempo");
        navigate("/review");
    };

    return (
        <QuestionLayout
            title="어떤 빠르기를 원하시나요?"
            description="원하는 템포를 선택하면 음악의 속도를 맞춰드려요."
            stepLabel="06 / 06"
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: "확인하기", onClick: handleNext, disabled: !selected, variant: "rainbow" }}
        >
            <div className="space-y-3">
                {TEMPO_OPTIONS.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                        <label
                            key={option.value}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-4 transition ${
                                isSelected
                                    ? "border-[var(--accent-amber)] bg-white shadow-[0_14px_0_rgba(246,190,95,0.18)]"
                                    : "border-black/10 bg-white hover:border-[var(--accent-amber)]"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="tempo"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() => setSelected(option.value)}
                                    className="tempo-radio-star"
                                />
                                <div>
                                    <p className="text-base font-semibold text-gray-900">{option.label}</p>
                                    <p className="text-sm text-gray-500">{option.helper}</p>
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </QuestionLayout>
    );
}

export default TempoPage;

