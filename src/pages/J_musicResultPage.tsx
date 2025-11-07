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
        const displayValue = (value: string | null | undefined, suffix?: string) => {
            const formatted = formatAnswerValue(value ?? null, suffix);
            return formatted === "-" ? "선택하지 않음" : formatted;
        };
        const items: SummaryItem[] = [
            { label: "시작 멜로디", value: displayValue(answers.hummingStart) },
            { label: "메인 멜로디", value: displayValue(answers.hummingMain) },
            { label: "끝 멜로디", value: displayValue(answers.hummingEnd) },
            { label: "참고 이미지 / 영상", value: displayValue(answers.referenceVisual) },
            { label: "장르", value: displayValue(answers.style) },
            { label: "무드", value: displayValue(answers.mood) },
            { label: "키", value: displayValue(answers.key) },
            {
                label: "길이",
                value: displayValue(answers.duration, "초"),
            },
            { label: "악기", value: displayValue(answers.instrument) },
            { label: "템포", value: displayValue(answers.tempo) },
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

    const hasData = useMemo(
        () => summary.some((item) => item.value && item.value !== "선택하지 않음"),
        [summary],
    );

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/12 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12">
                <header className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)] shadow-[0_10px_0_rgba(46,31,39,0.08)]">
                        ai result
                    </span>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)]">음악이 완성되었습니다</h1>
                    <p className="text-base text-[var(--text-muted)]">지금 바로 재생해보고, 원하는 이름과 보관 장소를 선택해보세요.</p>
                </header>

                <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-10 shadow-[0_25px_0_rgba(46,31,39,0.08)]">
                        <div className="flex flex-col items-center gap-8">
                            <button
                                type="button"
                                className="flex h-44 w-44 items-center justify-center rounded-full border-4 border-black/20 bg-[var(--accent-amber)] text-4xl font-bold text-[var(--text-primary)] shadow-[0_18px_0_rgba(46,31,39,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_0_rgba(46,31,39,0.16)]"
                            >
                                ▶
                            </button>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button variant="rainbow" className="px-6">
                                    음악 이름 짓기
                                </Button>
                                <Button variant="rainbow" className="px-6">
                                    내 보관함
                                </Button>
                                <Button variant="rainbow" className="px-6">
                                    2차 가공
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-white/85 p-10 shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">요청 요약</h2>
                        <div className="mt-6 space-y-4">
                            {summary.map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-[1.5rem] bg-[var(--bg-secondary)] px-5 py-4 text-[var(--text-primary)]">
                                    <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent-rose)]">{item.label}</span>
                                    <span className="text-base font-semibold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {!hasData && (
                    <div className="rounded-2xl border border-dashed border-[var(--accent-rose)] bg-[var(--accent-rose)]/10 px-6 py-4 text-center text-sm font-semibold text-[var(--accent-rose)]">
                        아직 입력된 정보가 없어요. 처음으로 돌아가서 허밍을 업로드하거나 질문에 답해보세요.
                    </div>
                )}

                {composeResponseJson && (
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-white/90 p-8 shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI 응답 미리보기</h2>
                        <pre className="mt-4 max-h-60 overflow-auto rounded-2xl bg-gray-900/90 p-5 text-sm text-gray-100">
                            {composeResponseJson}
                        </pre>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-4">
                    <Button toWhere="/" variant="rainbow" className="px-10" onClick={() => resetAnswers()}>
                        처음으로 돌아가기
                    </Button>
                    <Button variant="rainbow" className="px-10" onClick={() => window.location.reload()}>
                        다시 생성하기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MusicResultPage;

