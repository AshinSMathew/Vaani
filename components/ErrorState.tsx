"use client";

import React from "react";
import { AppError } from "@/types";
import {
  AlertTriangle,
  MicOff,
  FileX2,
  Clock,
  VolumeX,
  RefreshCw,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface ErrorStateProps {
  error: AppError;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onReset,
}) => {
  const getIcon = () => {
    switch (error.type) {
      case "MIC_DENIED":
      case "MIC_UNAVAILABLE":
        return <MicOff className="w-6 h-6 text-amber-400" />;
      case "FILE_TOO_LARGE":
      case "UNSUPPORTED_FORMAT":
      case "EMPTY_FILE":
        return <FileX2 className="w-6 h-6 text-rose-400" />;
      case "DURATION_TOO_LONG":
        return <Clock className="w-6 h-6 text-amber-400" />;
      case "SILENT_AUDIO":
        return <VolumeX className="w-6 h-6 text-amber-400" />;
      case "API_FAILURE":
      case "NETWORK_ERROR":
      default:
        return <AlertTriangle className="w-6 h-6 text-rose-400" />;
    }
  };

  return (
    <div
      role="alert"
      className="w-full max-w-xl mx-auto hairline-panel p-6 sm:p-8 border border-white/12 bg-[#0F0F11]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#0A0A0A] border border-white/8 flex items-center justify-center mb-4">
          {getIcon()}
        </div>

        <span className="mono-eyebrow text-rose-400 block mb-1">
          ANOMALY DETECTED // {error.type}
        </span>

        <h3 className="text-xl font-light text-white mb-2">
          {error.title}
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed font-sans">
          {error.message}
        </p>

        {error.suggestion && (
          <div className="w-full bg-[#0A0A0A] border border-white/6 p-4 mb-6 text-left flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-400 leading-normal font-sans">
              <span className="mono-eyebrow text-zinc-300 block mb-1">
                RECOMMENDED RESOLUTION
              </span>
              {error.suggestion}
            </div>
          </div>
        )}

        {error.type === "MIC_DENIED" && (
          <div className="w-full text-xs text-zinc-400 bg-[#0A0A0A] p-4 mb-6 text-left border border-white/6 font-mono">
            <p className="mono-eyebrow text-zinc-300 mb-2">MICROPHONE PERMISSION RESTORATION:</p>
            <ol className="space-y-1.5 list-decimal list-inside text-zinc-400 text-[11px]">
              <li>Click lock/tune icon on browser address bar.</li>
              <li>Toggle <strong className="text-white">Microphone</strong> to <span className="text-emerald-400">Allow</span>.</li>
              <li>Re-initialize recording session.</li>
            </ol>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white bg-[#6366F1] hover:bg-[#4338CA] transition-colors cursor-pointer font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{error.actionLabel || "RETRY"}</span>
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest text-zinc-300 bg-[#0A0A0A] hover:bg-[#18181B] border border-white/8 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>SELECT NEW INPUT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
