import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const INSTRUMENT_OPTIONS = [
    {
        label: "바이올린",
        value: "violin",
        imageUrl: "https://i.pinimg.com/1200x/cb/a8/d1/cba8d11e7c7b44e8145d99583ec6bbab.jpg",
    },
    {
        label: "피아노",
        value: "piano",
        imageUrl: "https://i.pinimg.com/1200x/99/38/d3/9938d308c797d53cb4e0d2258ab89a1d.jpg",
    },
    {
        label: "기타",
        value: "guitar",
        imageUrl: "https://i.pinimg.com/736x/38/a7/36/38a73608ecb1cdb70439a424ae3c6c20.jpg",
    },
    {
        label: "드럼",
        value: "drum",
        imageUrl: "https://i.pinimg.com/736x/a8/12/47/a81247532b53804438528daa6ed87bac.jpg",
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
        navigate("/key");
    };

    const handleSkip = () => {
        removeAnswer("instrument");
        navigate("/key");
    };

    return (
        <QuestionLayout
            title="어떤 악기를 원하시나요?"
            description="대표 악기를 선택하면 그 질감을 중심으로 구성해드려요."
            stepLabel="03 / 06"
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !selected.trim(), variant: "rainbow" }}
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
                    className="retro-input w-full max-w-md text-center"
                />
            </div>
        </QuestionLayout>
    );
}

export default InstrumentPage;

