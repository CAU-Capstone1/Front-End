import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const GENRE_OPTIONS = [
    {
        label: "클래식",
        value: "classical",
        imageUrl: "https://www.knso.or.kr/resources/images/sub/img_intro3.jpg",
    },
    {
        label: "힙합",
        value: "hiphop",
        imageUrl: "/hiphop2.jpg",
    },
    {
        label: "록",
        value: "rock",
        imageUrl: "/rock.jpg",
    },
    {
        label: "재즈",
        value: "jazz",
        imageUrl: "/JAZZ2.jpg",
    },
];

function What1() {
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
        const cached = getAnswer("style");
        if (cached) {
            setSelected(cached);
            setCustomValue(GENRE_OPTIONS.some((opt) => opt.value === cached) ? "" : cached);
        }
    }, []);

    const handleSelect = (value: string) => {
        setSelected(value);
        setCustomValue("");
    };

    const handleNext = () => {
        if (!selected.trim()) return;
        setAnswer("style", selected.trim());
        // 수정 모드면 리뷰 페이지로, 아니면 다음 단계로
        navigate(isEditMode ? "/review" : "/what2");
    };

    const handleSkip = () => {
        removeAnswer("style");
        navigate(isEditMode ? "/review" : "/what2");
    };

    return (
        <QuestionLayout
            title="어떤 장르의 음악을 만들고 싶으신가요?"
            description="느낌에 가장 가까운 장르를 선택하거나 직접 입력할 수 있어요."
            stepLabel="01 / 06"
            onBack={() => isEditMode ? navigate("/review") : navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: isEditMode ? "완료" : "다음", onClick: handleNext, disabled: !selected.trim(), variant: "rainbow" }}
        >
            <div className={OPTION_GRID_CLASS}>
                {GENRE_OPTIONS.map((option) => (
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

export default What1;

