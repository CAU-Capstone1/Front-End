import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { buildCompositionBody, createComposition } from "../api/createComposition";
import { getAllAnswers } from "../utils/compositionSession";
import { formatAnswerValue } from "../utils/valueLabels";
import type { CompositionAnswerKey } from "../utils/compositionSession";

type ReviewItem = {
    key: CompositionAnswerKey;
    label: string;
    value: string;
    rawValue: string | null | undefined;
    route: string;
};

const REVIEW_ITEMS: Array<Omit<ReviewItem, "value" | "rawValue">> = [
    { key: "hummingPath", label: "허밍 파일", route: "/" },
    { key: "style", label: "장르", route: "/what1" },
    { key: "mood", label: "무드", route: "/what2" },
    { key: "key", label: "키", route: "/key" },
    { key: "duration", label: "길이", route: "/length" },
    { key: "instrument", label: "악기", route: "/instrument" },
    { key: "tempo", label: "템포", route: "/tempo" },
];

function buildHighlightText(answers: Record<string, string | null | undefined>) {
    const parts: string[] = [];

    if (answers.mood) parts.push(`${formatAnswerValue(answers.mood)} 분위기`);
    if (answers.instrument) parts.push(formatAnswerValue(answers.instrument));
    if (answers.tempo) parts.push(formatAnswerValue(answers.tempo));
    if (answers.key) parts.push(`${formatAnswerValue(answers.key)} 키`);
    if (answers.duration) parts.push(`${answers.duration}초 길이`);
    if (answers.style) parts.push(`${formatAnswerValue(answers.style)} 스타일`);

    return parts.length ? parts.join(", ") : "선택된 정보가 없어요.";
}

function ReviewPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<ReviewItem[]>([]);
    const [highlightText, setHighlightText] = useState<string>("선택된 정보가 없어요.");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const answers = getAllAnswers();
        const nextItems: ReviewItem[] = REVIEW_ITEMS.map((item) => {
            const rawValue = answers[item.key];
            const formatted = item.key === "duration"
                ? formatAnswerValue(rawValue ?? null, "초")
                : formatAnswerValue(rawValue ?? null);
            const value = formatted === "-" ? "선택하지 않음" : formatted;
            return { ...item, rawValue, value };
        });
        setItems(nextItems);
        setHighlightText(buildHighlightText(answers));
    }, []);

    const hasAnySelection = useMemo(() => items.some((item) => item.value !== "선택하지 않음"), [items]);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        const answers = getAllAnswers();

        try {
            const result = await createComposition(buildCompositionBody(answers));
            sessionStorage.setItem("compose:lastResponse", JSON.stringify(result));
            navigate("/musicResult");
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-[var(--accent-rose)]/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-48 h-72 w-72 rounded-[45%] bg-[var(--accent-rose)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-[var(--accent-amber)]/18 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
                <header className="text-center space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)] shadow-[0_10px_0_rgba(46,31,39,0.08)]">
                        review
                    </span>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)]">
                        현재 설정을 한번 더 확인해요
                    </h1>
                    <p className="text-base text-[var(--text-muted)]">필요한 부분을 수정한 뒤 그대로 음악 생성을 진행할 수 있어요.</p>
                </header>

                <div className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-r from-[var(--bg-secondary)] via-white to-[#fce4ef] px-8 py-12 text-center text-2xl font-semibold text-[var(--text-primary)] shadow-[0_25px_0_rgba(46,31,39,0.08)] sm:px-12">
                    {highlightText}
                </div>

                <section className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border-4 border-black/10 bg-white/85 px-6 py-6 shadow-[0_16px_0_rgba(46,31,39,0.08)]"
                        >
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--accent-rose)]">{item.label}</p>
                                <p
                                    className={`text-lg font-semibold ${
                                        item.value === "선택하지 않음"
                                            ? "text-[var(--accent-amber)]"
                                            : "text-[var(--text-primary)]"
                                    }`}
                                >
                                    {item.value}
                                </p>
                            </div>
                            <Button variant="ghost" className="px-4" onClick={() => navigate(item.route)}>
                                수정하기
                            </Button>
                        </div>
                    ))}
                </section>

                {!hasAnySelection && (
                    <p className="rounded-2xl border border-dashed border-[var(--accent-rose)] bg-[var(--accent-rose)]/10 px-6 py-4 text-center text-sm font-semibold text-[var(--accent-rose)]">
                        아직 선택된 정보가 없어요. 이전 단계에서 원하는 요소를 선택해보세요.
                    </p>
                )}

                {error && (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-center text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap justify-center gap-4">
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="px-12 py-4 text-lg"
                    >
                        {isSubmitting ? "음악 생성 중..." : "그대로 만들기"}
                    </Button>
                    <Button variant="ghost" className="px-12 py-4 text-lg" onClick={() => navigate(-1)}>
                        뒤로 가기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ReviewPage;

