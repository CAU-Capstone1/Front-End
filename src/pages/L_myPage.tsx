import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { getAllSavedMusic, deleteSavedMusic, updateMusicName, type SavedMusic } from "../utils/musicStorage";
import { isLoggedIn, getCurrentUser, logout } from "../utils/auth";
import { downloadMusicFile } from "../utils/downloadFile";

function getMusicUrl(music: SavedMusic): string | null {
    if (!music.composeResponse) return null;
    try {
        const parsed = (
            typeof music.composeResponse === "string"
                ? JSON.parse(music.composeResponse)
                : music.composeResponse
        ) as Record<string, unknown>;
        return (
            (parsed.musicUrl as string | undefined) ??
            (parsed.audioUrl as string | undefined) ??
            (parsed.fileUrl as string | undefined) ??
            null
        );
    } catch {
        return null;
    }
}

function MyPage() {
    const navigate = useNavigate();
    const [savedMusicList, setSavedMusicList] = useState<SavedMusic[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [currentUser, setCurrentUser] = useState(getCurrentUser());
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        setCurrentUser(getCurrentUser());
    }, [navigate]);

    const loadAndSortMusic = useCallback(() => {
        const music = getAllSavedMusic();
        const sorted = [...music].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setSavedMusicList(sorted);
    }, []);

    useEffect(() => {
        loadAndSortMusic();
    }, [loadAndSortMusic]);

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const handleDelete = (id: string) => {
        if (confirm("정말 이 음악을 삭제하시겠습니까?")) {
            deleteSavedMusic(id);
            loadAndSortMusic();
        }
    };

    const handleEditStart = (music: SavedMusic) => {
        setEditingId(music.id);
        setEditingName(music.name);
    };

    const handleEditSave = (id: string) => {
        if (editingName.trim()) {
            updateMusicName(id, editingName.trim());
            loadAndSortMusic();
        }
        setEditingId(null);
        setEditingName("");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName("");
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    const handlePlay = async (music: SavedMusic) => {
        const musicUrl = getMusicUrl(music);
        if (!musicUrl) {
            alert("재생할 음악 파일을 찾을 수 없습니다.");
            return;
        }

        if (playingId === music.id && audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        if (audioRef.current && playingId !== music.id) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        try {
            if (!audioRef.current || audioRef.current.src !== musicUrl) {
                audioRef.current?.pause();
                audioRef.current = null;

                const audio = new Audio(musicUrl);
                audio.addEventListener("play", () => setPlayingId(music.id));
                audio.addEventListener("pause", () => setPlayingId(null));
                audio.addEventListener("ended", () => setPlayingId(null));
                audio.addEventListener("error", () => {
                    setPlayingId(null);
                    alert("음악 재생 중 오류가 발생했습니다.");
                });
                audioRef.current = audio;
            }
            await audioRef.current.play();
        } catch {
            alert("음악 재생에 실패했습니다.");
            setPlayingId(null);
        }
    };

    const handleDownload = async (music: SavedMusic) => {
        const musicUrl = getMusicUrl(music);
        if (!musicUrl) {
            alert("다운로드할 음악 파일을 찾을 수 없습니다.");
            return;
        }
        await downloadMusicFile(musicUrl, music.name.trim() || `music-${Date.now()}`);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/12 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12">
                <header className="text-center space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <Button toWhere="/" variant="ghost" className="px-4 py-2 text-sm flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                            홈으로
                        </Button>
                        <div className="flex items-center gap-4">
                            {currentUser && (
                                <span className="text-sm text-[var(--text-muted)]">{currentUser.name}님 환영합니다</span>
                            )}
                            <button
                                onClick={async () => {
                                    try {
                                        await logout();
                                        navigate("/");
                                    } catch {
                                        localStorage.clear();
                                        sessionStorage.clear();
                                        navigate("/");
                                    }
                                }}
                                className="rainbow-text-hover-parent rounded-full border-2 border-black/10 bg-white/90 px-7 py-3 text-sm font-semibold shadow-[0_6px_0_rgba(46,31,39,0.08)] hover:bg-white hover:shadow-[0_4px_0_rgba(46,31,39,0.06)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer"
                            >
                                <span className="text-[var(--text-primary)] rainbow-text-hover">로그아웃</span>
                            </button>
                        </div>
                    </div>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)]">내 보관함</h1>
                    <p className="text-base text-[var(--text-muted)]">그동안 만든 음악들을 확인하고 관리하세요.</p>
                </header>

                {savedMusicList.length === 0 ? (
                    <div className="rounded-2xl border-4 border-black/10 bg-white/85 p-12 text-center shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <p className="text-lg text-[var(--text-muted)] m-6">아직 저장된 음악이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedMusicList.map((music) => (
                            <div
                                key={music.id}
                                className="rounded-[2rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-6 shadow-[0_22px_0_rgba(46,31,39,0.08)]"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {editingId === music.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="retro-input flex-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleEditSave(music.id);
                                                        else if (e.key === "Escape") handleEditCancel();
                                                    }}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleEditSave(music.id)}
                                                    className="px-4 py-2 rounded-full bg-[var(--accent-mint)] text-white font-semibold hover:bg-[var(--accent-mint)]/80 transition"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={handleEditCancel}
                                                    className="px-4 py-2 rounded-full bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <h3
                                                    className="text-xl font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent-rose)] transition"
                                                    onClick={() => handleEditStart(music)}
                                                    title="클릭하여 이름 수정"
                                                >
                                                    {music.name}
                                                </h3>
                                                <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
                                                    {formatDate(music.createdAt)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => void handlePlay(music)}
                                            className="w-12 h-12 rounded-full bg-[var(--accent-amber)] text-[var(--text-primary)] flex items-center justify-center hover:bg-[var(--accent-amber)]/80 transition shadow-[0_6px_0_rgba(46,31,39,0.15)] hover:translate-y-[2px] hover:shadow-[0_4px_0_rgba(46,31,39,0.12)]"
                                            title={playingId === music.id ? "일시정지" : "재생"}
                                        >
                                            {playingId === music.id ? (
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current ml-0.5">
                                                    <path d="M8 5.5v13l10-6.5z" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => void handleDownload(music)}
                                            className="w-12 h-12 rounded-full bg-[var(--accent-mint)] text-white flex items-center justify-center hover:bg-[var(--accent-mint)]/80 transition shadow-[0_6px_0_rgba(46,31,39,0.15)] hover:translate-y-[2px] hover:shadow-[0_4px_0_rgba(46,31,39,0.12)]"
                                            title="다운로드"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                                <path d="M12 15.5L7.5 11h3V3h3v8h3L12 15.5zM5 19h14v2H5v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(music.id)}
                                            className="w-12 h-12 rounded-full bg-[var(--accent-rose)] text-white flex items-center justify-center hover:bg-[var(--accent-rose)]/80 transition shadow-[0_6px_0_rgba(46,31,39,0.15)] hover:translate-y-[2px] hover:shadow-[0_4px_0_rgba(46,31,39,0.12)]"
                                            title="삭제"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <Button toWhere="/" variant="rainbow" className="px-12 py-5">
                        새 음악 만들기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MyPage;
