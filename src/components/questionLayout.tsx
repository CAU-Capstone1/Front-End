import type { ReactNode } from "react";
import Button from "./button";

type QuestionLayoutProps = {
    title: string;
    description?: string;
    children: ReactNode;
    onBack?: () => void;
    onSkip?: () => void;
    stepLabel?: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        variant?: "primary" | "secondary" | "ghost" | "outline" | "rainbow";
    };
};

function QuestionLayout({ title, description, children, onBack, onSkip, stepLabel, primaryAction }: QuestionLayoutProps) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden px-4 py-16 sm:px-10">
            <div className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-[var(--accent-rose)]/25 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-[var(--accent-amber)]/35 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 rounded-[40%] bg-[var(--accent-mint)]/20 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
                <header className="flex items-center justify-between">
                    {onBack ? (
                        <Button variant="ghost" onClick={onBack} className="text-sm text-[var(--text-muted)]">
                            ← 이전으로
                        </Button>
                    ) : (
                        <span />
                    )}
                    {stepLabel && (
                        <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)] shadow-[0_6px_0_rgba(46,31,39,0.08)]">
                            {stepLabel}
                        </span>
                    )}
                </header>

                <div className="rounded-[2.5rem] border-4 border-black/10 bg-white/80 px-8 py-12 shadow-[0_25px_0_rgba(46,31,39,0.08)] sm:px-12">
                    <div className="mx-auto max-w-3xl space-y-4 text-center">
                        <h1 className="text-[2.5rem] font-semibold leading-tight text-[var(--text-primary)]">{title}</h1>
                        {description && <p className="text-base text-[var(--text-muted)]">{description}</p>}
                    </div>

                    <div className="mt-10 w-full">{children}</div>

                    <div className="mt-12 flex flex-col items-center gap-4">
                        {primaryAction && (
                            <Button
                                onClick={primaryAction.onClick}
                                disabled={primaryAction.disabled}
                            variant={primaryAction.variant ?? "primary"}
                                className="px-12 py-4 text-lg"
                            >
                                {primaryAction.label}
                            </Button>
                        )}
                        {onSkip && (
                            <button
                                type="button"
                                onClick={onSkip}
                                className="text-sm font-semibold text-[var(--accent-rose)] hover:text-[var(--accent-rose)]"
                            >
                                선택 안할래요
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionLayout;

