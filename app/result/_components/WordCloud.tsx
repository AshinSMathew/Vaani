"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Download,
  RotateCcw,
  ListOrdered,
  LayoutGrid,
  RefreshCw,
  Palette,
  Check,
} from "lucide-react";
import { KeywordItem, AnalysisResult } from "@/types";
import { WordModal } from "./WordModal";
import { TemplateNeonCyan, TemplateRef } from "./templates/TemplateNeonCyan";
import { TemplateMidnightGold } from "./templates/TemplateMidnightGold";
import { TemplateSlateTeal } from "./templates/TemplateSlateTeal";
import { TemplateEditorialOrange } from "./templates/TemplateEditorialOrange";

export type TemplateId = "neon-cyan" | "midnight-gold" | "slate-teal" | "editorial-orange";

interface TemplateOption {
  id: TemplateId;
  name: string;
  tagline: string;
  image: string;
  themeBadge: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "neon-cyan",
    name: "Neon Cyan",
    tagline: "Electric cyan on dark ground",
    image: "/NeonCyan.png",
    themeBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    tagline: "Golden hero & amber spectrum",
    image: "/MidnightOrange.png",
    themeBadge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "slate-teal",
    name: "Slate Corporate",
    tagline: "Navy & mint teal on slate",
    image: "/slateTeal.png",
    themeBadge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  {
    id: "editorial-orange",
    name: "Editorial Orange",
    tagline: "Terracotta & warm amber",
    image: "/EditorialOrange.png",
    themeBadge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
];

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
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("neon-cyan");
  const [activeWord, setActiveWord] = useState<KeywordItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"cloud" | "ranked">("cloud");
  const [cloudSeed, setCloudSeed] = useState(0);
  const [placedCount, setPlacedCount] = useState<number>(0);

  const activeTemplateRef = useRef<TemplateRef | null>(null);

  const { keywords, metadata } = result;

  const handleSelectWord = (kw: KeywordItem) => {
    setActiveWord(kw);
    if (onWordClick) onWordClick(kw.term);
  };

  const handleRenderComplete = useCallback((count: number) => {
    setPlacedCount(count);
  }, []);

