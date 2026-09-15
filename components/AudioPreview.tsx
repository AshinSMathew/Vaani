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
    <div className="w-full max-w-xl mx-auto glass-panel-glow rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl">
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

      {/* File Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Music className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-base font-semibold text-zinc-100 truncate">
              {file.name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                {formatBytes(file.size)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          Ready
        </span>
      </div>

      {/* Interactive Waveform / Scrubber Bar */}
      <div className="bg-zinc-950/70 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause recording preview" : "Play recording preview"}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Progress Timeline & Slider */}
          <div className="flex-1 flex flex-col gap-1.5">
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Audio timeline position"
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onReplace}
          disabled={isProcessing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Replace audio</span>
        </button>

        <button
          onClick={onAnalyse}
          disabled={isProcessing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyse Recording</span>
        </button>
      </div>
    </div>
  );
};
