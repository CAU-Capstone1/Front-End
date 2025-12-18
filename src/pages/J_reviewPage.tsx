import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { buildCompositionBody, createComposition } from "../api/createComposition";
import { getAllAnswers } from "../utils/compositionSession";
import { formatAnswerValue } from "../utils/valueLabels";
import type { CompositionAnswerKey } from "../utils/compositionSession";
import MusicGeneratingLoader from "../components/MusicGeneratingLoader";
import { pollJobUntilComplete, type JobStatusResponse } from "../api/checkJobStatus";

type ReviewItem = {
    key: CompositionAnswerKey;
    label: string;
    value: string;
    rawValue: string | null | undefined;
    route: string;
    helper?: string;
};

// 키 옵션 정보 (키 페이지와 동일)
const KEY_GROUPS = [
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

// 템포 옵션 정보 (템포 페이지와 동일)
const TEMPO_OPTIONS = [
    { label: "아주 빠르게", value: "very-fast", helper: "에너지 넘치는 160BPM 이상" },
    { label: "빠르게", value: "fast", helper: "활기찬 130~150BPM" },
    { label: "보통", value: "medium", helper: "익숙하고 편안한 110~120BPM" },
    { label: "느리게", value: "slow", helper: "잔잔한 80~100BPM" },
    { label: "아주 느리게", value: "very-slow", helper: "감성적인 60BPM 이하" },
];

const REVIEW_ITEMS: Array<Omit<ReviewItem, "value" | "rawValue" | "helper">> = [
    { key: "hummingStart", label: "시작 멜로디", route: "/" },
    { key: "hummingMain", label: "메인 멜로디", route: "/" },
    { key: "hummingEnd", label: "끝 멜로디", route: "/" },
    { key: "referenceVisual", label: "참고 이미지", route: "/visual" },
    { key: "style", label: "장르", route: "/what1" },
    { key: "mood", label: "무드", route: "/what2" },
    { key: "instrument", label: "악기", route: "/instrument" },
    { key: "key", label: "키", route: "/key" },
    { key: "duration", label: "길이", route: "/length" },
    { key: "tempo", label: "템포", route: "/tempo" },
];

function buildHighlightText(answers: Record<string, string | null | undefined>) {
    const parts: string[] = [];

    if (answers.hummingStart) parts.push("시작 멜로디 업로드 완료");
    if (answers.hummingMain) parts.push("메인 멜로디 업로드 완료");
    if (answers.hummingEnd) parts.push("끝 멜로디 업로드 완료");
    if (answers.referenceVisual) parts.push("참고 이미지 첨부");
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
            let formatted = item.key === "duration"
                ? formatAnswerValue(rawValue ?? null, "초")
                : formatAnswerValue(rawValue ?? null);
            
            // 참고 이미지가 base64인 경우 짧게 표시
            if (item.key === "referenceVisual" && rawValue && rawValue.startsWith("data:")) {
                formatted = "이미지 업로드 완료";
            }
            
            const value = formatted === "-" ? "선택하지 않음" : formatted;
            
            // 키 또는 템포인 경우 helper 텍스트 찾기
            let helper: string | undefined;
            if (item.key === "key" && rawValue) {
                for (const group of KEY_GROUPS) {
                    const option = group.options.find(opt => opt.value === rawValue);
                    if (option) {
                        helper = option.helper;
                        break;
                    }
                }
            } else if (item.key === "tempo" && rawValue) {
                const option = TEMPO_OPTIONS.find(opt => opt.value === rawValue);
                if (option) {
                    helper = option.helper;
                }
            }
            
            return { ...item, rawValue, value, helper };
        });
        setItems(nextItems);
        setHighlightText(buildHighlightText(answers));
    }, []);

    const hasAnySelection = useMemo(() => items.some((item) => item.value !== "선택하지 않음"), [items]);

    // 로딩 화면 표시
    if (isSubmitting) {
        return <MusicGeneratingLoader />;
    }

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        const answers = getAllAnswers();
        const requestBody = buildCompositionBody(answers);

        console.log("🎵 음악 생성 요청 시작");
        console.log("📋 저장된 답변들:", answers);
        console.log("📦 요청 본문:", requestBody);

        try {
            const result = await createComposition(requestBody);
            console.log("✅ 작곡 요청 응답:", result);

            // Job ID가 있는지 확인 (비동기 작업, 백엔드 DTO의 jobId 필드를 우선 확인)
            const jobId = result.jobId || result.PublicJobId || result.id;
            
            if (jobId) {
                console.log("🔄 Job ID 발견, 상태 확인 시작:", jobId);
                
                try {
                    // Job 완료까지 폴링
                    const finalResult = await pollJobUntilComplete(jobId, {
                        intervalMs: 3000, // 3초마다 확인
                        maxAttempts: 100, // 최대 5분
                        onStatusUpdate: (status: JobStatusResponse) => {
                            console.log("📊 Job 상태 업데이트:", status);
                        },
                    });

                    console.log("✅ 음악 생성 완료:", finalResult);
                    sessionStorage.setItem("compose:lastResponse", JSON.stringify(finalResult));
                    navigate("/musicResult");
                } catch (pollError) {
                    // 폴링 실패 시, 초기 응답을 저장하고 결과 페이지로 이동
                    console.warn("⚠️ Job 상태 확인 실패, 초기 응답 사용:", pollError);
                    console.log("📝 초기 응답 저장:", result);
                    sessionStorage.setItem("compose:lastResponse", JSON.stringify(result));
                    sessionStorage.setItem("compose:jobId", jobId);
                    // 결과 페이지로 이동 (결과 페이지에서 수동으로 확인할 수 있도록)
                    navigate("/musicResult");
                }
            } else {
                // 즉시 완료된 경우
                console.log("✅ 음악 생성 즉시 완료:", result);
                sessionStorage.setItem("compose:lastResponse", JSON.stringify(result));
                navigate("/musicResult");
            }
        } catch (err) {
            console.error("❌ 음악 생성 실패:", err);
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
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)] shadow-[0_10px_0_rgba(46,31,39,0.08)] mb-10">
                        review
                    </span>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)] mb-2">
                        이대로 음악을 만들어볼까요?
                    </h1>
                    <p className="text-base text-[var(--text-muted)] mb-3">필요한 부분을 수정한 뒤 그대로 음악 생성을 진행할 수 있어요.</p>
                </header>

                <div className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-r from-[var(--bg-secondary)] via-white to-[#fce4ef] px-8 py-12 text-center text-2xl font-semibold text-[var(--text-primary)] shadow-[0_25px_0_rgba(46,31,39,0.08)] sm:px-12">
                    {highlightText}
                </div>

                <section className="grid gap-5 md:grid-cols-2">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="flex h-full flex-col justify-between gap-4 rounded-[2rem] border-4 border-black/10 bg-white/85 px-6 py-6 shadow-[0_16px_0_rgba(46,31,39,0.08)]"
                        >
                            <div>
                                <p className="text-2xl font-semibold uppercase tracking-[0.25em] text-[#d4577a] mb-2">{item.label}</p>
                                <p
                                    className={`text-lg font-semibold break-words overflow-hidden ${
                                        item.value === "선택하지 않음"
                                            ? "text-[#e3bebe]"
                                            : "text-[#2e1f27]"
                                    }`}
                                >
                                    {item.value}
                                </p>
                                {item.helper && (
                                    <p className="text-sm text-[var(--text-muted)] mt-2">
                                        {item.helper}
                                    </p>
                                )}
                            </div>
                            <Button variant="outline" className="self-end px-4 !text-[rgb(230,173,52)]" onClick={() => navigate(`${item.route}?from=review`)}>
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
                        variant="rainbow"
                        className="px-16 py-5 text-lg mt-10"
                    >
                        {isSubmitting ? "음악 생성 중..." : "음악 생성하기"}
                    </Button>
                </div>
                    <div className="flex flex-wrap justify-center py-10"/>
            </div>
        </div>
    );
}

export default ReviewPage;

