import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

const fieldBase = `w-full rounded-xl border bg-white/4 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all
  focus:border-amber-400/50 focus:bg-white/6 focus:ring-1 focus:ring-amber-400/20`;

const borderClass = `border-white/10 hover:border-white/15`;

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, error, hint, required, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
      {label} {required && <span className="text-amber-400">*</span>}
    </label>
    <input
      ref={ref}
      className={`${fieldBase} ${error ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20" : borderClass} ${className}`}
      {...props}
    />
    {hint && !error && <p className="text-xs text-slate-600">{hint}</p>}
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & FieldProps
>(
  (
    { label, error, hint, required, children, className = "", ...props },
    ref,
  ) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      <select
        ref={ref}
        className={`${fieldBase} ${error ? "border-red-500/50" : borderClass} cursor-pointer ${className}`}
        style={{ colorScheme: "dark" }}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-slate-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, error, hint, required, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
      {label} {required && <span className="text-amber-400">*</span>}
    </label>
    <textarea
      ref={ref}
      rows={3}
      className={`${fieldBase} ${error ? "border-red-500/50" : borderClass} resize-none ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-600">{hint}</p>}
  </div>
));
Textarea.displayName = "Textarea";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: "bg-black text-white hover:bg-gray-800 font-semibold",
    secondary:
      "border border-white/10 bg-white/4 text-slate-300 hover:bg-white/8 hover:text-white",
    danger:
      "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25",
    ghost: "text-slate-400 hover:text-white hover:bg-white/6",
  }[variant];

  const sizeClass = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }[size];

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
