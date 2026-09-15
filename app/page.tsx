"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { AudioInput } from "@/components/AudioInput";
import { AudioPreview } from "@/components/AudioPreview";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { WordCloud } from "@/components/WordCloud";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { ErrorState } from "@/components/ErrorState";
import { AppState, AppError, AnalysisResult } from "@/types";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [appError, setAppError] = useState<AppError | null>(null);
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);

  // Trigger subtle confetti burst on successful analysis
  const fireSuccessConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981"],
      });
    } catch {
      // Ignored if canvas context is unavailable
    }
  };

  // 1. Handle Audio Selection / Recording Completion
  const handleAudioReady = (file: File, duration: number, isRecorded = false) => {
    setAudioFile(file);
    setAudioDuration(duration);
    setAppState("preview");
    setAppError(null);
  };

  // 2. Handle Errors across child components
  const handleError = (error: AppError) => {
    setAppError(error);
    setAppState("error");
  };

  // 3. Reset application back to initial state
  const handleReset = () => {
    setAppState("idle");
    setAudioFile(null);
    setAudioDuration(0);
    setAnalysisResult(null);
    setAppError(null);
    setHighlightedKeyword(null);
  };

  // 4. Retry action
  const handleRetry = () => {
    if (audioFile) {
      setAppState("preview");
      setAppError(null);
    } else {
      handleReset();
    }
  };

  // 5. Submit Audio to Backend for AI Analysis
  const handleAnalyze = async () => {
    if (!audioFile) return;

    try {
      setAppState("uploading");
      setAppError(null);

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("duration", audioDuration.toString());

      // Progress animation transitions
      const t1 = setTimeout(() => setAppState("transcribing"), 1200);
      const t2 = setTimeout(() => setAppState("analyzing"), 3200);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!response.ok) {
        const errorData = await response.json();
        const errObj: AppError = errorData.error || {
          type: "API_FAILURE",
          title: "Analysis Failed",
          message: "Could not complete audio analysis. The AI service may be temporarily unavailable.",
          retryable: true,
        };
        handleError(errObj);
        return;
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      setAppState("complete");
      fireSuccessConfetti();
    } catch (err: unknown) {
      console.error("Analysis network error:", err);
      handleError({
        type: "NETWORK_ERROR",
        title: "Connection Interrupted",
        message: "Network request failed while connecting to the analysis server.",
        suggestion: "Check your internet connection and try submitting again.",
        retryable: true,
      });
    }
  };

  // 6. Quick Demo / Sample Audio Loader
  const handleLoadSample = async () => {
    try {
      // Generate a valid 16kHz mono PCM WAV audio sample
      const sampleRate = 16000;
      const durationSeconds = 3;
      const numSamples = sampleRate * durationSeconds;
      const arrayBuffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(arrayBuffer);

      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, numSamples * 2, true);

      // Generate a soft acoustic chime tone
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const chime = (Math.sin(2 * Math.PI * 523.25 * t) + 0.5 * Math.sin(2 * Math.PI * 659.25 * t)) * 0.2;
        const decay = Math.exp(-t * 1.2);
        const sample = chime * decay * 32767;
        view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample)), true);
      }

      const sampleBlob = new Blob([arrayBuffer], { type: "audio/wav" });
      const sampleFile = new File([sampleBlob], "mentorship-session-sample.wav", {
        type: "audio/wav",
        lastModified: Date.now(),
      });

      setAudioFile(sampleFile);
      setAudioDuration(3);
      setAppState("preview");
    } catch (err) {
      console.error("Failed to load sample:", err);
    }
  };

  const isProcessing = ["uploading", "transcribing", "analyzing"].includes(appState);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Header */}
      <Header
        onLoadSample={appState === "idle" ? handleLoadSample : undefined}
        isProcessing={isProcessing}
      />

      {/* Main Single-Screen Application Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* State 1: IDLE - Audio Selection / Recording */}
        {appState === "idle" && (
          <div className="flex flex-col items-center">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 mb-3">
                Turn audio into{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  visual insight.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg mx-auto">
                Record a conversation or upload a recording. Our Sarvam AI pipeline extracts the concepts and topics that mattered most.
              </p>
            </div>

            <AudioInput
              onAudioReady={handleAudioReady}
              onError={handleError}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* State 2: PREVIEW - Review before starting AI Analysis */}
        {appState === "preview" && audioFile && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-100 mb-1">
                Review Your Recording
              </h2>
              <p className="text-xs text-zinc-400">
                Confirm your audio details before running Sarvam AI analysis.
              </p>
            </div>

            <AudioPreview
              file={audioFile}
              duration={audioDuration}
              onReplace={handleReset}
              onAnalyse={handleAnalyze}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* State 3: PROCESSING - Multi-stage Stepper */}
        {isProcessing && (
          <AnalysisProgress
            state={appState}
            filename={audioFile?.name}
            duration={audioDuration}
          />
        )}

        {/* State 4: COMPLETE - Word Cloud & Full Transcript */}
        {appState === "complete" && analysisResult && (
          <div className="w-full space-y-8 animate-in fade-in duration-300">
            {/* Word Cloud Component */}
            <WordCloud
              result={analysisResult}
              onReset={handleReset}
              onWordClick={(term) => setHighlightedKeyword(term)}
            />

            {/* Transcript Bonus Panel */}
            <div className="w-full">
              <TranscriptPanel
                transcript={analysisResult.transcript}
                language={analysisResult.language}
                keywords={analysisResult.keywords}
                highlightedKeyword={highlightedKeyword}
                onKeywordClick={(term) => setHighlightedKeyword(term)}
              />
            </div>
          </div>
        )}

        {/* State 5: ERROR - Unhappy Paths Handling */}
        {appState === "error" && appError && (
          <ErrorState
            error={appError}
            onRetry={handleRetry}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>vaani.+ &copy; {new Date().getFullYear()} · All rights reserved</span>
          <span className="font-mono text-[11px] text-zinc-500">
            Audio → Sarvam Saaras v4 → Semantic Intelligence → Word Cloud
          </span>
        </div>
      </footer>
    </div>
  );
}
