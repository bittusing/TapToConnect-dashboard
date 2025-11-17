import React, { useState } from "react";
import { BiSearchAlt2, BiRefresh } from "react-icons/bi";
import { RiEmotionSadLine, RiEmotionLaughLine } from "react-icons/ri";
import ButtonDefault from "../../Buttons/ButtonDefault";

interface NoDataFoundProps {
  title?: string;
  message?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
    title = "No Data Found",
    message = "We searched high and low, but it seems the data is playing hide and seek!",
    onRefresh,
    showRefresh = true
  }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchCount, setSearchCount] = useState(0);
  
    const handleSearch = () => {
      setIsSearching(true);
      setSearchCount(prev => prev + 1);
      
      setTimeout(() => {
        setIsSearching(false);
      }, 1500);
    };
  
    const handleRefresh = () => {
      setSearchCount(0);
      onRefresh?.();
    };
  
    const funnyMessages = [
      "Still looking...",
      "Have you seen my data? About this tall 📏",
      "Maybe it's on a coffee break ☕",
      "Plot twist: The data was the friends we made along the way!",
      "404: Data got lost in the cloud ☁️"
    ];
  
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6">
        {/* Main Illustration */}
        <div className={`relative mb-8 transition-transform duration-500 ${
          isSearching ? 'scale-110' : 'scale-100'
        }`}>
          <svg 
            width="200" 
            height="200" 
            viewBox="0 0 400 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={`transition-transform duration-300 ${isSearching ? 'rotate-6' : 'rotate-0'}`}
          >
            {/* Background Circle */}
            <circle 
              cx="200" 
              cy="200" 
              r="180" 
              fill="#F3F4F6" 
              className="dark:fill-gray-700" 
            />
  
            {/* Magnifying Glass */}
            <g className={`transform transition-transform duration-500 ${
              isSearching ? 'translate-x-5 translate-y-5' : ''
            }`}>
              <circle 
                cx="175" 
                cy="175" 
                r="70" 
                stroke="#5750F1" 
                strokeWidth="20" 
                fill="white"
                className="dark:fill-gray-800" 
              />
              <line 
                x1="225" 
                y1="225" 
                x2="280" 
                y2="280" 
                stroke="#5750F1" 
                strokeWidth="20" 
                strokeLinecap="round" 
              />
            </g>
  
            {/* Floating Documents */}
            <g className="animate-bounce">
              <rect 
                x="120" 
                y="140" 
                width="40" 
                height="50" 
                rx="4" 
                fill="#5750F1" 
                opacity="0.3" 
              />
              <rect 
                x="180" 
                y="160" 
                width="40" 
                height="50" 
                rx="4" 
                fill="#5750F1" 
                opacity="0.5" 
              />
              <rect 
                x="150" 
                y="180" 
                width="40" 
                height="50" 
                rx="4" 
                fill="#5750F1" 
                opacity="0.7" 
              />
            </g>
  
            {/* Search Rings */}
            {isSearching && (
              <>
                <circle 
                  cx="200" 
                  cy="200" 
                  r="120" 
                  stroke="#5750F1" 
                  strokeWidth="2" 
                  className="animate-ping opacity-75" 
                />
                <circle 
                  cx="200" 
                  cy="200" 
                  r="150" 
                  stroke="#5750F1" 
                  strokeWidth="2" 
                  className="animate-ping opacity-50" 
                />
              </>
            )}
          </svg>
        </div>
  
        {/* Text Content */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            {searchCount > 0 ? funnyMessages[searchCount % funnyMessages.length] : message}
          </p>
        </div>
  
        {/* Action Buttons */}
        <div className="flex gap-4">
          <ButtonDefault
            label="Keep Searching"
            onClick={handleSearch}
            variant="primary"
            disabled={isSearching}
            icon={<BiSearchAlt2 className="h-5 w-5" />}
          />
          
          {showRefresh && (
            <ButtonDefault
              label="Refresh"
              onClick={handleRefresh}
              variant="outline"
              icon={<BiRefresh className={`h-5 w-5 ${isSearching ? 'animate-spin' : ''}`} />}
            />
          )}
        </div>
      </div>
    );
  };
  
  export default NoDataFound;
