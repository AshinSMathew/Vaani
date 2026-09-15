"use client";

import React, { useEffect, useState, useRef } from "react";
import { AppState } from "@/types";
import { Sparkles, Cpu, Clock, Activity } from "lucide-react";

interface AnalysisProgressProps {
  state: AppState;
  filename?: string;
  duration?: number;
}

const AI_THOUGHT_STREAM = [
  "Validating audio container headers and waveform integrity...",
  "Streaming acoustic tensors through Sarvam Saaras v4 STT...",
  "Aligning phonemes and multi-speaker transcription tokens...",
  "Evaluating semantic context & extracting topic anchors...",
  "Filtering conversational filler terms and background noise...",
  "Computing hybrid TF-IDF and LLM semantic relevance scores...",
  "Calculating Archimedean spiral coordinates for zero overlap...",
  "Finalizing high-DPI vector typography matrix...",
];

const AI_INSIGHT_TIPS = [
  "Sarvam Saaras v4 acoustic models are optimized for Indian accent nuances and code-mixed speech.",
  "Hybrid scoring balances pure frequency (30%) with deep semantic relevance (50%) to isolate critical topics.",
  "The layout engine calculates exact font bounding boxes to guarantee zero text collision on export.",
  "Spoken filler words are automatically filtered so your word cloud reflects only core insights.",
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  state,
  filename,
  duration,
}) => {
  const [simulatedProgress, setSimulatedProgress] = useState(14);
  const [liveHz, setLiveHz] = useState(1420);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = [
    {
      idx: "01",
      id: "uploading",
      label: "Payload Validation",
      sublabel: "CONTAINER CHECK",
      desc: "Verifying binary headers, audio container signature, and 25 MB payload ceiling.",
      baseProgress: 24,
    },
    {
      idx: "02",
      id: "transcribing",
      label: "Sarvam Saaras STT",
      sublabel: "SPEECH-TO-TEXT",
      desc: duration && duration <= 30
        ? "Running synchronous REST acoustic model and phonetic alignment."
        : "Streaming chunked audio tensors through Sarvam Saaras v4 STT pipeline.",
      baseProgress: 58,
    },
    {
      idx: "03",
      id: "analyzing",
      label: "Semantic Extraction",
      sublabel: "LLM TOPIC MODEL",
      desc: "Sarvam Chat decomposing transcript into semantic concepts and relevance weights.",
      baseProgress: 88,
    },
    {
      idx: "04",
      id: "complete",
      label: "Vector Layout Engine",
      sublabel: "D3 CLOUD SYNTHESIS",
      desc: "Computing non-overlapping typography layout matrix with hybrid score weighting.",
      baseProgress: 100,
    },
  ];

  const getCurrentStageIndex = (): number => {
    switch (state) {
      case "uploading":
        return 0;
      case "transcribing":
        return 1;
      case "analyzing":
        return 2;
      case "complete":
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getCurrentStageIndex();
  const currentStage = stages[currentIndex];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedSec((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setThoughtIndex((prev) => (prev + 1) % AI_THOUGHT_STREAM.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % AI_INSIGHT_TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (state === "complete") {
          return 100;
        }

        if (state === "uploading") {
          if (prev < 24) return prev + 1.2;
          return Math.min(28, prev + 0.1);
        }

        if (state === "transcribing") {
          if (prev < 58) return prev + 0.8;
          return Math.min(65, prev + 0.12);
        }

        if (state === "analyzing") {
          if (prev < 85) return prev + 0.45;
          if (prev < 98.5) {
            const step = Math.max(0.04, (99 - prev) * 0.018);
            return prev + step;
          }
          return prev;
        }

        return prev;
      });

      setLiveHz(1200 + Math.floor(Math.sin(Date.now() * 0.004) * 650 + Math.random() * 120));
    }, 70);

    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const barCount = 54;

    const render = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const barWidth = w / barCount;
      const progressRatio = simulatedProgress / 100;
      const activeBarThreshold = Math.floor(barCount * progressRatio);

      for (let i = 0; i < barCount; i++) {
        const norm = i / barCount;
        const envelope = Math.sin(norm * Math.PI);
        const wave1 = Math.sin(norm * 14 + time * 2.8);
        const wave2 = Math.cos(norm * 9 - time * 2.2);
        const noise = Math.sin(norm * 36 + time * 6) * 0.25;

        let barHeight = (envelope * 0.65 + (wave1 + wave2) * 0.22 + noise + 0.35) * h * 0.88;
        barHeight = Math.max(2, Math.min(h - 2, barHeight));

        const x = i * barWidth;
        const y = h - barHeight;

        if (i <= activeBarThreshold) {
          ctx.fillStyle = i === activeBarThreshold ? "#FFFFFF" : "#6366F1";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        }

        ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);
      }

      const scanX = (Math.sin(time * 1.5) * 0.5 + 0.5) * w;
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fillRect(scanX - 1, 0, 2, h);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [simulatedProgress]);

  return (
    <div className="w-full max-w-4xl mx-auto hairline-panel p-6 sm:p-8">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/8 mb-6">
        <div className="flex items-center gap-3">
          <span className="mono-eyebrow text-[#6366F1] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse text-[#6366F1]" />
            <span>03 · LIVE AI PIPELINE</span>
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">//</span>
          <span className="mono-meta">
            STAGE 0{currentIndex + 1} OF 04
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 text-[#6366F1]">
            <Clock className="w-3 h-3 text-[#6366F1]" />
            <span>{elapsedSec.toFixed(1)}S ELAPSED</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-300">{liveHz} HZ</span>
          <span className="text-zinc-700">|</span>
          <span className="text-white font-medium">{simulatedProgress.toFixed(1)}%</span>
        </div>
      </div>

      {/* Dynamic Headline & Active Sub-Operation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-6">
        <div className="md:col-span-6">
          <span className="mono-eyebrow text-zinc-500 block mb-1">
            ACTIVE AI PROCESSING
          </span>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
            {currentStage.label}
          </h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            {currentStage.desc}
          </p>
        </div>

        {/* Live AI Thought Stream Box */}
        <div className="md:col-span-6 bg-[#0A0A0A] border border-white/8 p-4">
          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-2">
            <div className="flex items-center gap-1.5 text-[#6366F1]">
              <Cpu className="w-3 h-3 animate-spin" />
              <span>LIVE AI THOUGHT STREAM</span>
            </div>
            <span>[{thoughtIndex + 1}/{AI_THOUGHT_STREAM.length}]</span>
          </div>

          <div className="min-h-9.5 flex items-center">
            <p className="font-mono text-xs text-zinc-200 leading-snug">
              &gt; {AI_THOUGHT_STREAM[thoughtIndex]}
            </p>
          </div>
        </div>
      </div>

      {/* THE LOADING SLIDER SYSTEM */}
      <div className="hairline-panel-subtle p-5 sm:p-6 mb-6 border border-white/8">
        {/* Slider Meta Row */}
        <div className="flex items-center justify-between font-mono text-[11px] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">SPECTRAL ENGINE</span>
            <span className="text-zinc-700">/</span>
            <span className="text-[#6366F1] uppercase">{currentStage.sublabel}</span>
          </div>
          <div className="text-right">
            <span className="text-white font-medium">{simulatedProgress.toFixed(1)}</span>
            <span className="text-zinc-500">% COMPLETE</span>
          </div>
        </div>

        {/* Precision Progress Bar Track */}
        <div className="relative w-full h-2 bg-[#0A0A0A] border border-white/10 overflow-hidden mb-3">
          <div
            className="h-full bg-[#6366F1] transition-all duration-100 ease-out relative"
            style={{ width: `${simulatedProgress}%` }}
          >
            {/* White leading edge marker */}
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_#ffffff]" />
          </div>
        </div>

        {/* Live Audio Spectral Frequency Canvas */}
        <div className="w-full h-14 bg-[#0A0A0A] border border-white/6 p-1 mb-3">
          <canvas
            ref={canvasRef}
            width={600}
            height={56}
            className="w-full h-full block"
          />
        </div>

        {/* Ruler Tick Marks */}
        <div className="flex justify-between font-mono text-[9px] text-zinc-600 px-0.5">
          <span>00% · INGEST</span>
          <span>25% · VALID</span>
          <span>50% · STT</span>
          <span>75% · SEMANTICS</span>
          <span>100% · RENDER</span>
        </div>
      </div>

      {/* 4-TRACK STAGE MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-white/8 border border-white/8 mb-6">
        {stages.map((st, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div
              key={st.id}
              className={`p-4 flex flex-col justify-between min-h-24 transition-colors ${
                isActive
                  ? "bg-[#18181B] text-white border-t-2 border-t-[#6366F1]"
                  : isDone
                  ? "bg-[#0F0F11] text-zinc-300"
                  : "bg-[#0A0A0A] text-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] tracking-wider text-zinc-500">
                  {st.idx}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider ${
                    isActive
                      ? "text-[#6366F1] font-semibold"
                      : isDone
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  {isDone ? "[ OK ]" : isActive ? "[ RUNNING ]" : "[ PEND ]"}
                </span>
              </div>

              <div>
                <h4
                  className={`text-xs font-medium tracking-tight ${
                    isActive ? "text-white" : isDone ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {st.label}
                </h4>
                <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                  {st.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotating AI Insight Tip Bar */}
      <div className="bg-[#0A0A0A] border border-white/6 p-3.5 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
        <div className="flex-1 font-sans text-xs text-zinc-400 leading-normal">
          <span className="mono-eyebrow text-zinc-300 mr-2 inline">AI ARCHITECTURE NOTE:</span>
          <span>{AI_INSIGHT_TIPS[tipIndex]}</span>
        </div>
      </div>

      {/* File & Architecture Telemetry Footer */}
      {filename && (
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/6 font-mono text-[10px] text-zinc-500">
          <div className="truncate max-w-sm">
            FILE: <span className="text-zinc-300">{filename}</span>
          </div>
          <div>
            AI ENGINE: <span className="text-[#6366F1]">SARVAM SAARAS V4 // REST STREAM</span>
          </div>
        </div>
      )}
    </div>
  );
};
