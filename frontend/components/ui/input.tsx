import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = { ...props };

    if (Object.prototype.hasOwnProperty.call(props, "value")) {
      inputProps.value = props.value ?? "";
    }

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border border-border bg-white px-4 py-2 text-sm text-foreground placeholder:text-subtle",
            "transition-all duration-200",
            "focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-error/40 focus:border-error/50 focus:ring-error/10",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...inputProps}
        />
        {error && (
          <p className="mt-1.5 text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
