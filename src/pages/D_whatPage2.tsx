import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const MOOD_OPTIONS = [
    {
        label: "평화로운",
        value: "peaceful",
        imageUrl: "https://i.pinimg.com/736x/a8/4e/22/a84e227c33d5e3e6a0f1295bb74f2f3e.jpg",
    },
    {
        label: "슬픈",
        value: "sad",
        imageUrl: "https://i.pinimg.com/736x/62/19/93/6219934aea211d826e58509e8979fa1f.jpg",
    },
    {
        label: "신나는",
        value: "exciting",
        imageUrl: "https://i.pinimg.com/originals/ee/6f/73/ee6f733e3ef99b3f16ce3c512c7b9442.gif",
    },
    {
        label: "긴박한",
        value: "intense",
        imageUrl: "https://i.pinimg.com/736x/73/0e/a5/730ea54905b57dfa59981fc9825badd2.jpg",
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
        navigate("/instrument");
    };

    const handleSkip = () => {
        removeAnswer("mood");
        navigate("/instrument");
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
                    className="retro-input w-full max-w-md text-center"
                />
            </div>
        </QuestionLayout>
    );
}

export default What2;

