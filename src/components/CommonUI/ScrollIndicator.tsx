import { useState, useEffect, useRef, useCallback } from "react";
import type {
  ScrollIndicatorHook,
  ScrollIndicatorButtonProps,
} from "../../types/scrollIndicatorTypes";

export const useScrollIndicator = (): ScrollIndicatorHook => {
  const [isVisible, setIsVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const checkScroll = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;

    const hasOverflow = nav.scrollHeight > nav.clientHeight;
    const isAtBottom =
      Math.abs(nav.scrollHeight - nav.clientHeight - nav.scrollTop) < 1;

    setIsVisible(hasOverflow && !isAtBottom);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Initial check
    checkScroll();

    // Add scroll listener
    nav.addEventListener("scroll", checkScroll);

    // Add resize listener to check if overflow status changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(nav);

    return () => {
      nav.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scrollToBottom = useCallback(() => {
    if (navRef.current) {
      navRef.current.scrollTo({
        top: navRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return {
    navRef,
    isVisible,
    scrollToBottom,
  };
};

export const ScrollIndicatorButton: React.FC<ScrollIndicatorButtonProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`absolute bottom-4 left-[45%] -translate-x-1/2 animate-bounce 
        bg-primary text-white rounded-full p-2 shadow-lg transition-all 
        duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 
        focus:ring-primary/50 ${className}`}
      aria-label="Scroll to bottom"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </svg>
    </button>
  );
};

export default useScrollIndicator;
