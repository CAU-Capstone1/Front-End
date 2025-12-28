import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";
const MOOD_OPTIONS_BY_GENRE: Record<string, Array<{ label: string; value: string; imageUrl: string }>> = {
    classical: [
        {
            label: "웅장한",
            value: "grand",
            imageUrl: "https:
        },
        {
            label: "고급스러운",
            value: "luxurious",
            imageUrl: "https:
        },
        {
            label: "슬픈",
            value: "poignant",
            imageUrl: "https:
        },
        {
            label: "잔잔한",
            value: "calm",
            imageUrl: "https:
        },
    ],
    hiphop: [
        {
            label: "자신감있는",
            value: "confident",
            imageUrl: "https:
        },
        {
            label: "거친",
            value: "rough",
            imageUrl: "https:
        },
        {
            label: "느긋한",
            value: "relaxed",
            imageUrl: "https:
        },
        {
            label: "신나는",
            value: "exciting",
            imageUrl: "https:
        },
    ],
    rock: [
        {
            label: "폭발적인",
            value: "explosive",
            imageUrl: "https:
        },
        {
            label: "반항적인",
            value: "rebellious",
            imageUrl: "https:
        },
        {
            label: "쓸쓸한",
            value: "lonely",
            imageUrl: "https:
        },
        {
            label: "희망찬",
            value: "anthemic",
            imageUrl: "https:
        },
    ],
    jazz: [
        {
            label: "로맨틱한",
            value: "romantic",
            imageUrl: "https:
        },
        {
            label: "외로운",
            value: "solitary",
            imageUrl: "https:
        },
        {
            label: "경쾌한",
            value: "swingy",
            imageUrl: "https:
        },
        {
            label: "세련된",
            value: "refined",
            imageUrl: "https:
        },
    ],
};
const DEFAULT_MOOD_OPTIONS = [
    {
        label: "평화로운",
        value: "peaceful",
        imageUrl: "https:
    },
    {
        label: "슬픈",
        value: "sad",
        imageUrl: "https:
    },
    {
        label: "신나는",
        value: "exciting",
        imageUrl: "https:
    },
    {
        label: "긴박한",
        value: "intense",
        imageUrl: "https:
    },
];
function What2() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get("from") === "review";
    const [selected, setSelected] = useState<string>("");
    const [customValue, setCustomValue] = useState<string>("");
    const OPTION_GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2";
    const CUSTOM_INPUT_WRAPPER_CLASS = "mt-10 flex flex-col items-center gap-3";
    const OR_TEXT_CLASS = "mt-2 mb-2 text-sm font-semibold text-gray-400";
    const INPUT_CLASS = "retro-input w-full max-w-md text-center";
    const selectedGenre = getAnswer("style");
    const moodOptions = useMemo(() => {
        if (selectedGenre && MOOD_OPTIONS_BY_GENRE[selectedGenre]) {
            return MOOD_OPTIONS_BY_GENRE[selectedGenre];
        }
        return DEFAULT_MOOD_OPTIONS;
    }, [selectedGenre]);
    useEffect(() => {
        const cached = getAnswer("mood");
        if (cached) {
            setSelected(cached);
            setCustomValue(moodOptions.some((opt) => opt.value === cached) ? "" : cached);
        }
    }, [moodOptions]);
    const handleSelect = (value: string) => {
        setSelected(value);
        setCustomValue("");
    };
    const handleNext = () => {
        if (!selected.trim()) return;
        setAnswer("mood", selected.trim());
        navigate(isEditMode ? "/review" : "/instrument");
    };
    const handleSkip = () => {
        removeAnswer("mood");
        navigate(isEditMode ? "/review" : "/instrument");
    };
    return (
        <QuestionLayout
            title="어떤 분위기의 음악을 만들고 싶으신가요?"
            description="느끼고 싶은 무드를 선택하거나 직접 입력하세요."
            stepLabel="02 / 06"
            onBack={() => isEditMode ? navigate("/review") : navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: isEditMode ? "완료" : "다음", onClick: handleNext, disabled: !selected.trim(), variant: "rainbow" }}
        >
            <div className={OPTION_GRID_CLASS}>
                {moodOptions.map((option) => (
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
export default What2;
