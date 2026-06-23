import type { InputHTMLAttributes, ReactNode } from "react";

export interface ArcadeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  description?: string;
  error?: string;
  prefix?: ReactNode;
}

export function ArcadeInput({
  label,
  description,
  error,
  prefix,
  id,
  required,
  disabled,
  className = "",
  ...props
}: ArcadeInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const descId = description || error ? `${inputId}-desc` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-arcade text-[11px] uppercase tracking-widest text-text-muted"
      >
        {label}
        {required && (
          <span className="text-arcade-magenta ml-1" aria-label="requerido">
            *
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 flex items-center text-text-muted" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-describedby={descId}
          aria-invalid={error ? true : undefined}
          className={[
            "w-full px-3 py-3 font-body text-base",
            "bg-panel border-2 border-panel-border",
            "text-text-primary placeholder:text-text-muted",
            "outline-none",
            "focus:border-arcade-cyan focus:shadow-glow-cyan",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error ? "border-arcade-red" : "",
            prefix ? "pl-10" : "",
            className,
          ].join(" ")}
          style={{ borderRadius: 0 }}
          {...props}
        />
      </div>

      {(description || error) && (
        <p
          id={descId}
          className={[
            "font-body text-sm",
            error ? "text-arcade-red" : "text-text-muted",
          ].join(" ")}
          role={error ? "alert" : undefined}
        >
          {error ?? description}
        </p>
      )}
    </div>
  );
}