  const handleExportPng = async () => {
    const canvas = activeTemplateRef.current?.getCanvas();
    if (!canvas) return;
    setIsExporting(true);

    try {
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      const baseName = metadata.filename.replace(/\.[^/.]+$/, "") || "session";
      link.download = `vaani-${selectedTemplate}-${baseName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export PNG failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <WordModal keyword={activeWord} onClose={() => setActiveWord(null)} />

      {/* Top Action & View Switcher Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/8 mb-6">
        <div className="flex items-center gap-3">
          <span className="mono-eyebrow text-[#6366F1]">
            04 · VISUALIZATION MATRIX
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">//</span>
          <span className="mono-meta">
            {keywords.length} SEMANTIC VECTORS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-px bg-white/8 p-px">
            <button
              onClick={() => setViewMode("cloud")}
              aria-label="Word cloud view"
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "cloud"
                  ? "bg-[#6366F1] text-white font-medium"
                  : "bg-[#0F0F11] text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              <span>CLOUD</span>
            </button>
            <button
              onClick={() => setViewMode("ranked")}
              aria-label="Ranked list view"
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === "ranked"
                  ? "bg-[#6366F1] text-white font-medium"
                  : "bg-[#0F0F11] text-zinc-400 hover:text-white"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              <span>LIST</span>
            </button>
          </div>

          {viewMode === "cloud" && (
            <button
              onClick={() => setCloudSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300 bg-[#0F0F11] hover:bg-[#18181B] hover:text-white border border-white/8 transition-colors cursor-pointer"
              title="Shuffle layout coordinates"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">SHUFFLE</span>
            </button>
          )}

          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white bg-[#6366F1] hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "EXPORTING..." : "EXPORT 2X PNG"}</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white bg-[#0F0F11] hover:bg-[#18181B] border border-white/8 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>
      </div>

      {/* 4-Template Selection Strip */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-[#6366F1]" />
            <span className="mono-eyebrow text-zinc-300">
              ENGINE THEME TEMPLATES
            </span>
          </div>
          <span className="mono-eyebrow text-[10px] text-zinc-500">
            [ SELECT TO RE-RENDER ]
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 border border-white/8">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-3 text-left transition-colors cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#18181B] border-t-2 border-t-[#6366F1]"
                    : "bg-[#0F0F11] hover:bg-[#141416]"
                }`}
              >
                <div className="relative w-full aspect-16/10 overflow-hidden mb-2.5 bg-[#0A0A0A] border border-white/6">
                  <Image
                    src={tmpl.image}
                    alt={tmpl.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#6366F1] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}>
                      {tmpl.name}
                    </span>
                  </div>
                  <p className="font-mono text-[9px] text-zinc-500 truncate mt-0.5">
                    {tmpl.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Cloud Canvas & Matrix Display */}
      <div className="w-full hairline-panel border border-white/8">
        <div className="flex items-center justify-between border-b border-white/8 p-4 sm:px-6">
          <div>
            <span className="mono-eyebrow text-[#6366F1] block mb-0.5">
              ACTIVE CANVAS ENGINE
            </span>
            <h2 className="text-lg font-light text-white tracking-tight">
              {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
            </h2>
          </div>
          <div className="text-right font-mono text-[10px] text-zinc-400">
            <div>{placedCount} / {keywords.length} VECTORS PLACED</div>
            <div className="text-zinc-600 uppercase">ZERO-COLLISION LAYOUT</div>
          </div>
        </div>

        {viewMode === "cloud" && (
          <div className="p-4 sm:p-6 bg-[#0A0A0A]">
            {selectedTemplate === "neon-cyan" && (
              <TemplateNeonCyan
                ref={activeTemplateRef}
                keywords={keywords}
                seed={cloudSeed}
                onWordClick={handleSelectWord}
                onRenderComplete={handleRenderComplete}
              />
            )}

            {selectedTemplate === "midnight-gold" && (
              <TemplateMidnightGold
                ref={activeTemplateRef}
                keywords={keywords}
                seed={cloudSeed}
                onWordClick={handleSelectWord}
                onRenderComplete={handleRenderComplete}
              />
            )}

            {selectedTemplate === "slate-teal" && (
              <TemplateSlateTeal
                ref={activeTemplateRef}
                keywords={keywords}
                seed={cloudSeed}
                onWordClick={handleSelectWord}
                onRenderComplete={handleRenderComplete}
              />
            )}

            {selectedTemplate === "editorial-orange" && (
              <TemplateEditorialOrange
                ref={activeTemplateRef}
                keywords={keywords}
                seed={cloudSeed}
                onWordClick={handleSelectWord}
                onRenderComplete={handleRenderComplete}
              />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-3 border-t border-white/6 font-mono text-[10px] text-zinc-500 gap-2">
              <span>INTERACTION: CLICK ANY TERM TO INSPECT SEMANTIC METRICS</span>
              <span>OUTPUT: 2X LOSSLESS VECTOR RENDER</span>
            </div>
          </div>
        )}

        {viewMode === "ranked" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8 p-px">
            {keywords.map((kw, index) => (
              <div
                key={kw.id}
                onClick={() => handleSelectWord(kw)}
                className="p-4 bg-[#0F0F11] hover:bg-[#18181B] transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="font-mono text-[11px] text-zinc-600">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-medium text-zinc-200 truncate">
                      {kw.term}
                    </h4>
                    <span className="mono-eyebrow text-[9px] text-zinc-500">
                      {kw.category}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-xs text-[#6366F1] font-medium">
                    {Math.round(kw.score * 100)}%
                  </span>
                  <span className="text-[10px] text-zinc-600 block">
                    {kw.count}X
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
