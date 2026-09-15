"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Sparkles, Music, HardDrive, Clock } from "lucide-react";
import { formatBytes, formatDuration } from "@/lib/validation";

interface AudioPreviewProps {
  file: File;
  duration: number;
  onReplace: () => void;
  onAnalyse: () => void;
  isProcessing?: boolean;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  file,
  duration,
  onReplace,
  onAnalyse,
  isProcessing,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const totalDuration = duration || (audioRef.current?.duration ? Math.round(audioRef.current.duration) : 0);

  return (
    <div className="w-full max-w-4xl mx-auto hairline-panel p-6 sm:p-8">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          className="hidden"
        />
      )}

      {/* Header / Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8 mb-6">
        <div className="flex items-center gap-3">
          <span className="mono-eyebrow text-[#6366F1]">
            02 · STAGED FOR ANALYSIS
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">//</span>
          <span className="mono-meta">
            CONTAINER READY
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 bg-emerald-400" />
          <span>PAYLOAD VERIFIED [ OK ]</span>
        </div>
      </div>

      {/* Audio Info */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 bg-[#0A0A0A] border border-white/8 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-base font-medium text-white truncate font-sans">
              {file.name}
            </h3>
            <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400 mt-1">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                {formatBytes(file.size)}
              </span>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrubber / Player Controls */}
      <div className="hairline-panel-subtle p-4 sm:p-5 mb-8 border border-white/8">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause recording preview" : "Play recording preview"}
            className="w-10 h-10 bg-[#6366F1] hover:bg-[#4338CA] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex flex-col gap-1.5">
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio timeline position"
              className="w-full h-1.5 bg-zinc-800 appearance-none cursor-pointer accent-[#6366F1]"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-500">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onReplace}
          disabled={isProcessing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-zinc-300 bg-[#0A0A0A] hover:bg-[#18181B] hover:text-white border border-white/8 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REPLACE AUDIO</span>
        </button>

        <button
          onClick={onAnalyse}
          disabled={isProcessing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white bg-[#6366F1] hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Sparkles className="w-4 h-4" />
          <span>EXECUTE AI SYNTHESIS</span>
        </button>
      </div>
    </div>
  );
};
