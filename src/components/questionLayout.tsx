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
    };
};

function QuestionLayout({ title, description, children, onBack, onSkip, stepLabel, primaryAction }: QuestionLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#FBFBFA] px-4 py-12 sm:px-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
                <header className="flex items-center justify-between">
                    {onBack ? (
                        <Button variant="ghost" onClick={onBack} className="text-sm text-gray-500">
                            ← 이전으로
                        </Button>
                    ) : (
                        <span />
                    )}
                    <span className="text-sm font-medium text-gray-400">{stepLabel ?? ""}</span>
                </header>

                <div className="space-y-4 text-center">
                    <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
                    {description && <p className="text-base text-gray-500">{description}</p>}
                </div>

                <div className="w-full">{children}</div>

                <div className="flex flex-col items-center gap-4">
                    {primaryAction && (
                        <Button
                            onClick={primaryAction.onClick}
                            disabled={primaryAction.disabled}
                            className="px-10 py-4 text-lg"
                        >
                            {primaryAction.label}
                        </Button>
                    )}
                    {onSkip && (
                        <button
                            type="button"
                            onClick={onSkip}
                            className="text-sm font-semibold text-yellow-500 hover:text-yellow-600"
                        >
                            건너뛰기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QuestionLayout;

