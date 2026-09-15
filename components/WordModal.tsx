"use client";

import React, { useEffect } from "react";
import { X, Sparkles, Quote, Hash, BrainCircuit, Layers, Tag } from "lucide-react";
import { KeywordItem } from "@/types";
import { CATEGORY_COLORS } from "@/lib/constants";

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

  const categoryTheme = CATEGORY_COLORS[keyword.category] || CATEGORY_COLORS.general;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg glass-panel-glow rounded-2xl border border-white/10 p-6 sm:p-8 relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close word details"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${categoryTheme.badge} ${categoryTheme.border}`}
          >
            {keyword.category}
          </span>
          <span className="text-xs font-mono text-zinc-500">
            Rank #{keyword.sizeRank ? 6 - keyword.sizeRank : 1}
          </span>
        </div>

        {/* Word Title */}
        <h2
          id="word-modal-title"
          className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight mb-2"
        >
          {keyword.term}
        </h2>

        {/* AI Rationale */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 mb-6 text-xs text-indigo-200 flex items-start gap-2.5">
          <BrainCircuit className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-indigo-300 block mb-0.5">
              Why this word mattered:
            </span>
            {keyword.explanation || "Identified as a critical thematic anchor in this audio discussion."}
          </div>
        </div>

        {/* Hybrid Score Breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
              Overall Score
            </span>
            <span className="text-xl font-bold font-mono text-indigo-400">
              {Math.round(keyword.score * 100)}%
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
              Mentions
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {keyword.count}x
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
              Semantic AI
            </span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              {Math.round(keyword.semanticScore * 100)}%
            </span>
          </div>
        </div>

        {/* Spoken Context Quote */}
        {keyword.contextSnippet && (
          <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-1.5">
              <Quote className="w-3.5 h-3.5 text-indigo-400" />
              <span>Spoken in discussion:</span>
            </div>
            <p className="text-xs text-zinc-300 italic leading-relaxed">
              "{keyword.contextSnippet}"
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
