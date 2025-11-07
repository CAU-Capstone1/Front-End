import { useEffect, useMemo, useState } from "react";
import Button from "../components/button";
import { getAllAnswers, resetAnswers } from "../utils/compositionSession";
import { formatAnswerValue } from "../utils/valueLabels";

type SummaryItem = {
    label: string;
    value: string;
};

function MusicResultPage() {
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [composeResponseJson, setComposeResponseJson] = useState<string | null>(null);

    useEffect(() => {
        const answers = getAllAnswers();
        const items: SummaryItem[] = [
            { label: "허밍 파일", value: formatAnswerValue(answers.hummingPath ?? null) },
            { label: "장르", value: formatAnswerValue(answers.style ?? null) },
            { label: "무드", value: formatAnswerValue(answers.mood ?? null) },
            { label: "키", value: formatAnswerValue(answers.key ?? null) },
            {
                label: "길이",
                value: formatAnswerValue(answers.duration ?? null, "초"),
            },
            { label: "악기", value: formatAnswerValue(answers.instrument ?? null) },
            { label: "템포", value: formatAnswerValue(answers.tempo ?? null) },
        ];
        setSummary(items);

        const rawResponse = sessionStorage.getItem("compose:lastResponse");
        if (rawResponse) {
            try {
                const parsed = JSON.parse(rawResponse);
                setComposeResponseJson(JSON.stringify(parsed, null, 2));
            } catch (error) {
                console.warn("Failed to parse compose response", error);
            }
        }
    }, []);

    const hasData = useMemo(() => summary.some((item) => item.value !== "-"), [summary]);

    return (
        <div className="min-h-screen w-full bg-[#FBFBFA] px-4 py-12 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
                <header className="text-center space-y-3">
                    <p className="text-sm font-medium text-yellow-600">AI Composition Result</p>
                    <h1 className="text-3xl font-semibold text-gray-900">음악이 완성되었습니다</h1>
                    <p className="text-base text-gray-500">지금 바로 재생해보고, 원하는 이름과 보관 장소를 선택해보세요.</p>
                </header>

                <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="flex flex-col items-center gap-6">
                            <button
                                type="button"
                                className="flex h-44 w-44 items-center justify-center rounded-full bg-yellow-400 text-4xl font-bold text-gray-900 shadow-lg transition hover:bg-yellow-300"
                            >
                                ▶
                            </button>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button variant="secondary" className="px-6">
                                    음악 이름 짓기
                                </Button>
                                <Button className="px-6">내 보관함</Button>
                                <Button className="px-6" variant="ghost">
                                    2차 가공
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">요청 요약</h2>
                        <div className="mt-6 space-y-4">
                            {summary.map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                                    <span className="text-sm font-medium text-gray-500">{item.label}</span>
                                    <span className="text-base font-semibold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {!hasData && (
                    <div className="rounded-2xl border border-dashed border-yellow-300 bg-yellow-50 px-6 py-4 text-sm text-yellow-700">
                        아직 입력된 정보가 없어요. 처음으로 돌아가서 허밍을 업로드하거나 질문에 답해보세요.
                    </div>
                )}

                {composeResponseJson && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">AI 응답 미리보기</h2>
                        <pre className="mt-4 max-h-60 overflow-auto rounded-xl bg-gray-900/90 p-4 text-sm text-gray-100">
                            {composeResponseJson}
                        </pre>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-3">
                    <Button toWhere="/" className="px-6" onClick={() => resetAnswers()}>
                        처음으로 돌아가기
                    </Button>
                    <Button variant="ghost" className="px-6" onClick={() => window.location.reload()}>
                        다시 생성하기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MusicResultPage;

