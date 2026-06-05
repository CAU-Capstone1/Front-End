import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { getAllAnswers, resetAnswers } from "../utils/compositionSession";
import { formatAnswerValue } from "../utils/valueLabels";
import { isLoggedIn } from "../utils/auth";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useJobPolling } from "../hooks/useJobPolling";
import { useMusicAutoSave } from "../hooks/useMusicAutoSave";
import { downloadMusicFile } from "../utils/downloadFile";

type SummaryItem = {
    label: string;
    value: string;
};

function MusicResultPage() {
    const navigate = useNavigate();

    // Page-level state
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [musicUrl, setMusicUrl] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Hooks
    const { isPlaying, toggle: toggleAudio } = useAudioPlayer();
    const { jobStatus, jobProgress, isChecking, check: checkJob } = useJobPolling();
    const { savedMusicId, musicName, setMusicName, autoSave, saveManually, rename } = useMusicAutoSave();

    // Auto-scroll
    const summaryScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isUserScrollingRef = useRef(false);

    const checkScrollButtons = useCallback(() => {
        if (!summaryScrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        const canScroll = scrollLeft < scrollWidth - clientWidth - 1;
        setCanScrollRight(canScroll);
        if (!canScroll && autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    }, []);

    const stopAutoScroll = useCallback(() => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    }, []);

    const startAutoScroll = useCallback(() => {
        stopAutoScroll();
        if (!summaryScrollRef.current) return;
        const { scrollWidth, clientWidth } = summaryScrollRef.current;
        if (scrollWidth <= clientWidth) return;

        autoScrollIntervalRef.current = setInterval(() => {
            if (!summaryScrollRef.current || isUserScrollingRef.current) return;
            const { scrollLeft, scrollWidth: sw, clientWidth: cw } = summaryScrollRef.current;
            if (scrollLeft >= sw - cw - 1) {
                stopAutoScroll();
                return;
            }
            summaryScrollRef.current.scrollLeft += 0.5;
            checkScrollButtons();
        }, 50);
    }, [checkScrollButtons, stopAutoScroll]);

    useEffect(() => {
        checkScrollButtons();
        const scrollElement = summaryScrollRef.current;
        if (!scrollElement) return;

        let userScrollTimeout: ReturnType<typeof setTimeout> | null = null;

        const handleUserInteraction = () => {
            isUserScrollingRef.current = true;
            stopAutoScroll();
            if (userScrollTimeout) clearTimeout(userScrollTimeout);
            userScrollTimeout = setTimeout(() => {
                isUserScrollingRef.current = false;
                const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
                if (scrollLeft < scrollWidth - clientWidth - 1) startAutoScroll();
            }, 1000);
        };

        scrollElement.addEventListener("scroll", checkScrollButtons);
        scrollElement.addEventListener("wheel", handleUserInteraction);
        scrollElement.addEventListener("touchstart", handleUserInteraction);
        scrollElement.addEventListener("mousedown", handleUserInteraction);
        window.addEventListener("resize", checkScrollButtons);

        const startTimeout = setTimeout(() => {
            const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
            if (scrollLeft < scrollWidth - clientWidth - 1) startAutoScroll();
        }, 300);

        return () => {
            if (userScrollTimeout) clearTimeout(userScrollTimeout);
            clearTimeout(startTimeout);
            scrollElement.removeEventListener("scroll", checkScrollButtons);
            scrollElement.removeEventListener("wheel", handleUserInteraction);
            scrollElement.removeEventListener("touchstart", handleUserInteraction);
            scrollElement.removeEventListener("mousedown", handleUserInteraction);
            window.removeEventListener("resize", checkScrollButtons);
            stopAutoScroll();
        };
    }, [checkScrollButtons, summary, startAutoScroll, stopAutoScroll]);

    // Initialise from sessionStorage on mount
    useEffect(() => {
        const answers = getAllAnswers();

        if (answers.referenceVisual) {
            setReferenceImageUrl(answers.referenceVisual);
            setImageLoadError(false);
        }

        const displayValue = (value: string | null | undefined, suffix?: string) => {
            const formatted = formatAnswerValue(value ?? null, suffix);
            return formatted === "-" ? "선택하지 않음" : formatted;
        };

        setSummary([
            { label: "시작 멜로디", value: displayValue(answers.hummingStart) },
            { label: "메인 멜로디", value: displayValue(answers.hummingMain) },
            { label: "끝 멜로디", value: displayValue(answers.hummingEnd) },
            { label: "장르", value: displayValue(answers.style) },
            { label: "무드", value: displayValue(answers.mood) },
            { label: "악기", value: displayValue(answers.instrument) },
            { label: "키", value: displayValue(answers.key) },
            { label: "빠르기", value: displayValue(answers.tempo) },
            { label: "길이", value: displayValue(answers.duration, "초") },
        ]);

        const rawResponse = sessionStorage.getItem("compose:lastResponse");
        const storedJobId = sessionStorage.getItem("compose:jobId");
        let currentJobId = storedJobId;

        if (rawResponse) {
            try {
                const parsed = JSON.parse(rawResponse) as Record<string, unknown>;
                const parsedJobId =
                    (parsed.jobId as string | undefined) ??
                    (parsed.PublicJobId as string | undefined) ??
                    (parsed.id as string | undefined);

                if (parsedJobId && !storedJobId) {
                    currentJobId = parsedJobId;
                    sessionStorage.setItem("compose:jobId", parsedJobId);
                }

                const url =
                    (parsed.musicUrl as string | undefined) ??
                    (parsed.audioUrl as string | undefined) ??
                    (parsed.fileUrl as string | undefined);

                if (url) {
                    setMusicUrl(url);
                    autoSave(url, rawResponse);
                } else if (currentJobId) {
                    void checkJob(currentJobId);
                }
            } catch { /* ignore parse errors */ }
        }

        if (currentJobId) setJobId(currentJobId);
    // autoSave and checkJob are stable (empty dep useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasData = useMemo(
        () => summary.some((item) => item.value && item.value !== "선택하지 않음"),
        [summary],
    );

    const updateResponseWithJobResult = (result: Record<string, unknown>) => {
        const currentResponse = sessionStorage.getItem("compose:lastResponse");
        if (!currentResponse) return null;
        try {
            const parsed = JSON.parse(currentResponse) as Record<string, unknown>;
            const updated = { ...parsed, ...result };
            const json = JSON.stringify(updated, null, 2);
            sessionStorage.setItem("compose:lastResponse", json);
            return json;
        } catch {
            return null;
        }
    };

    const handlePlayPause = async () => {
        let urlToPlay = musicUrl;

        if (!urlToPlay && jobId) {
            const result = await checkJob(jobId);
            if (result?.musicUrl) {
                urlToPlay = result.musicUrl;
                setMusicUrl(result.musicUrl);
                const updatedJson = updateResponseWithJobResult(result as Record<string, unknown>);
                autoSave(result.musicUrl, updatedJson);
            } else {
                alert(
                    `음악이 아직 생성 중입니다. (상태: ${jobStatus ?? "확인 중"}, 진행률: ${jobProgress ?? 0}%)\n잠시 후 다시 시도해주세요.`,
                );
                return;
            }
        }

        if (!urlToPlay) {
            alert("재생할 음악이 없습니다.");
            return;
        }

        try {
            await toggleAudio(urlToPlay);
        } catch {
            alert("음악 재생에 실패했습니다.");
        }
    };

    const handleCheckJobStatus = async () => {
        if (!jobId) return;
        const result = await checkJob(jobId);
        if (result?.musicUrl) {
            setMusicUrl(result.musicUrl);
            const updatedJson = updateResponseWithJobResult(result as Record<string, unknown>);
            autoSave(result.musicUrl, updatedJson);
        }
    };

    const handleDownload = async () => {
        if (!musicUrl) {
            alert("다운로드할 음악이 없습니다.");
            return;
        }
        await downloadMusicFile(musicUrl, musicName.trim() || `music-${Date.now()}`);
    };

    const handleSaveToArchive = () => {
        if (!isLoggedIn()) {
            if (confirm("음악을 저장하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                navigate("/login");
            }
            return;
        }
        if (!savedMusicId && musicUrl) {
            autoSave(musicUrl, sessionStorage.getItem("compose:lastResponse"));
        }
        setShowNameModal(true);
    };

    const handleNameSubmit = () => {
        if (!musicName.trim()) {
            alert("음악 이름을 입력해주세요.");
            return;
        }
        setIsSaving(true);
        try {
            if (savedMusicId) {
                if (!rename(savedMusicId, musicName.trim())) throw new Error();
                alert("음악 이름이 변경되었습니다!");
            } else {
                const id = saveManually(musicName.trim(), sessionStorage.getItem("compose:lastResponse"));
                if (!id) throw new Error();
                alert("음악이 보관함에 저장되었습니다!");
            }
            setShowNameModal(false);
        } catch {
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 pt-16 pb-20 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[var(--accent-rose)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/12 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col">
                <header className="text-center space-y-4 pt-8">
                    <span className="inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-2.5 mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-rose)] shadow-[0_8px_0_rgba(242,137,130,0.15)]">
                        Completed
                    </span>
                    <h1 className="text-[2.8rem] font-semibold leading-tight text-[var(--text-primary)]">음악이 완성되었어요</h1>
                    <p className="text-[18px] text-[var(--text-muted)] font-medium mb-12">지금 바로 재생해보고, 원하는 이름과 보관 장소를 선택해보세요.</p>
                </header>

                <section className="flex flex-col gap-14">
                    {/* 재생 + 액션 버튼 */}
                    <div className="rounded-[2.5rem] border-2 border-black/10 bg-gradient-to-tr from-[#fffef9] via-white to-[#fff5f3] p-12 shadow-[0_20px_0_rgba(252,234,187,0.12)]">
                        <div className={`flex ${referenceImageUrl ? "flex-row" : "flex-col"} items-center gap-8`}>
                            <div className={`flex flex-col items-center gap-6 ${referenceImageUrl ? "flex-1" : "w-full"}`}>
                                <button
                                    type="button"
                                    className="play-button"
                                    onClick={() => void handlePlayPause()}
                                    disabled={!musicUrl && !jobId}
                                >
                                    <span className="play-button-core">
                                        {isPlaying ? (
                                            <svg viewBox="0 0 24 24" className="play-button-icon">
                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" className="play-button-icon">
                                                <path d="M8 5.5v13l10-6.5z" />
                                            </svg>
                                        )}
                                    </span>
                                </button>

                                <div className="flex gap-4 w-full max-w-md">
                                    <Button variant="rainbow" className="flex-1 py-4 text-base font-semibold hover:cursor-pointer" onClick={() => navigate("/myPage")}>
                                        내 보관함
                                    </Button>
                                    <Button variant="rainbow" className="flex-1 py-4 text-base font-semibold hover:cursor-pointer" onClick={handleSaveToArchive}>
                                        이름 짓기
                                    </Button>
                                </div>

                                <Button
                                    variant="rainbow"
                                    className="w-full max-w-md py-4 text-base font-semibold hover:cursor-pointer flex items-center justify-center gap-2"
                                    onClick={() => void handleDownload()}
                                    disabled={!musicUrl}
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                        <path d="M12 15.5L7.5 11h3V3h3v8h3L12 15.5zM5 19h14v2H5v-2z" />
                                    </svg>
                                    다운로드
                                </Button>
                            </div>

                            {referenceImageUrl && (
                                <div className="flex-shrink-0 w-96 h-full">
                                    <div className="relative h-full min-h-[400px] rounded-[2rem] border-4 border-black/10 bg-white/85 shadow-[0_16px_0_rgba(46,31,39,0.08)] overflow-hidden">
                                        {imageLoadError ? (
                                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                                <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">이미지를 불러올 수 없습니다</p>
                                                <button
                                                    onClick={() => setImageLoadError(false)}
                                                    className="px-4 py-2 bg-[var(--accent-rose)] text-white rounded-lg hover:opacity-90"
                                                >
                                                    다시 시도
                                                </button>
                                            </div>
                                        ) : (
                                            <img
                                                src={referenceImageUrl}
                                                alt="참고 이미지"
                                                className="w-full h-full object-cover"
                                                onError={() => setImageLoadError(true)}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 요약 카드 가로 스크롤 */}
                    <div className="relative py-6">
                        <div className="mb-10 text-center">
                            <h2 className="text-4xl font-semibold text-[var(--text-primary)] mb-3 mt-15">작성한 정보</h2>
                            <p className="text-[18px] text-[var(--text-muted)]">선택하신 옵션들을 확인해보세요</p>
                        </div>

                        {canScrollLeft && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!summaryScrollRef.current) return;
                                    isUserScrollingRef.current = true;
                                    stopAutoScroll();
                                    summaryScrollRef.current.scrollBy({ left: -544, behavior: "smooth" });
                                    setTimeout(() => {
                                        isUserScrollingRef.current = false;
                                        const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current!;
                                        if (scrollLeft < scrollWidth - clientWidth - 1) startAutoScroll();
                                    }, 3000);
                                }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[var(--text-primary)]">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                        )}

                        <div
                            ref={summaryScrollRef}
                            className="overflow-x-auto pb-4 scrollbar-hide"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            <div className="flex gap-5 min-w-max px-4">
                                {summary.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex-shrink-0 w-72 flex flex-col rounded-[1.5rem] bg-gradient-to-br from-[#fffef9] via-[#fff6da] to-[#fef6dd] border border-black/10 p-8 shadow-[0_4px_12px_rgba(252,234,187,0.15)] hover:shadow-[0_6px_16px_rgba(252,234,187,0.2)] hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <div className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />
                                            <span className="text-[17px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">{item.label}</span>
                                        </div>
                                        <span className="text-base text-[var(--text-primary)] break-words leading-relaxed font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {canScrollRight && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!summaryScrollRef.current) return;
                                    isUserScrollingRef.current = true;
                                    stopAutoScroll();
                                    summaryScrollRef.current.scrollBy({ left: 544, behavior: "smooth" });
                                    setTimeout(() => {
                                        isUserScrollingRef.current = false;
                                        const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current!;
                                        if (scrollLeft < scrollWidth - clientWidth - 1) startAutoScroll();
                                    }, 3000);
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[var(--text-primary)]">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </section>

                {!hasData && (
                    <div className="rounded-[2rem] border-2 border-dashed border-[var(--accent-rose)]/40 bg-gradient-to-br from-[#fff6da]/50 via-white/50 to-[#fce4ef]/50 px-8 py-6 text-center shadow-[0_8px_24px_rgba(242,137,130,0.1)] backdrop-blur-sm mt-8">
                        <p className="text-base font-semibold text-[var(--accent-rose)] mb-2">아직 입력된 정보가 없어요</p>
                        <p className="text-sm text-[var(--text-muted)]">처음으로 돌아가서 허밍을 업로드하거나 질문에 답해보세요.</p>
                    </div>
                )}

                {jobId && !musicUrl && (
                    <div className="rounded-[2.5rem] border-2 border-black/10 bg-gradient-to-br from-yellow-50/90 via-white/90 to-amber-50/90 p-10 shadow-[0_20px_0_rgba(252,234,187,0.12)] mt-8">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">음악 생성 중</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Job ID: <code className="bg-white/50 px-2 py-1 rounded">{jobId}</code>
                        </p>
                        {jobStatus && (
                            <p className="text-sm text-[var(--text-muted)] mb-2">현재 상태: <strong>{jobStatus}</strong></p>
                        )}
                        {jobProgress !== null && (
                            <p className="text-sm text-[var(--text-muted)] mb-4">진행률: <strong>{jobProgress}%</strong></p>
                        )}
                        <Button onClick={() => void handleCheckJobStatus()} disabled={isChecking} variant="rainbow" className="px-6 py-3">
                            {isChecking ? "확인 중..." : "결과 확인하기"}
                        </Button>
                        <p className="text-xs text-[var(--text-muted)] mt-4">
                            재생 버튼을 누르면 자동으로 상태를 확인하고 음악이 준비되면 재생됩니다.
                        </p>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-6 mt-20 mb-8">
                    <Button toWhere="/" variant="rainbow" className="px-16 py-5 text-lg font-semibold" onClick={() => resetAnswers()}>
                        처음으로 돌아가기
                    </Button>
                </div>
            </div>

            {showNameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-md rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-8 shadow-[0_25px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                            {savedMusicId ? "음악 이름 변경" : "음악 이름을 지어주세요"}
                        </h2>
                        <input
                            type="text"
                            value={musicName}
                            onChange={(e) => setMusicName(e.target.value)}
                            placeholder="예: 윤수현 생일 노래"
                            className="retro-input w-full mb-6"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleNameSubmit();
                                else if (e.key === "Escape") { setShowNameModal(false); setMusicName(""); }
                            }}
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => { setShowNameModal(false); setMusicName(""); }} disabled={isSaving} className="px-6 py-3">
                                취소
                            </Button>
                            <Button variant="rainbow" onClick={handleNameSubmit} disabled={isSaving || !musicName.trim()} className="px-6 py-3">
                                {isSaving ? "저장 중..." : "저장하기"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MusicResultPage;
