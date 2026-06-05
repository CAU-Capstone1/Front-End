import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

type KeyOption = {
    value: string;
    label: string;
    helper: string;
};

const KEY_GROUPS: Array<{
    label: string;
    caption: string;
    options: KeyOption[];
}> = [
    {
        label: "밝은 계열",
        caption: "맑고 희망찬 분위기를 만들고 싶을 때",
        options: [
            { value: "C", label: "C", helper: "순수하고 안정적인, 기본에 충실한 느낌" },
            { value: "D", label: "D", helper: "밝고 경쾌한, 가볍게 뛰어오르는 기분" },
            { value: "E", label: "E", helper: "화려하고 반짝이는, 무대 위 스포트라이트" },
        ],
    },
    {
        label: "어두운 계열",
        caption: "잔잔하거나 깊이 있는 분위기를 원할 때",
        options: [
            { value: "F", label: "F", helper: "잔잔하고 따뜻한, 여유로운 감성" },
            { value: "Gm", label: "Gm", helper: "드라마틱하고 몰입감 있는 전개" },
            { value: "Am", label: "Am", helper: "감성적인 울림, 애틋한 장면" },
        ],
    },
];

function KeyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get("from") === "review";
    const [selectedKey, setSelectedKey] = useState<string>("");

    useEffect(() => {
        const cached = getAnswer("key");
        if (cached) setSelectedKey(cached);
    }, []);

    const handleNext = () => {
        if (!selectedKey) return;
        setAnswer("key", selectedKey);
        navigate(isEditMode ? "/review" : "/length");
    };

    const handleSkip = () => {
        removeAnswer("key");
        navigate(isEditMode ? "/review" : "/length");
    };

    return (
        <QuestionLayout
            title="어떤 키를 원하시나요?"
            description="원하는 분위기의 음계를 골라보세요."
            stepLabel="04 / 06"
            onBack={() => isEditMode ? navigate("/review") : navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: isEditMode ? "완료" : "다음", onClick: handleNext, disabled: !selectedKey, variant: "rainbow" }}
        >
            <div className="space-y-6">
                {KEY_GROUPS.map((group) => (
                    <div key={group.label} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-1 pb-4">
                            <h2 className="text-xl font-semibold text-gray-900">{group.label}</h2>
                            <p className="text-sm text-gray-500">{group.caption}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {group.options.map((option) => {
                                const isSelected = selectedKey === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedKey(option.value)}
                                        className={`rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                                            isSelected
                                                ? "border-yellow-500 bg-yellow-100/60 shadow"
                                                : "border-gray-200 bg-gray-50 hover:border-yellow-400"
                                        }`}
                                    >
                                        <span className="text-2xl font-bold text-gray-900">{option.label}</span>
                                        <p className="mt-2 text-sm text-gray-600">{option.helper}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </QuestionLayout>
    );
}

export default KeyPage;

