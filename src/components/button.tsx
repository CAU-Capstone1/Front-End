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
    rainbow: "border border-black/8 bg-[linear-gradient(120deg,#fffef9,#fef6dd,#fff5f3,#ffe4e1)] text-[var(--text-primary)] shadow-[0_4px_12px_rgba(252,234,187,0.15)] hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(252,234,187,0.2)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(252,234,187,0.12)] focus-visible:ring-[var(--accent-amber)]",
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

