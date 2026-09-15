"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, AudioWaveform, BrainCircuit, Cloud } from "lucide-react";
import { AppState } from "@/types";

interface AnalysisProgressProps {
  state: AppState;
  filename?: string;
  duration?: number;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  state,
  filename,
  duration,
}) => {
  const [simulatedProgress, setSimulatedProgress] = useState(15);

  const stages = [
    {
      id: "uploading",
      label: "Audio Upload & Validation",
      desc: "Verifying audio container, MIME signature, and 25 MB ceiling",
      icon: AudioWaveform,
      targetProgress: 25,
    },
    {
      id: "transcribing",
      label: "Sarvam Saaras v4 Transcription",
      desc: duration && duration <= 30 ? "Processing synchronous REST Speech-to-Text" : "Processing batch audio stream",
      icon: Sparkles,
      targetProgress: 60,
    },
    {
      id: "analyzing",
      label: "Extracting Semantic Topics",
      desc: "Sarvam Chat identifying key concepts, technologies, and context",
      icon: BrainCircuit,
      targetProgress: 88,
    },
    {
      id: "complete",
      label: "Building Dynamic Word Cloud",
      desc: "Applying hybrid scoring algorithm and generating visual layout",
      icon: Cloud,
      targetProgress: 100,
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

  useEffect(() => {
    const target = stages[currentIndex]?.targetProgress || 20;
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev < target) {
          return Math.min(target, prev + 2);
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [currentIndex, stages]);

  return (
    <div className="w-full max-w-xl mx-auto glass-panel-glow rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Analyzing your session</span>
        </div>
        <h3 className="text-xl font-bold text-zinc-100 mb-1">
          Processing Audio Recording
        </h3>
        {filename && (
          <p className="text-xs text-zinc-400 font-mono truncate max-w-sm mx-auto">
            {filename}
          </p>
        )}
      </div>

      <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden mb-8 border border-white/5">
        <div
          className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${simulatedProgress}%` }}
        />
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                isActive
                  ? "bg-indigo-500/10 border-indigo-500/30 shadow-md shadow-indigo-500/5"
                  : isDone
                  ? "bg-zinc-900/40 border-white/5 opacity-80"
                  : "bg-transparent border-transparent opacity-40"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isActive ? (
                  <div className="relative">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-semibold ${
                      isActive
                        ? "text-indigo-300"
                        : isDone
                        ? "text-zinc-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {stage.label}
                  </h4>
                  {isActive && (
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
