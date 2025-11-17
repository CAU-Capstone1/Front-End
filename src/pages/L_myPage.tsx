import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/button";
import { getAllSavedMusic, deleteSavedMusic, updateMusicName, type SavedMusic } from "../utils/musicStorage";
import { isLoggedIn, getCurrentUser, logout } from "../utils/auth";

function MyPage() {
    const navigate = useNavigate();
    const [savedMusicList, setSavedMusicList] = useState<SavedMusic[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>("");
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    // 로그인 확인
    useEffect(() => {
        if (!isLoggedIn()) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }
        setCurrentUser(getCurrentUser());
    }, [navigate]);

    const loadAndSortMusic = () => {
        const music = getAllSavedMusic();
        // 최신순으로 정렬 (날짜 내림차순)
        const sorted = music.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
        setSavedMusicList(sorted);
    };

    useEffect(() => {
        loadAndSortMusic();
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
            const date = new Date(dateString);
            return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    const handlePlay = (music: SavedMusic) => {
        // TODO: 실제 오디오 재생 기능 구현
        console.log("재생:", music);
        alert("재생 기능은 추후 구현 예정입니다.");
    };

    const handleDownload = (music: SavedMusic) => {
        // TODO: 실제 다운로드 기능 구현
        console.log("다운로드:", music);
        alert("다운로드 기능은 추후 구현 예정입니다.");
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/12 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12">
                <header className="text-center space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            toWhere="/"
                            variant="ghost"
                            className="px-4 py-2 text-sm flex items-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                            홈으로
                        </Button>
                        <div className="flex items-center gap-4">
                            {currentUser && (
                                <span className="text-sm text-[var(--text-muted)]">
                                    {currentUser.name}님 환영합니다
                                </span>
                            )}
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    try {
                                        await logout();
                                        alert("로그아웃되었습니다.");
                                        navigate("/login");
                                    } catch (error) {
                                        console.error("로그아웃 실패:", error);
                                        // 에러가 발생해도 로그인 페이지로 이동
                                        navigate("/login");
                                    }
                                }}
                                className="px-4 py-2 text-sm"
                            >
                                로그아웃
                            </Button>
                        </div>
                    </div>
                    <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)]">내 보관함</h1>
                    <p className="text-base text-[var(--text-muted)]">그동안 만든 음악들을 확인하고 관리하세요.</p>
                </header>

                {savedMusicList.length === 0 ? (
                    <div className="rounded-2xl border-4 border-black/10 bg-white/85 p-12 text-center shadow-[0_22px_0_rgba(46,31,39,0.08)]">
                        <p className="text-lg text-[var(--text-muted)] mb-6">아직 저장된 음악이 없습니다.</p>
                        <Button toWhere="/main" variant="rainbow" className="px-8 py-4">
                            음악 만들기
                        </Button>
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
                                                        if (e.key === "Enter") {
                                                            handleEditSave(music.id);
                                                        } else if (e.key === "Escape") {
                                                            handleEditCancel();
                                                        }
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
                                            onClick={() => handlePlay(music)}
                                            className="w-12 h-12 rounded-full bg-[var(--accent-amber)] text-[var(--text-primary)] flex items-center justify-center hover:bg-[var(--accent-amber)]/80 transition shadow-[0_6px_0_rgba(46,31,39,0.15)] hover:translate-y-[2px] hover:shadow-[0_4px_0_rgba(46,31,39,0.12)]"
                                            title="재생"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current ml-0.5">
                                                <path d="M8 5.5v13l10-6.5z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDownload(music)}
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
                    <Button toWhere="/" variant="outline" className="px-8 py-5 flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        홈으로
                    </Button>
                    <Button toWhere="/main" variant="rainbow" className="px-12 py-5">
                        새 음악 만들기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MyPage;

