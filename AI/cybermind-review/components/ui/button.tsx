import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700",

    secondary:
      "bg-slate-200 text-slate-900 hover:bg-slate-300",

    outline:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        rounded-xl
        px-4
        py-2
        text-sm
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}