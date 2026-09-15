"use client";

import React from "react";
import { FileAudio } from "lucide-react";

interface HeaderProps {
  onLoadSample?: () => void;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, isProcessing }) => {
  return (
    <header className="w-full border-b border-white/8 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sans font-medium text-base tracking-tight text-white">
              VAANI<span className="text-[#6366F1]">.</span>
            </span>
            <span className="mono-eyebrow border-l border-white/8 pl-2 text-[10px] text-zinc-500 hidden sm:inline">
              SARVAM SAARAS V4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-300 bg-[#0F0F11] hover:bg-[#18181B] hover:text-white border border-white/10 hover:border-[#6366F1]/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Load pre-configured sample audio session"
            >
              <FileAudio className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>LOAD SAMPLE</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-500">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span className="hidden md:inline uppercase">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
