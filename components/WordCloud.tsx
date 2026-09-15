"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Download,
  RotateCcw,
  ListOrdered,
  LayoutGrid,
  Info,
  RefreshCw,
  Sparkles,
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
    tagline: "Electric cyan & white on black",
    image: "/NeonCyan.png",
    themeBadge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    tagline: "Golden hero & warm ember",
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
    tagline: "Terracotta & amber on white",
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

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-zinc-400">
            {keywords.length} extracted semantic keywords & phrases
          </span>
        </div>

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
          </div>

          {viewMode === "cloud" && (
            <button
              onClick={() => setCloudSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Shuffle layout arrangement"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          )}

          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Download PNG"}</span>
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

      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Select Design Template
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Click template to apply style
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`relative rounded-2xl p-2.5 text-left transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? "bg-zinc-900/90 border-indigo-500 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/50 scale-[1.02]"
                    : "bg-zinc-950/80 border-white/10 hover:border-white/25 hover:bg-zinc-900/60 hover:scale-[1.01]"
                }`}
              >
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-white/10 shadow-inner">
                  <Image
                    src={tmpl.image}
                    alt={tmpl.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white/20 animate-in zoom-in-50 duration-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-md border backdrop-blur-md ${tmpl.themeBadge}`}
                    >
                      {tmpl.name}
                    </span>
                  </div>
                </div>

                <div className="px-1 pb-1">
                  <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white flex items-center justify-between">
                    <span>{tmpl.name}</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {tmpl.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full glass-panel-glow rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 p-6 sm:px-10 sm:pt-8 sm:pb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 block mb-1">
              <Sparkles className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              AI Semantic Word Cloud
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
              <span>{TEMPLATES.find((t) => t.id === selectedTemplate)?.name}</span>
              <span className="text-xs font-mono font-normal text-zinc-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                Template
              </span>
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-medium text-zinc-300">
              {keywords.length} topics & phrases
            </span>
            <span className="text-[10px] text-zinc-500 block font-mono">
              {metadata.audioProcessingMethod} · Saaras v4
            </span>
          </div>
        </div>

        {viewMode === "cloud" && (
          <div className="p-4 sm:p-6">
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

            <div className="flex flex-col sm:flex-row items-center justify-between mt-3 text-[11px] text-zinc-500 gap-2 px-1">
              <span>{placedCount} terms placed with zero overlap · Click any word on cloud to inspect</span>
              <span className="font-mono">High-DPI 2x Lossless PNG Export</span>
            </div>
          </div>
        )}

        {viewMode === "ranked" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6 sm:p-10">
            {keywords.map((kw, index) => (
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
            ))}
          </div>
        )}

        <div className="px-6 sm:px-10 pb-6 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click any word to see semantic relevance scores and discussion context.</span>
          </div>
          <span className="font-mono text-[11px]">
            vaani.+ · Sarvam Saaras v4
          </span>
        </div>
      </div>
    </div>
  );
};
