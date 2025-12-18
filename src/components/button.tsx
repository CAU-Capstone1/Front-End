import type { ReactNode } from "react";
import { NavLink } from "react-router";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "rainbow" | "danger" | "soft";

type ButtonProps = {
    toWhere?: string;
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    className?: string;
    disabled?: boolean;
};

const baseClass = "my-btn inline-flex items-center justify-center rounded-full px-7 py-3 text-base font-semibold tracking-wide transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variantClassMap: Record<Variant, string> = {
    primary: "bg-[var(--accent-amber)] text-[var(--text-primary)] shadow-[0_10px_0_rgba(46,31,39,0.2)] hover:translate-y-[2px] hover:shadow-[0_6px_0_rgba(46,31,39,0.18)] focus-visible:ring-[var(--accent-amber)]",
    secondary: "bg-[var(--accent-amber)] text-white shadow-[0_10px_0_rgba(46,31,39,0.22)] hover:translate-y-[2px] hover:shadow-[0_6px_0_rgba(46,31,39,0.2)] focus-visible:ring-[var(--accent-amber)]",
    ghost: "bg-transparent text-[var(--text-muted)] hover:bg-white/70 focus-visible:ring-[var(--accent-amber)]",
    outline: "border-2 border-[var(--accent-amber)] bg-white text-[var(--text-primary)] shadow-[0_8px_0_rgba(242,137,130,0.32)] hover:bg-[var(--accent-amber)]/10 focus-visible:ring-[var(--accent-amber)]",
    rainbow: "border-2 border-[rgba(180,150,130,0.4)] bg-[linear-gradient(135deg,rgba(255,248,220,0.95)_0%,rgba(255,245,235,0.9)_30%,rgba(255,243,248,0.85)_50%,rgba(240,248,255,0.9)_70%,rgba(230,245,255,0.95)_100%)] text-[var(--text-primary)] shadow-[0_8px_0_rgba(200,220,240,0.2),0_0_0_1px_rgba(200,180,160,0.15),0_2px_12px_rgba(131,68,36,0.08)] hover:-translate-y-[2px] hover:shadow-[0_10px_0_rgba(200,220,240,0.25),0_0_0_1px_rgba(200,180,160,0.2),0_4px_16px_rgba(131,68,36,0.1)] active:translate-y-[3px] active:shadow-[0_2px_0_rgba(200,220,240,0.1),0_0_0_1px_rgba(200,180,160,0.08),0_0_2px_rgba(131,68,36,0.04)] focus-visible:ring-[var(--accent-amber)]",
    danger: "border-2 border-[#f28982] bg-white text-[var(--text-primary)] shadow-[0_10px_0_rgba(242,137,130,0.25)] hover:translate-y-[1px] hover:shadow-[0_6px_0_rgba(242,137,130,0.2)] focus-visible:ring-[#f28982]",
    soft: "border-2 border-[var(--accent-amber)] bg-white text-[var(--text-primary)] shadow-[0_10px_0_rgba(246,190,95,0.18)] hover:-translate-y-[1px] hover:shadow-[0_6px_0_rgba(246,190,95,0.15)] focus-visible:ring-[var(--accent-amber)]",
};

function mergeClasses(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

function Button({
    toWhere,
    children,
    onClick,
    type = "button",
    variant = "primary",
    className,
    disabled,
}: ButtonProps) {
    const composedClass = mergeClasses(
        baseClass,
        variantClassMap[variant],
        disabled && "opacity-60 cursor-auto",
        className,
    );

    if (toWhere) {
        return (
            <NavLink
                to={toWhere}
                onClick={disabled ? undefined : onClick}
                className={({ isActive }) =>
                    mergeClasses(
                        composedClass,
                        isActive && variant === "ghost" && "bg-white/80 text-[var(--accent-amber)]",
                    )
                }
            >
                {children}
            </NavLink>
        );
    }

    return (
        <button type={type} onClick={onClick} className={composedClass} disabled={disabled}>
            {children}
        </button>
    );
}

export default Button;

