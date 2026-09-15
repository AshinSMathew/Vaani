"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  RotateCcw,
  Layers,
  ListOrdered,
  LayoutGrid,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import cloud from "d3-cloud";
import { KeywordItem, WordCategory, AnalysisResult } from "@/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { WordModal } from "./WordModal";

interface WordCloudProps {
  result: AnalysisResult;
  onReset: () => void;
  onWordClick?: (term: string) => void;
}

// Curated color palette — warm earthy tones + accents like the reference image
const PALETTE = [
  "#c0652a", "#d4841f", "#b5651d", "#e8883a",  // warm oranges / browns
  "#3a7d44", "#4e9a51", "#2d6a3f", "#5fb663",  // greens
  "#7b4f8a", "#9b59b6", "#6c3d7a",              // purples
  "#2e7d9c", "#3498db", "#1a6585",              // blues
  "#c0392b", "#a93226",                          // reds
  "#636e72", "#7f8c8d", "#4a5568",              // warm grays
  "#d4a841", "#b8860b",                          // golds
];

interface LayoutWord {
  text: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  font: string;
  weight: string;
  color: string;
  score: number;
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
  const [cloudSeed, setCloudSeed] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [layoutWords, setLayoutWords] = useState<LayoutWord[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { keywords, metadata } = result;

  const filteredKeywords = keywords.filter((kw) => {
    if (selectedCategory === "all") return true;
    return kw.category === selectedCategory;
  });

  const handleSelectWord = (kw: KeywordItem) => {
    setActiveWord(kw);
    if (onWordClick) onWordClick(kw.term);
  };

  // Seeded PRNG for deterministic but shuffleable layouts
  const seededRandom = useCallback((seed: number) => {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }, []);

  // Run d3-cloud layout and then paint onto canvas
  const generateWordCloud = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const uniqueKeywords = filteredKeywords;
    if (uniqueKeywords.length === 0) {
      // Clear canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = container.clientWidth;
        const h = 500;
        canvas.width = w * 2;
        canvas.height = h * 2;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(2, 2);
        ctx.fillStyle = "#faf9f6";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#999";
        ctx.font = "15px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No keywords found for selected category.", w / 2, h / 2);
      }
      setLayoutWords([]);
      return;
    }

    setIsGenerating(true);

    const width = container.clientWidth;
    const height = Math.max(480, Math.min(640, width * 0.5));

    // Font sizes — scale based on score
    const maxScore = uniqueKeywords[0]?.score || 1;
    const minScore = uniqueKeywords[uniqueKeywords.length - 1]?.score || 0;
    const range = maxScore - minScore || 1;
    const minFont = Math.max(11, width / 75);
    const maxFont = Math.max(44, Math.min(80, width / 12));

    const rng = seededRandom(cloudSeed + 17);

    // Assign colors deterministically
    const wordData = uniqueKeywords.map((kw) => {
      const normalized = (kw.score - minScore) / range;
      const fontSize = minFont + normalized * (maxFont - minFont);
      const colorIdx = Math.floor(rng() * PALETTE.length);
      return {
        text: kw.term,
        size: fontSize,
        score: kw.score,
        color: PALETTE[colorIdx],
      };
    });

    // Use d3-cloud for layout computation
    const layout = cloud()
      .size([width, height])
      .words(wordData.map((d) => ({ ...d })))
      .padding(3)
      .rotate(() => {
        const r = rng();
        // 65% horizontal, 35% vertical — like the reference
        return r < 0.65 ? 0 : 90;
      })
      .font("'Georgia', 'Cambria', 'Times New Roman', serif")
      .fontWeight((d: { size?: number }) => {
        const s = d.size || 20;
        if (s > maxFont * 0.65) return "900";
        if (s > maxFont * 0.4) return "700";
        return "600";
      })
      .fontSize((d: { size?: number }) => d.size || 16)
      .spiral("archimedean")
      .random(rng)
      .on("end", (words: Array<{ text?: string; size?: number; x?: number; y?: number; rotate?: number; font?: string; weight?: string; color?: string; score?: number }>) => {
        // Paint the canvas
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.scale(scale, scale);

        // Background — warm off-white like the reference image
        ctx.fillStyle = "#faf9f6";
        ctx.fillRect(0, 0, width, height);

        const placed: LayoutWord[] = [];

        for (const w of words) {
          if (!w.text || w.x === undefined || w.y === undefined) continue;

          const fontSize = w.size || 16;
          const fontWeight = w.weight || "600";
          const fontFamily = w.font || "'Georgia', serif";
          const rotation = w.rotate || 0;
          const color = (w as { color?: string }).color || "#333";

          ctx.save();
          ctx.translate(width / 2 + w.x, height / 2 + w.y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillStyle = color;
          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(w.text, 0, 0);
          ctx.restore();

          placed.push({
            text: w.text,
            size: fontSize,
            x: w.x,
            y: w.y,
            rotate: rotation,
            font: fontFamily,
            weight: fontWeight,
            color,
            score: (w as { score?: number }).score || 0,
          });
        }

        setLayoutWords(placed);
        setIsGenerating(false);
      });

    layout.start();
  }, [filteredKeywords, cloudSeed, seededRandom]);

  // Regenerate when view/filters/seed change
  useEffect(() => {
    if (viewMode === "cloud") {
      const timer = setTimeout(() => generateWordCloud(), 80);
      return () => clearTimeout(timer);
    }
  }, [viewMode, selectedCategory, cloudSeed, generateWordCloud]);

  // Download PNG
  const handleExportPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    try {
      const dataUrl = canvas.toDataURL("image/png", 1.0);
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

  const categoriesList: WordCategory[] = [
    "technology", "project", "skill", "concept", "goal", "theme",
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <WordModal keyword={activeWord} onClose={() => setActiveWord(null)} />

      {/* Toolbar */}
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

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("cloud")}
              aria-label="Word cloud view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "cloud" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("ranked")}
              aria-label="Ranked list view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "ranked" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("categories")}
              aria-label="Category column view"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "categories" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {viewMode === "cloud" && (
            <button
              onClick={() => setCloudSeed((s) => s + 1)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Shuffle layout"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          )}

          <button
            onClick={handleExportPng}
            disabled={isExporting || isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Saving..." : "Download PNG"}</span>
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

      {/* Main Panel */}
      <div className="w-full glass-panel-glow rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6 sm:px-10 sm:pt-8 sm:pb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 block mb-1">
              <Sparkles className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              AI Semantic Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
              Word Cloud
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-medium text-zinc-400">
              {filteredKeywords.length} unique topics
            </span>
            <span className="text-[10px] text-zinc-500 block">
              {metadata.audioProcessingMethod} · Saaras v4
            </span>
          </div>
        </div>

        {/* Cloud View */}
        {viewMode === "cloud" && (
          <div ref={containerRef} className="p-4 sm:p-6">
            <div className="relative rounded-2xl overflow-hidden bg-[#faf9f6] shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full block"
                style={{ minHeight: 420 }}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#faf9f6]/80">
                  <div className="flex items-center gap-2 text-zinc-600 text-sm font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-[11px] text-zinc-500 mt-3">
              {layoutWords.length} words placed · Click &ldquo;Download PNG&rdquo; to save as image
            </p>
          </div>
        )}

        {/* Ranked View */}
        {viewMode === "ranked" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6 sm:p-10">
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
                      {kw.count}x
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Categories View */}
        {viewMode === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 sm:p-10">
            {categoriesList.map((cat) => {
              const catKeywords = keywords.filter((k) => k.category === cat);
              if (catKeywords.length === 0) return null;
              const catTheme = CATEGORY_COLORS[cat];
              return (
                <div key={cat} className="rounded-2xl bg-zinc-900/60 border border-white/5 p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${catTheme.badge} ${catTheme.border}`}>
                      {cat}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">{catKeywords.length}</span>
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

        {/* Footer */}
        <div className="px-6 sm:px-10 pb-6 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch to ranked or category view to inspect individual terms.</span>
          </div>
          <span className="font-mono text-[11px]">
            vaani.+ · Sarvam Saaras v4
          </span>
        </div>
      </div>
    </div>
  );
};
