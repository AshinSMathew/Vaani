"use client";

import React, { useState } from "react";
import { Copy, Check, Download, Search, FileText, Globe } from "lucide-react";
import { KeywordItem } from "@/types";

interface TranscriptPanelProps {
  transcript: string;
  language: string;
  keywords: KeywordItem[];
  highlightedKeyword?: string | null;
  onKeywordClick?: (term: string) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  transcript,
  language,
  keywords,
  highlightedKeyword,
  onKeywordClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const data = {
      transcript,
      language,
      wordCount,
      keywords: keywords.map((k) => ({
        term: k.term,
        score: k.score,
        category: k.category,
        count: k.count,
        explanation: k.explanation,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vaani-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render transcript with search / keyword highlighting
  const renderHighlightedTranscript = () => {
    if (!transcript) return null;

    const termToHighlight = searchQuery.trim() || highlightedKeyword || "";
    if (!termToHighlight) {
      return <span>{transcript}</span>;
    }

    try {
      const escaped = termToHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const parts = transcript.split(new RegExp(`(${escaped})`, "gi"));

      return parts.map((part, index) => {
        if (part.toLowerCase() === termToHighlight.toLowerCase()) {
          return (
            <mark
              key={index}
              className="bg-indigo-500/40 text-indigo-100 rounded px-1 py-0.5 font-medium"
            >
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      });
    } catch {
      return <span>{transcript}</span>;
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/10 p-6 shadow-xl flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Full Spoken Transcript
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span>{wordCount} words</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-500" />
                {language || "en-IN"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            aria-label="Copy transcript to clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            aria-label="Download transcript as text file"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>.TXT</span>
          </button>

          <button
            onClick={handleDownloadJson}
            aria-label="Download analysis as JSON"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative my-4">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search keywords in transcript..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/60 border border-white/10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Transcript Text Body */}
      <div className="flex-1 overflow-y-auto max-h-80 sm:max-h-96 pr-2 text-xs text-zinc-300 leading-relaxed font-sans select-text">
        {renderHighlightedTranscript()}
      </div>
    </div>
  );
};
