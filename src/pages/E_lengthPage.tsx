import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import QuestionLayout from "../components/questionLayout";
import { getAnswer, removeAnswer, setAnswer } from "../utils/compositionSession";

function LengthPage() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState<string>("");

    useEffect(() => {
        const cached = getAnswer("duration");
        if (cached) setSeconds(cached);
    }, []);

    const handleNext = () => {
        if (!seconds.trim()) return;
        setAnswer("duration", seconds.trim());
        navigate("/instrument");
    };

    const handleSkip = () => {
        removeAnswer("duration");
        navigate("/instrument");
    };

    return (
        <QuestionLayout
            title="어느 정도 길이를 원하시나요?"
            description="대략적인 곡의 길이를 초 단위로 알려주세요."
            stepLabel="04 / 06"
            onBack={() => navigate(-1)}
            onSkip={handleSkip}
            primaryAction={{ label: "다음", onClick: handleNext, disabled: !seconds.trim() }}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="flex w-full max-w-md items-center gap-3 rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
                    <input
                        value={seconds}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            setSeconds(value);
                        }}
                        placeholder="예: 120"
                        className="flex-1 border-none text-center text-2xl font-semibold text-gray-900 outline-none"
                    />
                    <span className="text-lg font-medium text-gray-600">초</span>
                </div>
                <p className="text-sm text-gray-500">기본값은 120초 (2분) 정도예요. 원하는 길이가 있다면 입력해주세요.</p>
            </div>
        </QuestionLayout>
    );
}

export default LengthPage;

