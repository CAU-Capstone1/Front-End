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
    
    // 음악 재생 관련 상태
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [musicUrl, setMusicUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Job 상태 확인 관련
    const [jobId, setJobId] = useState<string | null>(null);
    const [isCheckingJob, setIsCheckingJob] = useState(false);
    const [jobStatus, setJobStatus] = useState<string | null>(null);
    const [jobProgress, setJobProgress] = useState<number | null>(null);
    
    // 자동 저장 관련
    const [savedMusicId, setSavedMusicId] = useState<string | null>(null);
    const [hasAutoSaved, setHasAutoSaved] = useState(false);
    
    // 요약 카드 스크롤 관련
    const summaryScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isUserScrollingRef = useRef(false);
    
    // 스크롤 가능 여부 확인
    const checkScrollButtons = useCallback(() => {
        if (!summaryScrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        const canScroll = scrollLeft < scrollWidth - clientWidth - 1;
        setCanScrollRight(canScroll);
        
        // 오른쪽 화살표가 사라지면 자동 스크롤 중지
        if (!canScroll && autoScrollIntervalRef.current) {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
                autoScrollIntervalRef.current = null;
            }
        }
    }, []);
    
    // 자동 스크롤 중지
    const stopAutoScroll = useCallback(() => {
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
    }, []);
    
    // 자동 스크롤 시작
    const startAutoScroll = useCallback(() => {
        // 이미 실행 중이면 중지
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
        }
        
        // 스크롤이 필요한지 확인
        if (!summaryScrollRef.current) return;
        const { scrollWidth, clientWidth } = summaryScrollRef.current;
        if (scrollWidth <= clientWidth) return; // 스크롤이 필요 없으면 시작하지 않음
        
        autoScrollIntervalRef.current = setInterval(() => {
            if (!summaryScrollRef.current || isUserScrollingRef.current) return;
            
            // 오른쪽 화살표가 사라졌는지 확인
            const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current;
            if (scrollLeft >= scrollWidth - clientWidth - 1) {
                stopAutoScroll();
                return;
            }
            
            // 천천히 오른쪽으로 스크롤 (느리게)
            summaryScrollRef.current.scrollBy({ left: 0.2, behavior: 'auto' });
            
            checkScrollButtons();
        }, 50); // 50ms마다 실행 (느린 애니메이션)
    }, [checkScrollButtons, stopAutoScroll]);
    
    useEffect(() => {
        checkScrollButtons();
        const scrollElement = summaryScrollRef.current;
        if (scrollElement) {
            let userScrollTimeout: ReturnType<typeof setTimeout> | null = null;
            
            // 사용자 상호작용 감지
            const handleUserInteraction = () => {
                isUserScrollingRef.current = true;
                stopAutoScroll();
                
                // 기존 타임아웃 취소
                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                }
                
                // 3초 후 자동 스크롤 재개 (오른쪽 화살표가 있으면만)
                userScrollTimeout = setTimeout(() => {
                    isUserScrollingRef.current = false;
                    const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
                    if (scrollLeft < scrollWidth - clientWidth - 1) {
                        startAutoScroll();
                    }
                }, 3000);
            };
            
            scrollElement.addEventListener('scroll', checkScrollButtons);
            scrollElement.addEventListener('wheel', handleUserInteraction);
            scrollElement.addEventListener('touchstart', handleUserInteraction);
            scrollElement.addEventListener('mousedown', handleUserInteraction);
            window.addEventListener('resize', checkScrollButtons);
            
            // 약간의 지연 후 자동 스크롤 시작 (DOM이 완전히 렌더링된 후)
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

    // 기본 음악 이름 생성 (저장된 음악 개수 기반)
    const getDefaultMusicName = (): string => {
        if (!isLoggedIn()) return "음악 1";
        
        try {
            const savedMusics = getAllSavedMusic();
            const count = savedMusics.length;
            return `음악 ${count + 1}`;
        } catch {
            return "음악 1";
        }
    };

    // 음악 자동 저장 함수
    const autoSaveMusic = useCallback((url: string, responseJson: string | null): string | null => {
        // 이미 저장했거나 로그인하지 않았으면 저장하지 않음
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

    // Job 상태 확인 및 업데이트
    const checkJobStatusAndUpdate = useCallback(async (id: string) => {
        try {
            setIsCheckingJob(true);
            const status = await checkJobStatus(id);
            
            setJobStatus(status.status);
            setJobProgress(status.progress);
            
            // musicUrl이 있으면 업데이트
            if (status.musicUrl) {
                setMusicUrl(status.musicUrl);
                // 응답 업데이트
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
            { label: "참고 이미지", value: displayValue(answers.referenceVisual) },
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
                
                // Job ID 추출 (백엔드 DTO의 jobId 필드를 우선 확인)
                const parsedJobId = parsed.jobId || parsed.PublicJobId || parsed.id;
                if (parsedJobId && !storedJobId) {
                    setJobId(parsedJobId);
                    sessionStorage.setItem("compose:jobId", parsedJobId);
                }
                
                // 음악 파일 URL 추출 (백엔드 DTO의 musicUrl 필드를 우선 확인)
                const url = parsed.musicUrl || parsed.audioUrl || parsed.fileUrl || parsed.url || parsed.audio_url || parsed.music_url;
                const status = parsed.status || parsed.Status;
                
                if (url) {
                    setMusicUrl(url);
                    // 음악이 완성되었으므로 자동 저장 시도
                    autoSaveMusic(url, rawResponse);
                } else if (parsedJobId) {
                    // jobId는 있지만 musicUrl이 없는 경우
                    // status가 SUCCEEDED인데 musicUrl이 없으면 즉시 상태 확인 (musicUrl이 아직 업데이트되지 않았을 수 있음)
                    if (status === "SUCCEEDED" || status === "succeeded") {
                        // SUCCEEDED 상태인데 musicUrl이 없으면 즉시 상태 확인
                        console.log("⚠️ Status가 SUCCEEDED인데 musicUrl이 없습니다. 상태를 다시 확인합니다.");
                        checkJobStatusAndUpdate(parsedJobId);
                    } else {
                        // 아직 처리 중이면 상태 확인
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
        
        // 이미 저장된 음악이 있으면 이름 변경 모달, 없으면 저장 모달
        if (savedMusicId) {
            setShowNameModal(true);
        } else if (musicUrl) {
            // 아직 저장되지 않았으면 자동 저장 시도
            const rawResponse = sessionStorage.getItem("compose:lastResponse");
            const newSavedId = autoSaveMusic(musicUrl, rawResponse);
            if (newSavedId) {
                setShowNameModal(true);
            } else {
                // 저장 실패 시에도 모달 표시 (수동 저장)
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
            // 이미 저장된 음악이 있으면 이름만 업데이트
            if (savedMusicId) {
                const success = updateMusicName(savedMusicId, musicName.trim());
                if (success) {
                    alert("음악 이름이 변경되었습니다!");
                    setShowNameModal(false);
                    // 마이페이지로 이동하지 않고 현재 페이지에 머무름
                } else {
                    throw new Error("이름 변경 실패");
                }
            } else {
                // 아직 저장되지 않았으면 새로 저장
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

    // Job 상태 수동 확인
    const handleCheckJobStatus = async () => {
        if (!jobId) return;
        await checkJobStatusAndUpdate(jobId);
    };

    // 음악 재생/일시정지 처리
    const handlePlayPause = async () => {
        let urlToPlay = musicUrl;
        
        // musicUrl이 없고 jobId가 있으면 상태 확인 시도
        if (!urlToPlay && jobId) {
            try {
                setIsLoading(true);
                const status = await checkJobStatus(jobId);
                
                setJobStatus(status.status);
                setJobProgress(status.progress);
                
            // musicUrl이 있으면 업데이트하고 재생
            if (status.musicUrl) {
                urlToPlay = status.musicUrl;
                setMusicUrl(status.musicUrl);
                // 응답 업데이트
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
                // 음악이 완성되었으므로 자동 저장 시도
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

        // Audio 객체가 없거나 URL이 변경되었으면 새로 생성
        if (!audioRef.current || audioRef.current.src !== urlToPlay) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(urlToPlay);
            
            // 재생 이벤트 리스너
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
            
            audioRef.current.addEventListener("loadstart", () => {
                setIsLoading(true);
            });
        }

        const audio = audioRef.current;

        try {
            if (isPlaying) {
                // 일시정지
                audio.pause();
            } else {
                // 재생
                await audio.play();
            }
        } catch (error) {
            console.error("재생 실패:", error);
            setIsLoading(false);
            alert("음악 재생에 실패했습니다.");
        }
    };

    // 음악 다운로드 처리 (S3 URL 직접 다운로드)
    const handleDownload = async () => {
        if (!musicUrl) {
            alert("다운로드할 음악이 없습니다.");
            return;
        }

        try {
            // 먼저 fetch로 시도 (CORS가 허용된 경우)
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
                    
                    // 파일명 생성 (음악 이름이 있으면 사용, 없으면 기본값)
                    const fileName = musicName.trim() 
                        ? `${musicName.trim()}.mp3` 
                        : `music-${Date.now()}.mp3`;
                    a.download = fileName;
                    
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    return; // 성공하면 여기서 종료
                }
            } catch (fetchError) {
                // CORS 오류 등으로 fetch 실패 시 직접 링크 방식 사용
                console.log("Fetch 실패, 직접 링크 방식 사용:", fetchError);
            }
            
            // CORS 문제로 fetch가 실패한 경우, 직접 링크로 다운로드 시도
            // S3 URL에 직접 접근하여 다운로드 (브라우저가 자동으로 다운로드 처리)
            const a = document.createElement("a");
            a.href = musicUrl;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            
            // 파일명 생성 (음악 이름이 있으면 사용, 없으면 기본값)
            const fileName = musicName.trim() 
                ? `${musicName.trim()}.mp3` 
                : `music-${Date.now()}.mp3`;
            
            // download 속성 시도 (CORS가 없어도 작동할 수 있음)
            a.download = fileName;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // download 속성이 작동하지 않을 수 있으므로, 새 창에서도 열기
            // 사용자가 수동으로 다운로드할 수 있도록
            setTimeout(() => {
                window.open(musicUrl, '_blank');
            }, 100);
            
        } catch (error) {
            console.error("다운로드 실패:", error);
            // 최후의 수단: 직접 링크 열기
            window.open(musicUrl, '_blank');
            alert("브라우저에서 직접 다운로드해주세요. 새 창이 열렸습니다.");
        }
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/12 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12">
                <header className="text-center space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-2 text-sm font-semibold uppercase
                    tracking-[0.3em] text-[var(--accent-rose)] shadow-[0_10px_0_rgba(46,31,39,0.08)] mb-10 ">
                    ai result
                    </span>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)]">음악이 완성되었습니다</h1>
                    <p className="text-base text-[var(--text-muted)]">지금 바로 재생해보고, 원하는 이름과 보관 장소를 선택해보세요.</p>
                </header>

                <section className="flex flex-col gap-6">
                    {/* 상단 섹션: 재생 버튼과 액션 버튼들 */}
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-10 shadow-[0_25px_0_rgba(46,31,39,0.08)]">
                        <div className="flex flex-col items-center gap-6">
                            {/* 재생 버튼 (중앙) */}
                            <button 
                                type="button" 
                                className="play-button"
                                onClick={handlePlayPause}
                                disabled={!musicUrl || isLoading}
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
                            
                            {/* 두 개의 버튼 */}
                            <div className="flex gap-4 w-full max-w-md">
                                <Button 
                                    variant="soft" 
                                    className="flex-1 py-4 text-base font-semibold hover:cursor-pointer"
                                    onClick={() => navigate("/myPage")}
                                >
                                    내 보관함
                                </Button>
                                <Button 
                                    variant="soft" 
                                    className="flex-1 py-4 text-base font-semibold hover:cursor-pointer"
                                    onClick={handleSaveToArchive}
                                >
                                    이름 짓기
                                </Button>
                            </div>
                            
                            {/* 다운로드 버튼 */}
                            <Button 
                                variant="soft" 
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
                    </div>

                    {/* 하단 섹션: 가로 스크롤 가능한 요약 카드들과 화살표 버튼 */}
                    <div className="relative py-8">
                        {/* 왼쪽 화살표 */}
                        {canScrollLeft && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (summaryScrollRef.current) {
                                        isUserScrollingRef.current = true;
                                        stopAutoScroll();
                                        // 카드 너비(256px) + gap(16px) = 272px, 두 칸 = 544px
                                        summaryScrollRef.current.scrollBy({ left: -544, behavior: 'smooth' });
                                        // 3초 후 자동 스크롤 재개 (오른쪽 화살표가 있으면만)
                                        setTimeout(() => {
                                            isUserScrollingRef.current = false;
                                            const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current!;
                                            if (scrollLeft < scrollWidth - clientWidth - 1) {
                                                startAutoScroll();
                                            }
                                        }, 3000);
                                    }
                                }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 flex items-center justify-center hover:opacity-100 transition-opacity duration-300"
                            >
                                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[var(--text-primary)] opacity-50">
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
                                        className="flex-shrink-0 w-72 flex flex-col rounded-[2.5rem] bg-gradient-to-br from-white via-[#fffef8] to-[#fff6da] border-2 border-white/50 p-7 shadow-[0_8px_24px_rgba(246,190,95,0.15)] hover:shadow-[0_12px_32px_rgba(246,190,95,0.25)] transition-all duration-300 backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[var(--accent-rose)] to-[var(--accent-amber)]"></div>
                                            <span className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--accent-rose)]">{item.label}</span>
                                        </div>
                                        <span className="text-base text-[var(--text-primary)] break-words leading-relaxed font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* 오른쪽 화살표 */}
                        {canScrollRight && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (summaryScrollRef.current) {
                                        isUserScrollingRef.current = true;
                                        stopAutoScroll();
                                        // 카드 너비(256px) + gap(16px) = 272px, 두 칸 = 544px
                                        summaryScrollRef.current.scrollBy({ left: 544, behavior: 'smooth' });
                                        // 3초 후 자동 스크롤 재개 (오른쪽 화살표가 있으면만)
                                        setTimeout(() => {
                                            isUserScrollingRef.current = false;
                                            const { scrollLeft, scrollWidth, clientWidth } = summaryScrollRef.current!;
                                            if (scrollLeft < scrollWidth - clientWidth - 1) {
                                                startAutoScroll();
                                            }
                                        }, 3000);
                                    }
                                }}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 flex items-center justify-center hover:opacity-100 transition-opacity duration-300"
                            >
                                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[var(--text-primary)] opacity-50">
                                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </section>

                {!hasData && (
                    <div className="rounded-2xl border border-dashed border-[var(--accent-rose)] bg-[var(--accent-rose)]/10 px-6 py-4 text-center text-sm font-semibold text-[var(--accent-rose)]">
                        아직 입력된 정보가 없어요. 처음으로 돌아가서 허밍을 업로드하거나 질문에 답해보세요.
                    </div>
                )}

                {jobId && !musicUrl && (
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-yellow-50/90 p-8 shadow-[0_22px_0_rgba(46,31,39,0.08)]">
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

                {composeResponseJson && (
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-white/90 p-8 shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">AI 응답 미리보기</h2>
                        <pre className="mt-4 max-h-60 overflow-auto rounded-2xl bg-gray-900/90 p-5 text-sm text-gray-100">
                            {composeResponseJson}
                        </pre>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-6">
                    <Button toWhere="/" variant="rainbow" className="w-55 py-5" onClick={() => resetAnswers()}>
                        처음으로 돌아가기
                    </Button>
                    {/* <Button variant="rainbow" className="w-55 py-5" onClick={() => window.location.reload()}>
                        다시 생성하기
                    </Button> */}
                </div>
            </div>

            {/* 음악 이름 입력 모달 */}
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

