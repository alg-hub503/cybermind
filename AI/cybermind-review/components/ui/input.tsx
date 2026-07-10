import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`
        w-full
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-2
        text-sm
        text-slate-900
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-indigo-500
        focus:ring-2
        focus:ring-indigo-200
        ${className}
      `}
      {...props}
    />
  );
}