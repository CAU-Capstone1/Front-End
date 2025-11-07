import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const MOOD_OPTIONS = [
    {
        label: "평화로운",
        value: "peaceful",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    },
    {
        label: "몽환적인",
        value: "dreamy",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80&sat=-50",
    },
    {
        label: "신나는",
        value: "exciting",
        imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
    },
    {
        label: "긴박한",
        value: "intense",
        imageUrl: "https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?auto=format&fit=crop&w=800&q=80",
    },
];

function What2() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<string>("");
    const [customValue, setCustomValue] = useState<string>("");

    useEffect(() => {
        const cached = getAnswer("mood");
        if (cached) {
            setSelected(cached);
            setCustomValue(MOOD_OPTIONS.some((opt) => opt.value === cached) ? "" : cached);
        }
    }, []);

    const handleSelect = (value: string) => {
        setSelected(value);
        setCustomValue("");
    };

    const handleNext = () => {
        if (!selected.trim()) return;
        setAnswer("mood", selected.trim());
        navigate("/key");
    };

    const handleSkip = () => {
        removeAnswer("mood");
        navigate("/key");
    };

    return (
        <QuestionLayout
            title="어떤 분위기의 음악을 만들고 싶으신가요?"
            description="느끼고 싶은 무드를 선택하거나 직접 입력하세요."
            stepLabel="02 / 06"
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !selected.trim() }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {MOOD_OPTIONS.map((option) => (
                    <OptionCard
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        imageUrl={option.imageUrl}
                        onClick={handleSelect}
                        selected={selected === option.value}
                    />
                ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3">
                <span className="text-sm font-semibold text-gray-400">또는</span>
                <input
                    value={customValue}
                    onChange={(e) => {
                        setCustomValue(e.target.value);
                        setSelected(e.target.value);
                    }}
                    placeholder="직접 입력하기"
                    className="w-full max-w-md rounded-2xl border border-gray-300 bg-white px-5 py-3 text-center text-base shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
            </div>
        </QuestionLayout>
    );
}

export default What2;

