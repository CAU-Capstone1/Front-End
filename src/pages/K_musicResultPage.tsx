import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { getAllAnswers, resetAnswers } from "../utils/compositionSession";
import { formatAnswerValue } from "../utils/valueLabels";
import { saveMusic, getAllSavedMusic, updateMusicName } from "../utils/musicStorage";
import { isLoggedIn } from "../utils/auth";
import { checkJobStatus } from "../api/checkJobStatus";
type SummaryItem = {
    label: string;
    value: string;
};
function MusicResultPage() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState<SummaryItem[]>([]);
    const [composeResponseJson, setComposeResponseJson] = useState<string | null>(null);
    const [showNameModal, setShowNameModal] = useState(false);
    const [musicName, setMusicName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [musicUrl, setMusicUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [isCheckingJob, setIsCheckingJob] = useState(false);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState<number | null>(null);
    const [savedMusicId, setSavedMusicId] = useState<string | null>(null);
    const [hasAutoSaved, setHasAutoSaved] = useState(false);
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
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
                autoScrollIntervalRef.current = null;
            }
        }
    }, []);
    const stopAutoScroll = useCallback(() => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    }, []);
    const startAutoScroll = useCallback(() => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
        if (!summaryScrollRef.current) return;
        const { scrollWidth, clientWidth } = summaryScrollRef.current;
        if (scrollWidth <= clientWidth) return; 
        autoScrollIntervalRef.current = setInterval(() => {
            if (!summaryScrollRef.current || isUserScrollingRef.current) return;
            const scrollElement = summaryScrollRef.current;
            const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
            if (scrollLeft >= scrollWidth - clientWidth - 1) {
                stopAutoScroll();
                return;
            }
            scrollElement.scrollLeft += 0.5;
            checkScrollButtons();
        }, 50); 
    }, [checkScrollButtons, stopAutoScroll]);
    useEffect(() => {
        checkScrollButtons();
        const scrollElement = summaryScrollRef.current;
        if (scrollElement) {
            let userScrollTimeout: ReturnType<typeof setTimeout> | null = null;
            const handleUserInteraction = () => {
                isUserScrollingRef.current = true;
                stopAutoScroll();
                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                }
                userScrollTimeout = setTimeout(() => {
                    isUserScrollingRef.current = false;
                    const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
                    if (scrollLeft < scrollWidth - clientWidth - 1) {
                        startAutoScroll();
                    }
                }, 1000);
            };
            scrollElement.addEventListener('scroll', checkScrollButtons);
            scrollElement.addEventListener('wheel', handleUserInteraction);
            scrollElement.addEventListener('touchstart', handleUserInteraction);
            scrollElement.addEventListener('mousedown', handleUserInteraction);
            window.addEventListener('resize', checkScrollButtons);
            const startTimeout = setTimeout(() => {
                const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
                if (scrollLeft < scrollWidth - clientWidth - 1) {
                    startAutoScroll();
                }
            }, 300);
            return () => {
                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                }
                clearTimeout(startTimeout);
                scrollElement.removeEventListener('scroll', checkScrollButtons);
                scrollElement.removeEventListener('wheel', handleUserInteraction);
                scrollElement.removeEventListener('touchstart', handleUserInteraction);
                scrollElement.removeEventListener('mousedown', handleUserInteraction);
                window.removeEventListener('resize', checkScrollButtons);
                stopAutoScroll();
            };
        }
    }, [checkScrollButtons, summary, startAutoScroll, stopAutoScroll]);
    const getDefaultMusicName = (): string => {
        if (!isLoggedIn()) return "음악 1";
        try {
            const savedMusics = getAllSavedMusic();
            const musicNumberPattern = /^음악\s+(\d+)$/;
            let maxNumber = 0;
            savedMusics.forEach((music) => {
                const match = music.name.match(musicNumberPattern);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) {
                        maxNumber = num;
                    }
                }
            });
            return `음악 ${maxNumber + 1}`;
        } catch {
            return "음악 1";
        }
    };
    const autoSaveMusic = useCallback((url: string, responseJson: string | null): string | null => {
        if (hasAutoSaved || !isLoggedIn() || !url) {
            return savedMusicId;
        }
        try {
            const answers = getAllAnswers();
            const defaultName = getDefaultMusicName();
            const savedMusic = saveMusic({
                name: defaultName,
                compositionData: {
                    style: answers.style,
                    mood: answers.mood,
                    instrument: answers.instrument,
                    key: answers.key,
                    duration: answers.duration,
                    tempo: answers.tempo,
                    hummingStart: answers.hummingStart,
                    hummingMain: answers.hummingMain,
                    hummingEnd: answers.hummingEnd,
                    referenceVisual: answers.referenceVisual,
                },
                composeResponse: responseJson,
            });
            setSavedMusicId(savedMusic.id);
            setMusicName(defaultName);
            setHasAutoSaved(true);
            console.log("✅ 음악이 자동으로 내 보관함에 저장되었습니다:", defaultName);
            return savedMusic.id;
        } catch (error) {
            console.warn("⚠️ 자동 저장 실패 (로그인 필요할 수 있음):", error);
            return null;
        }
    }, [hasAutoSaved, savedMusicId]);
    const checkJobStatusAndUpdate = useCallback(async (id: string) => {
        try {
            setIsCheckingJob(true);
            const status = await checkJobStatus(id);
            setJobStatus(status.status);
            setJobProgress(status.progress);
            if (status.musicUrl) {
                setMusicUrl(status.musicUrl);
                const currentResponse = sessionStorage.getItem("compose:lastResponse");
                if (currentResponse) {
                    try {
                        const parsed = JSON.parse(currentResponse);
                        const updated = { ...parsed, ...status };
                        setComposeResponseJson(JSON.stringify(updated, null, 2));
                        sessionStorage.setItem("compose:lastResponse", JSON.stringify(updated));
                    } catch (e) {
                        console.warn("Failed to update response", e);
                    }
                }
            }
        } catch (error) {
            console.error("❌ Job 상태 확인 실패:", error);
        } finally {
            setIsCheckingJob(false);
        }
    }, []);
    const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
    const [imageLoadError, setImageLoadError] = useState(false);
    useEffect(() => {
        const answers = getAllAnswers();
        const imageUrl = answers.referenceVisual;
        if (imageUrl) {
            const displayUrl = imageUrl.startsWith("data:") 
                ? `${imageUrl.substring(0, 50)}... (base64 이미지, ${(imageUrl.length / 1024).toFixed(1)}KB)`
                : imageUrl;
            console.log("📸 참고 이미지:", displayUrl);
            setReferenceImageUrl(imageUrl);
            setImageLoadError(false);
        } else {
            console.log("📸 참고 이미지: 없음");
        }
        const displayValue = (value: string | null | undefined, suffix?: string) => {
            const formatted = formatAnswerValue(value ?? null, suffix);
            return formatted === "-" ? "선택하지 않음" : formatted;
        };
        const items: SummaryItem[] = [
            { label: "시작 멜로디", value: displayValue(answers.hummingStart) },
            { label: "메인 멜로디", value: displayValue(answers.hummingMain) },
            { label: "끝 멜로디", value: displayValue(answers.hummingEnd) },
            { label: "장르", value: displayValue(answers.style) },
            { label: "무드", value: displayValue(answers.mood) },
            { label: "악기", value: displayValue(answers.instrument) },
            { label: "키", value: displayValue(answers.key) },
            { label: "빠르기", value: displayValue(answers.tempo) },
            {
                label: "길이",
                value: displayValue(answers.duration, "초"),
            },
        ];
        setSummary(items);
        const rawResponse = sessionStorage.getItem("compose:lastResponse");
        const storedJobId = sessionStorage.getItem("compose:jobId");
        if (storedJobId) {
            setJobId(storedJobId);
        }
        if (rawResponse) {
            try {
                const parsed = JSON.parse(rawResponse);
                setComposeResponseJson(JSON.stringify(parsed, null, 2));
                const parsedJobId = parsed.jobId || parsed.PublicJobId || parsed.id;
                if (parsedJobId && !storedJobId) {
                    setJobId(parsedJobId);
                    sessionStorage.setItem("compose:jobId", parsedJobId);
                }
                const url = parsed.musicUrl || parsed.audioUrl || parsed.fileUrl || parsed.url || parsed.audio_url || parsed.music_url;
                const status = parsed.status || parsed.Status;
                if (url) {
                    setMusicUrl(url);
                    autoSaveMusic(url, rawResponse);
                } else if (parsedJobId) {
                    if (status === "SUCCEEDED" || status === "succeeded") {
                        console.log("⚠️ Status가 SUCCEEDED인데 musicUrl이 없습니다. 상태를 다시 확인합니다.");
                        checkJobStatusAndUpdate(parsedJobId);
                    } else {
                        checkJobStatusAndUpdate(parsedJobId);
                    }
                }
            } catch (error) {
                console.warn("Failed to parse compose response", error);
            }
        }
    }, [autoSaveMusic, checkJobStatusAndUpdate]);
    const hasData = useMemo(
        () => summary.some((item) => item.value && item.value !== "선택하지 않음"),
        [summary],
    );
    const handleSaveToArchive = () => {
        if (!isLoggedIn()) {
            if (confirm("음악을 저장하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
                navigate("/login");
            }
            return;
        }
        if (savedMusicId) {
            setShowNameModal(true);
        } else if (musicUrl) {
            const rawResponse = sessionStorage.getItem("compose:lastResponse");
            const newSavedId = autoSaveMusic(musicUrl, rawResponse);
            if (newSavedId) {
                setShowNameModal(true);
            } else {
                setShowNameModal(true);
            }
        } else {
            setShowNameModal(true);
        }
    };
    const handleNameSubmit = () => {
        if (!musicName.trim()) {
            alert("음악 이름을 입력해주세요.");
            return;
        }
        setIsSaving(true);
        try {
            if (savedMusicId) {
                const success = updateMusicName(savedMusicId, musicName.trim());
                if (success) {
                    alert("음악 이름이 변경되었습니다!");
                    setShowNameModal(false);
                } else {
                    throw new Error("이름 변경 실패");
                }
            } else {
                const answers = getAllAnswers();
                const rawResponse = sessionStorage.getItem("compose:lastResponse");
                const savedMusic = saveMusic({
                    name: musicName.trim(),
                    compositionData: {
                        style: answers.style,
                        mood: answers.mood,
                        instrument: answers.instrument,
                        key: answers.key,
                        duration: answers.duration,
                        tempo: answers.tempo,
                        hummingStart: answers.hummingStart,
                        hummingMain: answers.hummingMain,
                        hummingEnd: answers.hummingEnd,
                        referenceVisual: answers.referenceVisual,
                    },
                    composeResponse: rawResponse,
                });
                setSavedMusicId(savedMusic.id);
                setHasAutoSaved(true);
                alert("음악이 보관함에 저장되었습니다!");
                setShowNameModal(false);
            }
        } catch (error) {
            console.error("저장/변경 실패:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };
    const handleNameCancel = () => {
        setShowNameModal(false);
        setMusicName("");
    };
    const handleCheckJobStatus = async () => {
        if (!jobId) return;
        await checkJobStatusAndUpdate(jobId);
    };
    const handlePlayPause = async () => {
        let urlToPlay = musicUrl;
        if (!urlToPlay && jobId) {
            try {
                setIsLoading(true);
                const status = await checkJobStatus(jobId);
                setJobStatus(status.status);
                setJobProgress(status.progress);
            if (status.musicUrl) {
                urlToPlay = status.musicUrl;
                setMusicUrl(status.musicUrl);
                const currentResponse = sessionStorage.getItem("compose:lastResponse");
                let updatedResponse = currentResponse;
                if (currentResponse) {
                    try {
                        const parsed = JSON.parse(currentResponse);
                        const updated = { ...parsed, ...status };
                        updatedResponse = JSON.stringify(updated, null, 2);
                        setComposeResponseJson(updatedResponse);
                        sessionStorage.setItem("compose:lastResponse", updatedResponse);
                    } catch (e) {
                        console.warn("Failed to update response", e);
                    }
                }
                autoSaveMusic(status.musicUrl, updatedResponse);
                } else {
                    alert(`음악이 아직 생성 중입니다. (상태: ${status.status}, 진행률: ${status.progress}%)\n잠시 후 다시 시도해주세요.`);
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error("❌ Job 상태 확인 실패:", error);
                alert("음악 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.");
                setIsLoading(false);
                return;
            }
        }
        if (!urlToPlay) {
            alert("재생할 음악이 없습니다.");
            return;
        }
        const currentAudio = audioRef.current;
        if (currentAudio && (isPlaying || !currentAudio.paused)) {
            currentAudio.pause();
            setIsPlaying(false);
            setIsLoading(false);
            return;
        }
        if (!audioRef.current || audioRef.current.src !== urlToPlay) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            audioRef.current = new Audio(urlToPlay);
            audioRef.current.addEventListener("play", () => {
                setIsPlaying(true);
                setIsLoading(false);
            });
            audioRef.current.addEventListener("pause", () => {
                setIsPlaying(false);
            });
            audioRef.current.addEventListener("ended", () => {
                setIsPlaying(false);
            });
            audioRef.current.addEventListener("error", (e) => {
                console.error("음악 재생 오류:", e);
                setIsPlaying(false);
                setIsLoading(false);
                alert("음악 재생 중 오류가 발생했습니다.");
            });
        }
        const audio = audioRef.current;
        try {
            if (audio) {
                setIsPlaying(true);
                setIsLoading(false);
                await audio.play();
            }
        } catch (error) {
            console.error("재생 실패:", error);
            setIsLoading(false);
            setIsPlaying(false);
            alert("음악 재생에 실패했습니다.");
        }
    };
    const handleDownload = async () => {
        if (!musicUrl) {
            alert("다운로드할 음악이 없습니다.");
            return;
        }
        try {
            try {
                const response = await fetch(musicUrl, {
                    method: 'GET',
                    mode: 'cors',
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const fileName = musicName.trim() 
                        ? `${musicName.trim()}.mp3` 
                        : `music-${Date.now()}.mp3`;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    return; 
                }
            } catch (fetchError) {
                console.log("Fetch 실패, 직접 링크 방식 사용:", fetchError);
            }
            const a = document.createElement("a");
            a.href = musicUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            const fileName = musicName.trim() 
                ? `${musicName.trim()}.mp3` 
                : `music-${Date.now()}.mp3`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => {
                window.open(musicUrl, '_blank');
            }, 100);
        } catch (error) {
            console.error("다운로드 실패:", error);
            window.open(musicUrl, '_blank');
            alert("브라우저에서 직접 다운로드해주세요. 새 창이 열렸습니다.");
        }
    };
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
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
                    {}
                    <div className="rounded-[2.5rem] border-2 border-black/10 bg-gradient-to-tr from-[#fffef9] via-white to-[#fff5f3] p-12 shadow-[0_20px_0_rgba(252,234,187,0.12)]">
                        <div className={`flex ${referenceImageUrl ? 'flex-row' : 'flex-col'} items-center gap-8`}>
                            {}
                            <div className={`flex flex-col items-center gap-6 ${referenceImageUrl ? 'flex-1' : 'w-full'}`}>
                                {}
                                <button 
                                    type="button" 
                                    className="play-button"
                                    onClick={handlePlayPause}
                                    disabled={!musicUrl}
                                >
                                    <span className="play-button-core">
                                        {isLoading ? (
                                            <svg viewBox="0 0 24 24" className="play-button-icon" style={{ animation: "spin 1s linear infinite" }}>
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                                            </svg>
                                        ) : isPlaying ? (
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
                                {}
                                <div className="flex gap-4 w-full max-w-md">
                                    <Button 
                                        variant="rainbow" 
                                        className="flex-1 py-4 text-base font-semibold hover:cursor-pointer"
                                        onClick={() => navigate("/myPage")}
                                    >
                                        내 보관함
                                    </Button>
                                    <Button 
                                        variant="rainbow" 
                                        className="flex-1 py-4 text-base font-semibold hover:cursor-pointer"
                                        onClick={handleSaveToArchive}
                                    >
                                        이름 짓기
                                    </Button>
                                </div>
                                {}
                                <Button 
                                    variant="rainbow" 
                                    className="w-full max-w-md py-4 text-base font-semibold hover:cursor-pointer flex items-center justify-center gap-2"
                                    onClick={handleDownload}
                                    disabled={!musicUrl}
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                        <path d="M12 15.5L7.5 11h3V3h3v8h3L12 15.5zM5 19h14v2H5v-2z" />
                                    </svg>
                                    다운로드
                                </Button>
                            </div>
                            {}
                            {referenceImageUrl && (
                                <div className="flex-shrink-0 w-96 h-full">
                                    <div className="relative h-full min-h-[400px] rounded-[2rem] border-4 border-black/10 bg-white/85 shadow-[0_16px_0_rgba(46,31,39,0.08)] overflow-hidden">
                                        {imageLoadError ? (
                                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                                <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">이미지를 불러올 수 없습니다</p>
                                                <p className="text-sm text-[var(--text-muted)] mb-4">URL: {referenceImageUrl.substring(0, 50)}...</p>
                                                <button 
                                                    onClick={() => {
                                                        setImageLoadError(false);
                                                        const img = new Image();
                                                        img.src = referenceImageUrl;
                                                    }}
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
                                                onError={(e) => {
                                                    const displayUrl = referenceImageUrl.startsWith("data:") 
                                                        ? `${referenceImageUrl.substring(0, 50)}...`
                                                        : referenceImageUrl;
                                                    console.error("❌ 이미지 로드 실패:", displayUrl);
                                                    console.error("❌ 에러 상세:", e);
                                                    setImageLoadError(true);
                                                }}
                                                onLoad={() => {
                                                    const displayUrl = referenceImageUrl.startsWith("data:") 
                                                        ? `base64 이미지 (${(referenceImageUrl.length / 1024).toFixed(1)}KB)`
                                                        : referenceImageUrl;
                                                    console.log("✅ 이미지 로드 성공:", displayUrl);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {}
                    <div className="relative py-6">
                        {}
                        <div className="mb-10 text-center">
                            <h2 className="text-4xl font-semibold text-[var(--text-primary)] mb-3 mt-15">작성한 정보</h2>
                            <p className="text-[18px] text-[var(--text-muted)]">선택하신 옵션들을 확인해보세요</p>
                        </div>
                        {}
                        {canScrollLeft && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (summaryScrollRef.current) {
                                        isUserScrollingRef.current = true;
                                        stopAutoScroll();
                                        summaryScrollRef.current.scrollBy({ left: -544, behavior: 'smooth' });
                                        setTimeout(() => {
                                            isUserScrollingRef.current = false;
                                            const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current!;
                                            if (scrollLeft < scrollWidth - clientWidth - 1) {
                                                startAutoScroll();
                                            }
                                        }, 3000);
                                    }
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
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <div className="flex gap-5 min-w-max px-4">
                                {summary.map((item) => (
                                    <div 
                                        key={item.label} 
                                        className="flex-shrink-0 w-72 flex flex-col rounded-[1.5rem] bg-gradient-to-br from-[#fffef9] via-[#fff6da] to-[#fef6dd] border border-black/10 p-8 shadow-[0_4px_12px_rgba(252,234,187,0.15)] hover:shadow-[0_6px_16px_rgba(252,234,187,0.2)] hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <div className="w-2 h-2 rounded-full bg-[var(--accent-amber)]"></div>
                                            <span className="text-[17px] font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">{item.label}</span>
                                        </div>
                                        <span className="text-base text-[var(--text-primary)] break-words leading-relaxed font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {}
                        {canScrollRight && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (summaryScrollRef.current) {
                                        isUserScrollingRef.current = true;
                                        stopAutoScroll();
                                        summaryScrollRef.current.scrollBy({ left: 544, behavior: 'smooth' });
                                        setTimeout(() => {
                                            isUserScrollingRef.current = false;
                                            const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current!;
                                            if (scrollLeft < scrollWidth - clientWidth - 1) {
                                                startAutoScroll();
                                            }
                                        }, 3000);
                                    }
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
                            <p className="text-sm text-[var(--text-muted)] mb-2">
                                현재 상태: <strong>{jobStatus}</strong>
                            </p>
                        )}
                        {jobProgress !== null && (
                            <p className="text-sm text-[var(--text-muted)] mb-4">
                                진행률: <strong>{jobProgress}%</strong>
                            </p>
                        )}
                        <Button
                            onClick={handleCheckJobStatus}
                            disabled={isCheckingJob}
                            variant="rainbow"
                            className="px-6 py-3"
                        >
                            {isCheckingJob ? "확인 중..." : "결과 확인하기"}
                        </Button>
                        <p className="text-xs text-[var(--text-muted)] mt-4">
                            💡 재생 버튼을 누르면 자동으로 상태를 확인하고 음악이 준비되면 재생됩니다.
                        </p>
                    </div>
                )}
                {}
                <div className="flex flex-wrap justify-center gap-6 mt-20 mb-8">
                    <Button toWhere="/" variant="rainbow" className="px-16 py-5 text-lg font-semibold" onClick={() => resetAnswers()}>
                        처음으로 돌아가기
                    </Button>
                    {}
                </div>
            </div>
            {}
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
                                if (e.key === "Enter") {
                                    handleNameSubmit();
                                } else if (e.key === "Escape") {
                                    handleNameCancel();
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={handleNameCancel}
                                disabled={isSaving}
                                className="px-6 py-3"
                            >
                                취소
                            </Button>
                            <Button
                                variant="rainbow"
                                onClick={handleNameSubmit}
                                disabled={isSaving || !musicName.trim()}
                                className="px-6 py-3"
                            >
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
