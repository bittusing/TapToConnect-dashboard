// types/ScrollIndicator.ts

export interface ScrollIndicatorHook {
    navRef: React.RefObject<HTMLElement>;
    isVisible: boolean;
    scrollToBottom: () => void;
  }
  
  export interface ScrollIndicatorButtonProps {
    onClick: () => void;
    className?: string;
  }