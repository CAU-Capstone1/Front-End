import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

// 장르별 분위기 옵션
const MOOD_OPTIONS_BY_GENRE: Record<string, Array<{ label: string; value: string; imageUrl: string }>> = {
    classical: [
        {
            label: "웅장한",
            value: "grand",
            imageUrl: "https://i.pinimg.com/736x/a1/2b/3c/a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg",
        },
        {
            label: "고급스러운",
            value: "luxurious",
            imageUrl: "https://i.pinimg.com/736x/e5/0d/73/e50d7394c8f0f7b5e7c5e5e5e5e5e5e5.jpg",
        },
        {
            label: "애잔한",
            value: "poignant",
            imageUrl: "https://i.pinimg.com/736x/62/19/93/6219934aea211d826e58509e8979fa1f.jpg",
        },
        {
            label: "잔잔한",
            value: "calm",
            imageUrl: "https://i.pinimg.com/736x/a8/4e/22/a84e227c33d5e3e6a0f1295bb74f2f3e.jpg",
        },
    ],
    hiphop: [
        {
            label: "당당한",
            value: "confident",
            imageUrl: "https://i.pinimg.com/736x/73/0e/a5/730ea54905b57dfa59981fc9825badd2.jpg",
        },
        {
            label: "거친",
            value: "rough",
            imageUrl: "https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.jpg",
        },
        {
            label: "느긋한",
            value: "relaxed",
            imageUrl: "https://i.pinimg.com/736x/a8/4e/22/a84e227c33d5e3e6a0f1295bb74f2f3e.jpg",
        },
        {
            label: "신나는",
            value: "exciting",
            imageUrl: "https://i.pinimg.com/originals/ee/6f/73/ee6f733e3ef99b3f16ce3c512c7b9442.gif",
        },
    ],
    rock: [
        {
            label: "폭발적인",
            value: "explosive",
            imageUrl: "https://i.pinimg.com/736x/73/0e/a5/730ea54905b57dfa59981fc9825badd2.jpg",
        },
        {
            label: "반항적인",
            value: "rebellious",
            imageUrl: "https://i.pinimg.com/736x/b2/c3/d4/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.jpg",
        },
        {
            label: "쓸쓸한",
            value: "lonely",
            imageUrl: "https://i.pinimg.com/736x/62/19/93/6219934aea211d826e58509e8979fa1f.jpg",
        },
        {
            label: "희망찬",
            value: "anthemic",
            imageUrl: "https://i.pinimg.com/originals/ee/6f/73/ee6f733e3ef99b3f16ce3c512c7b9442.gif",
        },
    ],
    jazz: [
        {
            label: "로맨틱한",
            value: "romantic",
            imageUrl: "https://i.pinimg.com/736x/a8/4e/22/a84e227c33d5e3e6a0f1295bb74f2f3e.jpg",
        },
        {
            label: "외로운",
            value: "solitary",
            imageUrl: "https://i.pinimg.com/736x/62/19/93/6219934aea211d826e58509e8979fa1f.jpg",
        },
        {
            label: "경쾌한",
            value: "swingy",
            imageUrl: "https://i.pinimg.com/originals/ee/6f/73/ee6f733e3ef99b3f16ce3c512c7b9442.gif",
        },
        {
            label: "세련된",
            value: "refined",
            imageUrl: "https://i.pinimg.com/736x/c3/d4/e5/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.jpg",
        },
    ],
};

// 기본 분위기 옵션 (장르를 선택하지 않았거나 커스텀 장르일 경우)
const DEFAULT_MOOD_OPTIONS = [
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

    const OPTION_GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2";
    const CUSTOM_INPUT_WRAPPER_CLASS = "mt-10 flex flex-col items-center gap-3";
    const OR_TEXT_CLASS = "mt-2 mb-2 text-sm font-semibold text-gray-400";
    const INPUT_CLASS = "retro-input w-full max-w-md text-center";

    // 이전 페이지에서 선택한 장르 가져오기
    const selectedGenre = getAnswer("style");
    
    // 장르에 따른 분위기 옵션 선택
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
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !selected.trim(), variant: "rainbow" }}
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

