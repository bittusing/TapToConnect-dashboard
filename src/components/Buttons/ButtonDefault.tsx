"use client";
import { Link } from "react-router-dom";
import useScreenHook from "../../hooks/useScreenHook";

interface ButtonPropTypes {
  label: string;
  link?: string | null;
  mode?: "link" | "button";
  type?: "button" | "submit" | "reset" | undefined;
  customClasses?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  loading?: boolean;
  target?: "_self" | "_blank" | "_parent" | "_top";
  rel?: string;
  title?: string;
  ariaLabel?: string;
}

const ButtonDefault = ({
  label,
  link = undefined,
  mode = "button",
  type = "button",
  customClasses = "",
  size = "md",
  variant = "primary",
  disabled = false,
  onClick = () => {},
  children,
  icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  target = "_self",
  rel = "",
  title,
  ariaLabel,
}: ButtonPropTypes) => {
  const { deviceType } = useScreenHook();
  return (
    <>
      {mode === "link" ? (
        <Link
          className={`${customClasses} ${
            size === "sm" ? "text-xs" : size === "md" ? "text-base" : "text-lg"
          } ${
            variant === "primary"
              ? "bg-primary text-white "
              : variant === "secondary"
                ? "bg-green text-white"
                : variant === "outline"
                  ? "border border-stroke-dark px-3 py-3 font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                  : "bg-transparent text-black"
          } ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } flex max-h-[50px] w-full min-w-[130px] items-center justify-center  gap-2.5 rounded-md py-3 text-center font-medium transition-colors duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            fullWidth ? "!w-full" : "!max-w-[130px]"
          }`}
          to={link || "#"}
          onClick={() => {
            if (!loading) {
              onClick();
            }
          }}
          target={target}
          rel={rel}
          title={title}
          aria-label={ariaLabel}
        >
          {icon && iconPosition === "left" && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {label}
          {icon && iconPosition === "right" && (
            <span className="ml-2">{icon}</span>
          )}
        </Link>
      ) : (
        <button
          type={type}
          className={`${customClasses} ${
            size === "sm"
              ? "text-xs"
              : size === "md"
                ? "text-base"
                : "text-lg"
          } ${
            variant === "primary"
              ? "bg-primary text-white "
              : variant === "secondary"
                ? "bg-green text-white"
                : variant === "outline"
                  ? "border border-stroke-dark px-3 py-3 font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                  : "bg-transparent text-black"
          } ${
            disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } flex max-h-[50px] w-f items-center justify-center  gap-2.5 rounded-md py-3 text-center font-medium transition-colors duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${deviceType === "desktop" ? "min-w-[130px]" : ""} ${
            fullWidth ? "!w-full" : "w-fit px-3"
          }`}
          onClick={(e) => {
            if (type === "submit") {
              // Let form handle submission naturally - don't prevent default
              if (onClick && !disabled && !loading) {
                onClick();
              }
            } else {
              e.preventDefault();
              if (!disabled && !loading) {
                onClick();
              }
            }
          }}
          disabled={disabled || loading}
          title={title}
          aria-label={ariaLabel}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              {icon && iconPosition === "left" && (
                <span className="mr-2">{icon}</span>
              )}
              {children}
              {label}
              {icon && iconPosition === "right" && (
                <span className="ml-2">{icon}</span>
              )}
            </>
          )}
        </button>
      )}
    </>
  );
};

export default ButtonDefault;
