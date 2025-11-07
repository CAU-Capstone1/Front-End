import type { ReactNode } from "react";
import { NavLink } from "react-router";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
    toWhere?: string;
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    className?: string;
    disabled?: boolean;
};

const baseClass = "inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variantClassMap: Record<Variant, string> = {
    primary: "bg-yellow-400 text-gray-900 hover:bg-yellow-300 focus-visible:ring-yellow-500",
    secondary: "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
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
        disabled && "opacity-60 cursor-not-allowed",
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
                        isActive && variant === "ghost" && "bg-gray-200",
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

