"use client";

import React from "react";
import { Sparkles, FileAudio, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onLoadSample?: () => void;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, isProcessing }) => {
  return (
    <header className="w-full border-b border-white/6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-linear-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                vaani<span className="text-indigo-400 font-mono">.+</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Saaras v4
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Turn conversations into visual semantic summaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 transition-all hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Load a pre-configured sample mentorship session"
            >
              <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load sample session</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 border-l border-white/10 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Server-Side AI</span>
          </div>
        </div>
      </div>
    </header>
  );
};
