import { useState } from "react";
import { useNavigate, Link } from "react-router";
import Button from "../components/button";
import { signUp } from "../utils/auth";

function SignupPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("모든 항목을 입력해주세요.");
            return;
        }

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (password.length < 4) {
            setError("비밀번호는 최소 4자 이상이어야 합니다.");
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, name);
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
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
                            회원가입
                        </h1>
                        <p className="text-base text-[var(--text-muted)]">새 계정을 만들어 음악을 저장하세요</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-2xl border-2 border-[var(--accent-rose)] bg-[var(--accent-rose)]/10 px-4 py-3 text-sm font-semibold text-[var(--accent-rose)] text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                이름
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름을 입력하세요"
                                className="retro-input w-full"
                                required
                                disabled={loading}
                            />
                        </div>

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
                                placeholder="최소 4자 이상"
                                className="retro-input w-full"
                                required
                                disabled={loading}
                                minLength={4}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                                비밀번호 확인
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
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
                            {loading ? "가입 중..." : "회원가입"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[var(--text-muted)]">
                            이미 계정이 있으신가요?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-[var(--accent-rose)] hover:text-[var(--accent-rose)]/80 underline"
                            >
                                로그인
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

export default SignupPage;

