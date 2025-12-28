import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";
const INSTRUMENT_OPTIONS = [
    {
        label: "바이올린",
        value: "violin",
        imageUrl: "https:
    },
    {
        label: "피아노",
        value: "piano",
        imageUrl: "https:
    },
    {
        label: "기타",
        value: "guitar",
        imageUrl: "https:
    },
    {
        label: "드럼",
        value: "drum",
        imageUrl: "https:
    },
];
function InstrumentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get("from") === "review";
    const [selected, setSelected] = useState<string>("");
    const [customValue, setCustomValue] = useState<string>("");
    const OPTION_GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2";
    const CUSTOM_INPUT_WRAPPER_CLASS = "mt-10 flex flex-col items-center gap-3";
    const OR_TEXT_CLASS = "mt-2 mb-2 text-sm font-semibold text-gray-400";
    const INPUT_CLASS = "retro-input w-full max-w-md text-center";
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
        navigate(isEditMode ? "/review" : "/key");
    };
    const handleSkip = () => {
        removeAnswer("instrument");
        navigate(isEditMode ? "/review" : "/key");
    };
    return (
        <QuestionLayout
            title="어떤 악기를 원하시나요?"
            description="대표 악기를 선택하면 그 질감을 중심으로 구성해드려요."
            stepLabel="03 / 06"
            onBack={() => navigate(isEditMode ? "/review" : -1)}
            onSkip={handleSkip}
            primaryAction={{ label: isEditMode ? "완료" : "다음", onClick: handleNext, disabled: !selected.trim(), variant: "rainbow" }}
        >
            <div className={OPTION_GRID_CLASS}>
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
            <div className={CUSTOM_INPUT_WRAPPER_CLASS}>
                <span className={OR_TEXT_CLASS}>또는</span>
                <input
                    value={customValue}
                    onChange={(e) => {
                        setCustomValue(e.target.value);
                        setSelected(e.target.value);
                    }}
                    placeholder="직접 입력하기"
                    className={INPUT_CLASS}
                />
            </div>
        </QuestionLayout>
    );
}
export default InstrumentPage;
