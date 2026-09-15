"use client";

import React, { useEffect } from "react";
import { X, Quote, BrainCircuit } from "lucide-react";
import { KeywordItem } from "@/types";

interface WordModalProps {
  keyword: KeywordItem | null;
  onClose: () => void;
}

export const WordModal: React.FC<WordModalProps> = ({ keyword, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!keyword) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg hairline-panel p-6 sm:p-8 relative border border-white/12 bg-[#0F0F11]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close word details"
          className="absolute top-4 right-4 w-8 h-8 bg-[#0A0A0A] hover:bg-[#18181B] text-zinc-400 hover:text-white flex items-center justify-center border border-white/8 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <span className="mono-eyebrow text-[#6366F1] px-2 py-0.5 bg-[#6366F1]/10 border border-[#6366F1]/20">
            {keyword.category}
          </span>
          <span className="font-mono text-[10px] text-zinc-500">
            SIZE WEIGHT #{keyword.sizeRank ? 6 - keyword.sizeRank : 1}
          </span>
        </div>

        <h2
          id="word-modal-title"
          className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-4"
        >
          {keyword.term}
        </h2>

        <div className="hairline-panel-subtle p-4 mb-6 text-xs text-zinc-300 flex items-start gap-3 border border-white/8">
          <BrainCircuit className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="mono-eyebrow text-zinc-400 block mb-1">
              SEMANTIC SIGNIFICANCE
            </span>
            {keyword.explanation || "Identified as a core thematic anchor in acoustic transcription analysis."}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-white/8 mb-6 border border-white/8">
          <div className="bg-[#0A0A0A] p-3 text-center">
            <span className="mono-eyebrow text-[9px] text-zinc-500 block mb-0.5">
              HYBRID SCORE
            </span>
            <span className="text-lg font-light font-mono text-[#6366F1]">
              {Math.round(keyword.score * 100)}%
            </span>
          </div>

          <div className="bg-[#0A0A0A] p-3 text-center">
            <span className="mono-eyebrow text-[9px] text-zinc-500 block mb-0.5">
              FREQUENCY
            </span>
            <span className="text-lg font-light font-mono text-emerald-400">
              {keyword.count}X
            </span>
          </div>

          <div className="bg-[#0A0A0A] p-3 text-center">
            <span className="mono-eyebrow text-[9px] text-zinc-500 block mb-0.5">
              SEMANTIC AI
            </span>
            <span className="text-lg font-light font-mono text-cyan-400">
              {Math.round(keyword.semanticScore * 100)}%
            </span>
          </div>
        </div>

        {keyword.contextSnippet && (
          <div className="hairline-panel-subtle p-4 mb-6 border border-white/6">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 mb-1">
              <Quote className="w-3 h-3 text-[#6366F1]" />
              <span>SPOKEN CONTEXT:</span>
            </div>
            <p className="text-xs text-zinc-300 italic font-sans leading-relaxed">
              &ldquo;{keyword.contextSnippet}&rdquo;
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#0A0A0A] hover:bg-[#18181B] border border-white/8 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition-colors cursor-pointer"
        >
          DISMISS INSPECTOR
        </button>
      </div>
    </div>
  );
};
