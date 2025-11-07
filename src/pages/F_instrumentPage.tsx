import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const INSTRUMENT_OPTIONS = [
    {
        label: "바이올린",
        value: "violin",
        imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80",
    },
    {
        label: "피아노",
        value: "piano",
        imageUrl: "https://images.unsplash.com/photo-1513885304081-18c924180ca0?auto=format&fit=crop&w=800&q=80",
    },
    {
        label: "기타",
        value: "guitar",
        imageUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80",
    },
    {
        label: "드럼",
        value: "drum",
        imageUrl: "https://images.unsplash.com/photo-1507832321772-e86d67b45ebf?auto=format&fit=crop&w=800&q=80",
    },
];

function InstrumentPage() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<string>("");
    const [customValue, setCustomValue] = useState<string>("");

    useEffect(() => {
        const cached = getAnswer("instrument");
        if (cached) {
            setSelected(cached);
            setCustomValue(INSTRUMENT_OPTIONS.some((opt) => opt.value === cached) ? "" : cached);
        }
    }, []);

    const handleNext = () => {
        if (!selected.trim()) return;
        setAnswer("instrument", selected.trim());
        navigate("/tempo");
    };

    const handleSkip = () => {
        removeAnswer("instrument");
        navigate("/tempo");
    };

    return (
        <QuestionLayout
            title="어떤 악기를 원하시나요?"
            description="대표 악기를 선택하면 그 질감을 중심으로 구성해드려요."
            stepLabel="05 / 06"
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !selected.trim() }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {INSTRUMENT_OPTIONS.map((option) => (
                    <OptionCard
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        imageUrl={option.imageUrl}
                        onClick={(value) => {
                            setSelected(value);
                            setCustomValue("");
                        }}
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

export default InstrumentPage;

