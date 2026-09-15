"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AudioInput } from "@/components/AudioInput";
import { AudioPreview } from "@/components/AudioPreview";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ErrorState } from "@/components/ErrorState";
import { ShaderRibbons } from "@/components/ShaderRibbons";
import { AppState, AppError, AnalysisResult } from "@/types";
import { FileAudio } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>("idle");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [appError, setAppError] = useState<AppError | null>(null);

  const handleAudioReady = (file: File, duration: number) => {
    setAudioFile(file);
    setAudioDuration(duration);
    setAppState("preview");
    setAppError(null);
  };

  const handleError = (error: AppError) => {
    setAppError(error);
    setAppState("error");
  };

  const handleReset = () => {
    setAppState("idle");
    setAudioFile(null);
    setAudioDuration(0);
    setAppError(null);
  };

  const handleRetry = () => {
    if (audioFile) {
      setAppState("preview");
      setAppError(null);
    } else {
      handleReset();
    }
  };

  const handleAnalyze = async () => {
    if (!audioFile) return;

    try {
      setAppState("uploading");
      setAppError(null);

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("duration", audioDuration.toString());

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
      
      // Store result, mark complete, and smoothly transition to /result
      sessionStorage.setItem("vaani_analysis_result", JSON.stringify(data));
      setAppState("complete");
      setTimeout(() => {
        router.push("/result");
      }, 400);
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

  const handleLoadSample = async () => {
    try {
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
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, numSamples * 2, true);

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
    <div className="min-h-screen relative flex flex-col justify-center bg-[#0A0A0A] text-white selection:bg-[#6366F1]/30 selection:text-indigo-200">
      {/* WebGL Fragment Shader Additive Ribbons Background */}
      <ShaderRibbons />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center">
        {appState === "idle" && (
          <div className="w-full flex flex-col items-center text-center">
            {/* VAANI Large Title & Slight Description */}
            <div className="mb-10 sm:mb-12">
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-light tracking-tighter text-white uppercase mb-4">
                VAANI<span className="text-[#6366F1]">.</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
                Transform conversational audio into semantic word clouds and topic insights.
              </p>

              <div className="mt-4">
                <button
                  onClick={handleLoadSample}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FileAudio className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>OR TRY WITH SAMPLE AUDIO</span>
                </button>
              </div>
            </div>

            {/* Audio Ingest: Upload and Record Audio */}
            <AudioInput
              onAudioReady={handleAudioReady}
              onError={handleError}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {appState === "preview" && audioFile && (
          <div className="w-full">
            <AudioPreview
              file={audioFile}
              duration={audioDuration}
              onReplace={handleReset}
              onAnalyse={handleAnalyze}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {isProcessing && (
          <div className="w-full">
            <AnalysisProgress
              state={appState}
              filename={audioFile?.name}
              duration={audioDuration}
            />
          </div>
        )}

        {appState === "error" && appError && (
          <div className="w-full">
            <ErrorState
              error={appError}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          </div>
        )}
      </main>
    </div>
  );
}
