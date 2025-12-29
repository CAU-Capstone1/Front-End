import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router";
import Button from "../components/button";
import { login } from "../utils/auth"; // login 함수는 AuthResponse 객체를 반환해야 함

function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get("returnUrl") || "/";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("이메일과 비밀번호를 모두 입력해주세요.");
            return;
        }

        setLoading(true);
        try {
            const response = await login(email, password); 
            
            // login 함수가 이미 토큰을 저장하므로 추가 저장 불필요
            // 응답 확인만 수행
            if (!response || !response.accessToken) {
                throw new Error("로그인 응답이 올바르지 않습니다.");
            }
            
            // returnUrl이 있으면 해당 페이지로, 없으면 홈으로 이동
            navigate(returnUrl);
        } catch (err) {
            console.error("로그인 오류:", err);
            if (err instanceof Error) {
                // 네트워크 오류인 경우 더 명확한 메시지 제공
                if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
                    setError("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--accent-rose)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 top-0 h-80 w-80 rounded-[45%] bg-[var(--accent-amber)]/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--accent-rose)]/12 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center min-h-[80vh]">
                <div className="w-full rounded-[2.5rem] border-4 border-black/10 bg-gradient-to-tr from-[#fff6da] via-white to-[#fce4ef] p-10 shadow-[0_25px_0_rgba(46,31,39,0.08)]">
                    <header className="text-center mb-8">
                        <h1 className="text-[2.6rem] font-semibold leading-tight text-[var(--text-primary)] mb-2">
                            로그인
                        </h1>
                        <p className="text-base text-[var(--text-muted)]">음악을 저장하고 관리하려면 로그인해주세요</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-2xl border-2 border-[var(--accent-rose)] bg-[var(--accent-rose)]/10 px-4 py-3 text-sm font-semibold text-[var(--accent-rose)] text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                이메일
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="retro-input w-full"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="retro-input w-full"
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="rainbow"
                            className="w-full py-5 text-lg"
                            disabled={loading}
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--text-muted)]">
                            계정이 없으신가요?{" "}
                            <Link
                                to="/signup"
                                className="font-semibold text-[var(--accent-rose)] hover:text-[var(--accent-rose)]/80 underline"
                            >
                                회원가입
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            to="/"
                            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
                        >
                            홈으로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;