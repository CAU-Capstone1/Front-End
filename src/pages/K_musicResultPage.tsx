import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { getAllAnswers, resetAnswers } from "../utils/compositionSession";
import { formatAnswerValue } from "../utils/valueLabels";
import { saveMusic } from "../utils/musicStorage";
import { isLoggedIn } from "../utils/auth";
import { checkJobStatus, type JobStatusResponse } from "../api/checkJobStatus";

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
                if (url) {
                    setMusicUrl(url);
                } else if (parsed.status === "QUEUED" || parsed.status === "PROCESSING") {
                    // 아직 생성 중인 경우
                    setJobStatus(parsed.status);
                }
            } catch (error) {
                console.warn("Failed to parse compose response", error);
            }
        }
    }, []);

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
        setShowNameModal(true);
    };

    const handleNameSubmit = () => {
        if (!musicName.trim()) {
            alert("음악 이름을 입력해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const answers = getAllAnswers();
            const rawResponse = sessionStorage.getItem("compose:lastResponse");

            saveMusic({
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

            alert("음악이 보관함에 저장되었습니다!");
            setShowNameModal(false);
            setMusicName("");
            navigate("/myPage");
        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNameCancel = () => {
        setShowNameModal(false);
        setMusicName("");
    };

    // 음악 재생/일시정지 처리
    const handlePlayPause = async () => {
        if (!musicUrl) {
            alert("재생할 음악이 없습니다.");
            return;
        }

        // Audio 객체가 없으면 생성
        if (!audioRef.current) {
            audioRef.current = new Audio(musicUrl);
            
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

    // 음악 다운로드 처리 (로그인 불필요)
    const handleDownload = async () => {
        if (!musicUrl) {
            alert("다운로드할 음악이 없습니다.");
            return;
        }

        try {
            // 음악 파일 다운로드
            const response = await fetch(musicUrl);
            if (!response.ok) {
                throw new Error("다운로드 실패");
            }

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
            
            alert("다운로드가 완료되었습니다!");
        } catch (error) {
            console.error("다운로드 실패:", error);
            alert("다운로드 중 오류가 발생했습니다.");
        }
    };

    // Job 상태 수동 확인
    const handleCheckJobStatus = async () => {
        if (!jobId) return;
        
        setIsCheckingJob(true);
        setJobStatus(null);
        
        try {
            const status = await checkJobStatus(jobId);
            console.log("📊 Job 상태 확인 결과:", status);
            
            setJobStatus(status.status || "알 수 없음");
            
            // 완료되었고 음악 URL이 있으면 업데이트 (백엔드 DTO의 musicUrl 필드를 우선 확인)
            const url = status.musicUrl || status.audioUrl || status.fileUrl || status.url || status.audio_url || status.music_url;
            if (url) {
                setMusicUrl(url);
                // 응답 업데이트
                const updatedResponse = { ...JSON.parse(composeResponseJson || "{}"), ...status };
                setComposeResponseJson(JSON.stringify(updatedResponse, null, 2));
                sessionStorage.setItem("compose:lastResponse", JSON.stringify(updatedResponse));
            }
        } catch (error) {
            console.error("❌ Job 상태 확인 실패:", error);
            setJobStatus("확인 실패");
            alert(`Job 상태 확인 실패: ${error instanceof Error ? error.message : String(error)}\n\n서버에 Job 상태 확인 API가 없거나 다른 경로를 사용하는 것 같습니다.`);
        } finally {
            setIsCheckingJob(false);
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

                <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-10 shadow-[0_25px_0_rgba(46,31,39,0.08)]">
                        <div className="flex flex-col items-center justify-center gap-8">
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
                                {musicUrl && (
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {isPlaying ? "재생 중..." : isLoading ? "로딩 중..." : "재생할 준비가 되었습니다"}
                                    </p>
                                )}
                                <div className="flex flex-wrap justify-center gap-3">
                                    <Button 
                                        variant="soft" 
                                        className="w-50 py-5 text-m font-semibold hover:cursor-pointer flex items-center justify-center gap-2"
                                        onClick={handleDownload}
                                        disabled={!musicUrl}
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                            <path d="M12 15.5L7.5 11h3V3h3v8h3L12 15.5zM5 19h14v2H5v-2z" />
                                        </svg>
                                        다운로드
                                    </Button>
                                    <Button 
                                        variant="soft" 
                                        className="w-50 py-5 text-m font-semibold hover:cursor-pointer"
                                        onClick={handleSaveToArchive}
                                    >
                                        음악 이름 짓기
                                    </Button>
                                    <Button 
                                        variant="soft" 
                                        className="w-50 py-5 text-m font-semibold hover:cursor-pointer"
                                        onClick={handleSaveToArchive}
                                    >
                                        내 보관함
                                    </Button>
                                </div>
                            </div>
                        </div>

                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-white/85 p-10 shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-xl ml-3 font-semibold text-[var(--text-primary)]">요청 요약</h2>
                        <div className="mt-6 space-y-4">
                            {summary.map((item) => (
                                <div key={item.label} className="flex items-center justify-between rounded-[1.5rem] bg-[var(--bg-secondary)] px-5 py-4 text-[var(--text-primary)]">
                                    <span className="text-m font-semibold uppercase tracking-[0.25em] text-[var(--accent-rose)]">{item.label}</span>
                                    <span className="text-m ">{item.value}</span>
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

                {jobId && !musicUrl && (
                    <div className="rounded-[2.5rem] border-4 border-black/10 bg-yellow-50/90 p-8 shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">음악 생성 중</h2>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                            Job ID: <code className="bg-white/50 px-2 py-1 rounded">{jobId}</code>
                        </p>
                        {jobStatus && (
                            <p className="text-sm text-[var(--text-muted)] mb-4">
                                현재 상태: <strong>{jobStatus}</strong>
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
                            💡 서버가 Job 상태 확인 API를 제공하지 않는 경우, 잠시 후 페이지를 새로고침하거나 서버 관리자에게 문의하세요.
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
                    <Button variant="rainbow" className="w-55 py-5" onClick={() => window.location.reload()}>
                        다시 생성하기
                    </Button>
                </div>
            </div>

            {/* 음악 이름 입력 모달 */}
            {showNameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative w-full max-w-md rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-8 shadow-[0_25px_0_rgba(46,31,39,0.08)]">
                        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">음악 이름을 지어주세요</h2>
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

