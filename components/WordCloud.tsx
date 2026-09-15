"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ListOrdered,
  LayoutGrid,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { KeywordItem, WordCategory, AnalysisResult } from "@/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { WordModal } from "./WordModal";
import { toPng } from "html-to-image";

interface WordCloudProps {
  result: AnalysisResult;
  onReset: () => void;
  onWordClick?: (term: string) => void;
}

export const WordCloud: React.FC<WordCloudProps> = ({
  result,
  onReset,
  onWordClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeWord, setActiveWord] = useState<KeywordItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"cloud" | "ranked" | "categories">("cloud");

  const cloudContainerRef = useRef<HTMLDivElement | null>(null);

  const { keywords, metadata } = result;

  // Filter keywords
  const filteredKeywords = keywords.filter((kw) => {
    if (selectedCategory === "all") return true;
    return kw.category === selectedCategory;
  });

  // Handle word selection
  const handleSelectWord = (kw: KeywordItem) => {
    setActiveWord(kw);
    if (onWordClick) {
      onWordClick(kw.term);
    }
  };

  // Download High-Resolution PNG
  const handleExportPng = async () => {
    if (!cloudContainerRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cloudContainerRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: "#09090b",
        pixelRatio: 2, // 2x Retina resolution
      });

      const link = document.createElement("a");
      link.download = `vaani-wordcloud-${metadata.filename.replace(/\.[^/.]+$/, "") || "session"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Get dynamic typography scale based on score/rank
  const getWordStyle = (kw: KeywordItem) => {
    const rank = kw.sizeRank || 3;
    const catTheme = CATEGORY_COLORS[kw.category] || CATEGORY_COLORS.general;

    switch (rank) {
      case 5: // Dominant Pillar
        return {
          fontSize: "text-2xl sm:text-4xl md:text-5xl",
          fontWeight: "font-black tracking-tight",
          padding: "px-4 py-2 sm:px-6 sm:py-3",
          border: "border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/20",
          glow: "bg-indigo-500/15 text-white hover:bg-indigo-500/25",
        };
      case 4: // High Importance
        return {
          fontSize: "text-lg sm:text-2xl md:text-3xl",
          fontWeight: "font-extrabold tracking-tight",
          padding: "px-3.5 py-1.5 sm:px-5 sm:py-2.5",
          border: `border ${catTheme.border} shadow-lg`,
          glow: `${catTheme.bg} ${catTheme.text} hover:opacity-100 opacity-95`,
        };
      case 3: // Medium Importance
        return {
          fontSize: "text-sm sm:text-lg md:text-xl",
          fontWeight: "font-bold",
          padding: "px-3 py-1 sm:px-4 sm:py-2",
          border: "border border-white/10",
          glow: `${catTheme.bg} ${catTheme.text} hover:opacity-100 opacity-90`,
        };
      case 2: // Small
        return {
          fontSize: "text-xs sm:text-sm md:text-base",
          fontWeight: "font-medium",
          padding: "px-2.5 py-1 sm:px-3 sm:py-1.5",
          border: "border border-white/5",
          glow: "bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800",
        };
      case 1: // Compact
      default:
        return {
          fontSize: "text-[11px] sm:text-xs",
          fontWeight: "font-normal",
          padding: "px-2 py-0.5 sm:px-2.5 sm:py-1",
          border: "border border-white/5",
          glow: "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200",
        };
    }
  };

  // Group keywords by category for category view
  const categoriesList: WordCategory[] = [
    "technology",
    "project",
    "skill",
    "concept",
    "goal",
    "theme",
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Word Context Inspector Modal */}
      <WordModal keyword={activeWord} onClose={() => setActiveWord(null)} />

      {/* Top Toolbar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {["all", ...categoriesList].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("cloud")}
              aria-label="Word cloud view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "cloud"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Editorial Word Cloud"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("ranked")}
              aria-label="Ranked list view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "ranked"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Ranked Impact List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("categories")}
              aria-label="Category column view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "categories"
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Grouped by Category"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Rendering..." : "Export PNG"}</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Analyze another</span>
          </button>
        </div>
      </div>

      {/* Main Exportable Container */}
      <div
        ref={cloudContainerRef}
        className="w-full glass-panel-glow rounded-3xl p-6 sm:p-10 border border-indigo-500/20 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Header Ribbon inside container */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 block mb-1">
              AI Semantic Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              Key Topics & Semantic Concepts
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-medium text-zinc-400">
              {filteredKeywords.length} topics found
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Method: {metadata.audioProcessingMethod} STT
            </span>
          </div>
        </div>

        {/* VIEW 1: Editorial Semantic Cloud */}
        {viewMode === "cloud" && (
          <div className="min-h-[340px] flex flex-wrap items-center justify-center gap-3 sm:gap-4.5 py-6">
            {filteredKeywords.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No keywords found in the selected category.
              </div>
            ) : (
              filteredKeywords.map((kw) => {
                const style = getWordStyle(kw);
                return (
                  <button
                    key={kw.id}
                    onClick={() => handleSelectWord(kw)}
                    className={`word-pill group rounded-2xl transition-all cursor-pointer ${style.fontSize} ${style.fontWeight} ${style.padding} ${style.border} ${style.glow}`}
                  >
                    <span className="inline-block transition-transform group-hover:scale-105">
                      {kw.term}
                    </span>
                    <span className="ml-2 text-[10px] font-mono font-normal opacity-60 group-hover:opacity-100 transition-opacity">
                      {Math.round(kw.score * 100)}%
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* VIEW 2: Ranked Impact List */}
        {viewMode === "ranked" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
            {filteredKeywords.map((kw, index) => {
              const catTheme = CATEGORY_COLORS[kw.category] || CATEGORY_COLORS.general;
              return (
                <div
                  key={kw.id}
                  onClick={() => handleSelectWord(kw)}
                  className="p-4 rounded-xl bg-zinc-900/70 border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 text-xs font-mono font-bold text-zinc-500">
                      #{index + 1}
                    </span>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-zinc-100 truncate group-hover:text-indigo-300">
                        {kw.term}
                      </h4>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${catTheme.badge}`}>
                        {kw.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-indigo-400">
                      {Math.round(kw.score * 100)}%
                    </span>
                    <span className="text-[10px] text-zinc-500 block font-mono">
                      {kw.count} mentions
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: Grouped by Categories */}
        {viewMode === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {categoriesList.map((cat) => {
              const catKeywords = keywords.filter((k) => k.category === cat);
              if (catKeywords.length === 0) return null;
              const catTheme = CATEGORY_COLORS[cat];

              return (
                <div
                  key={cat}
                  className="rounded-2xl bg-zinc-900/60 border border-white/5 p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${catTheme.badge}`}>
                      {cat}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {catKeywords.length} topics
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {catKeywords.map((kw) => (
                      <button
                        key={kw.id}
                        onClick={() => handleSelectWord(kw)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${catTheme.bg} ${catTheme.text} ${catTheme.border} hover:scale-105`}
                      >
                        {kw.term}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Hint */}
        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click any term to inspect AI reasoning, context quote, and score breakdown.</span>
          </div>
          <span className="font-mono text-[11px]">
            vaani.+ · Powered by Sarvam Saaras v4
          </span>
        </div>
      </div>
    </div>
  );
};
