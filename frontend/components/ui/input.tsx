import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  boxed?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, boxed, ...props }, ref) => {
    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
      ...props,
    };

    if (Object.prototype.hasOwnProperty.call(props, "value")) {
      inputProps.value = props.value ?? "";
    }

    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full bg-transparent py-2 text-[15px] text-foreground placeholder:text-subtle",
            "transition-colors duration-150",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none",
            boxed
              ? "rounded-md border border-rule-strong bg-surface px-4 focus:border-primary"
              : "border-0 border-b border-rule rounded-none px-0 focus:border-primary",
            icon && (boxed ? "pl-10" : "pl-7"),
            error &&
              (boxed
                ? "border-error/60 focus:border-error"
                : "border-error/60 focus:border-error"),
            className
          )}
          ref={ref}
          {...inputProps}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
