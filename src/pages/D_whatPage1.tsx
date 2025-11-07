import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OptionCard from "../components/optionCard";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

const GENRE_OPTIONS = [
    {
        label: "오케스트라",
        value: "orchestra",
        imageUrl: "https://www.knso.or.kr/resources/images/sub/img_intro3.jpg",
    },
    {
        label: "힙합",
        value: "hiphop",
        imageUrl: "https://i.namu.wiki/i/Jz224Csh4AhvZ53rujh-eqK_GKO_x7jxsNbsBV5FyoM2aEF36Y0ScvTUKunhDR1-fKej9wXzVyASyCdtGY8H6w.webp",
    },
    {
        label: "lofi",
        value: "lofi",
        imageUrl: "https://img1.daumcdn.net/thumb/R1280x0.fwebp/?fname=http://t1.daumcdn.net/brunch/service/user/3XvV/image/Vp2Idqu3LI8_4_fC2To-0o5ovHU.JPG",
    },
    {
        label: "사극풍",
        value: "sageuk",
        imageUrl: "https://img.segye.com/content/image/2023/04/25/20230425518948.jpg",
    },
];

function What1() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<string>("");
    const [customValue, setCustomValue] = useState<string>("");

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
        navigate("/what2");
    };

    const handleSkip = () => {
        removeAnswer("style");
        navigate("/what2");
    };

    return (
        <QuestionLayout
            title="어떤 장르의 음악을 만들고 싶으신가요?"
            description="느낌에 가장 가까운 장르를 선택하거나 직접 입력할 수 있어요."
            stepLabel="01 / 06"
            onSkip={handleSkip}
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !selected.trim(), variant: "rainbow" }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
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

export default What1;

