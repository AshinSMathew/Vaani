"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { WordCloud } from "@/components/WordCloud";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { ShaderRibbons } from "@/components/ShaderRibbons";
import { AnalysisResult } from "@/types";

export default function ResultPage() {
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("vaani_analysis_result");
      if (stored) {
        const parsed = JSON.parse(stored) as AnalysisResult;
        setAnalysisResult(parsed);
      }
    } catch (e) {
      console.error("Failed to load analysis result:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    sessionStorage.removeItem("vaani_analysis_result");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 border border-[#6366F1] border-t-transparent animate-spin" />
          <span className="text-zinc-400">LOADING ANALYSIS RESULT...</span>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="min-h-screen relative bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 selection:bg-[#6366F1]/30">
        <ShaderRibbons />
        <div className="relative z-10 hairline-panel p-8 max-w-md w-full text-center border border-white/8 bg-[#0F0F11]">
          <span className="mono-eyebrow text-zinc-500 block mb-2">
            NO ACTIVE ANALYSIS FOUND
          </span>
          <h2 className="text-2xl font-light text-white mb-3">
            No Session Data
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
            Upload or record audio to generate semantic word clouds and topic transcripts.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] hover:bg-[#4338CA] font-mono text-[11px] uppercase tracking-widest text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO HOME</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0A0A0A] text-white selection:bg-[#6366F1]/30 selection:text-indigo-200">
      {/* WebGL Fragment Shader Background */}
      <ShaderRibbons />

      {/* Clean Minimal Top Navigation */}
      <header className="w-full border-b border-white/8 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-sans font-medium text-base tracking-tight text-white group-hover:text-zinc-200">
              VAANI<span className="text-[#6366F1]">.</span>
            </span>
            <span className="mono-eyebrow border-l border-white/8 pl-2 text-[10px] text-zinc-500 hidden sm:inline">
              SEMANTIC INSIGHT MATRIX
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-300 bg-[#0F0F11] hover:bg-[#18181B] hover:text-white border border-white/8 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>NEW ANALYSIS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Result Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
        <WordCloud
          result={analysisResult}
          onReset={handleReset}
          onWordClick={(term) => setHighlightedKeyword(term)}
        />

        <div className="w-full">
          <TranscriptPanel
            transcript={analysisResult.transcript}
            language={analysisResult.language}
            keywords={analysisResult.keywords}
            highlightedKeyword={highlightedKeyword}
          />
        </div>
      </main>
    </div>
  );
}
