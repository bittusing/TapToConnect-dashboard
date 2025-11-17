import React from "react";
import { BiTerminal, BiCodeBlock } from "react-icons/bi";
import { GiBarrier } from "react-icons/gi";
// import {
//   GiBarrier
// } from "react-icons/gi";

const ComingSoon = ({
  title = "Feature Coming Soon",
  description = "We're working hard to bring you something amazing. Stay tuned!",
  estimatedTime = "Q1 2025",
  useFullHightWidth = true,
}) => {
  return (
    <div
      className={`${
        useFullHightWidth ? "min-h-full w-full" : ""
      } flex justify-center items-center rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800`}
    >
      <div className="flex h-full flex-col items-center justify-center space-y-6">
        {/* Top Construction Icon */}
        <div className="relative">
          <div className="absolute -left-6 -top-6">
            <GiBarrier className="h-8 w-8 animate-bounce text-primary opacity-50" />
          </div>
          <div className="rounded-full bg-primary/10 p-4 dark:bg-primary/5">
            <div className="relative">
              <BiTerminal className="h-12 w-12 text-primary" />
              <BiCodeBlock className="absolute -right-2 -top-2 h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6">
            <GiBarrier className="h-8 w-8 animate-bounce text-primary opacity-50" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
        </div>

        {/* Progress Indicator */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>60%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full w-[60%] rounded-full bg-primary transition-all duration-1000 ease-in-out"
              style={{
                background:
                  "linear-gradient(90deg, rgba(87,80,241,1) 0%, rgba(110,104,242,1) 100%)",
              }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Planning
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Development
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Testing
            </span>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-4 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary dark:bg-primary/5">
          Estimated Release: {estimatedTime}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
