import React from "react";
import ComingSoon from "./CommingSoon";

interface BlurScreenOverlayProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
  submessage?: string;
  customOverlayStyle?: string;
  customMessageStyle?: string;
  useCommingSoonComponent?: boolean;
  useFullHightWidth?: boolean;
}
const BlurScreenOverlay: React.FC<BlurScreenOverlayProps> = ({
  children,
  title = "Coming Soon!",
  message = "We're working hard to bring you this feature.",
  submessage = "This feature will be available in the next update.",
  customOverlayStyle = "",
  customMessageStyle = "",
  useCommingSoonComponent = false,
  useFullHightWidth,
}) => {
  return (
    <div className="relative">
      {/* Blur Overlay */}
      <div
        className={`absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${customOverlayStyle}`}
      >
        {useCommingSoonComponent ? (
          <ComingSoon useFullHightWidth={useFullHightWidth} />
        ) : (
          <div
            className={`rounded-lg bg-white/90 p-8 text-center shadow-lg dark:bg-gray-800/90 ${customMessageStyle}`}
          >
            <h2 className="mb-4 text-3xl font-bold text-primary">{title}</h2>
            <p className="mb-2 text-lg text-gray-600 dark:text-gray-300">
              {message}
            </p>
            <p className="text-gray-500 dark:text-gray-400">{submessage}</p>
          </div>
        )}
      </div>

      {/* Original Content (Blurred) */}
      {children}
    </div>
  );
};

export default BlurScreenOverlay;
