import React, { useState, useRef, useEffect } from "react";
import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";

const AudioPlayer = ({ audioFile }: { audioFile: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setCurrentTime(formatTime(current));
      setProgress((current / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const progressBarWidth = progressBarRef.current.offsetWidth;
      const percentage = (clickPosition / progressBarWidth) * 100;
      const newTime = (percentage / 100) * audioRef.current.duration;

      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  const handleProgressBarDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) {
      // Left mouse button is pressed
      handleProgressBarClick(e);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    // Cleanup function
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, []);

  return (
    <div className="flex w-full max-w-md items-center gap-3">
      <button
        onClick={togglePlay}
        className="flex-shrink-0 text-primary hover:text-primary/80"
      >
        {isPlaying ? (
          <PauseCircleOutlined className="text-xl" />
        ) : (
          <PlayCircleOutlined className="text-xl" />
        )}
      </button>

      <div className="relative flex-1">
        <audio
          ref={audioRef}
          src={`https://cdn.freesound.org/previews/771/771700_5674468-lq.mp3`}
          //   src={
          //     audioFile
          //       ? `/api/audio/${audioFile}`
          //       : `https://file-examples.com/storage/fe83e8a190674337794c387/2017/11/file_example_MP3_700KB.mp3`
          //   }
          //   src={`/api/audio/${audioFile}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        <div
          ref={progressBarRef}
          className="group relative h-2 w-full cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700"
          onClick={handleProgressBarClick}
          onMouseMove={handleProgressBarDrag}
        >
          {/* Progress bar */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />

          {/* Hover effect and draggable handle */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
            style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>
      </div>

      <span className="min-w-[85px] -ml-3 flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
        {currentTime} / {duration}
      </span>
    </div>
  );
};

export default AudioPlayer;
