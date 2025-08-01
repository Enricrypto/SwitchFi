import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';


const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[15px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-[#4691FF] to-[#2669CA] text-white hover:opacity-90 focus-visible:ring-blue-500",
        secondary: "text-white font-semibold border-2 border-transparent bg-origin-border bg-clip-padding-box hover:scale-[1.03] hover:opacity-90 focus-visible:ring-blue-500 transition-transform [background-image:linear-gradient(#0B0F1C,#0B0F1C),linear-gradient(to_right,#2E83FF,#1C4F99)] [background-clip:padding-box,border-box] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        outline: "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-500",
        ghost: "text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-500",
        link: "text-white underline-offset-4 hover:underline focus-visible:ring-blue-500",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        secondary: "py-2 px-5 text-sm",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
    compoundVariants: [
      {
        variant: "secondary",
        class: "py-2 px-5 text-sm font-semibold",
      },
    ],
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading = false, 
    disabled,
    leftIcon,
    rightIcon,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span
            className="w-4 h-4 border-2 border-t-transparent border-r-current border-b-transparent border-l-current rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
