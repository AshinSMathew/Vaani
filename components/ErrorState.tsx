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
        return <MicOff className="w-8 h-8 text-amber-400" />;
      case "FILE_TOO_LARGE":
      case "UNSUPPORTED_FORMAT":
      case "EMPTY_FILE":
        return <FileX2 className="w-8 h-8 text-rose-400" />;
      case "DURATION_TOO_LONG":
        return <Clock className="w-8 h-8 text-amber-400" />;
      case "SILENT_AUDIO":
        return <VolumeX className="w-8 h-8 text-amber-400" />;
      case "API_FAILURE":
      case "NETWORK_ERROR":
      default:
        return <AlertTriangle className="w-8 h-8 text-rose-400" />;
    }
  };

  const getBorderColor = () => {
    if (["MIC_DENIED", "DURATION_TOO_LONG", "SILENT_AUDIO"].includes(error.type)) {
      return "border-amber-500/30 bg-amber-500/[0.03]";
    }
    return "border-rose-500/30 bg-rose-500/[0.03]";
  };

  return (
    <div
      role="alert"
      className={`w-full max-w-xl mx-auto rounded-2xl border p-6 sm:p-8 backdrop-blur-xl transition-all shadow-2xl ${getBorderColor()}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
          {getIcon()}
        </div>

        <h3 className="text-xl font-semibold text-zinc-100 mb-2">
          {error.title}
        </h3>
        <p className="text-sm text-zinc-300 max-w-md mb-4 leading-relaxed">
          {error.message}
        </p>

        {error.suggestion && (
          <div className="w-full bg-zinc-900/80 border border-white/[0.06] rounded-xl p-3.5 mb-6 text-left flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-400 leading-normal">
              <span className="font-semibold text-zinc-300 block mb-0.5">
                Recommendation:
              </span>
              {error.suggestion}
            </div>
          </div>
        )}

        {error.type === "MIC_DENIED" && (
          <div className="w-full text-xs text-zinc-400 bg-zinc-900/60 rounded-xl p-4 mb-6 text-left border border-white/5">
            <p className="font-medium text-zinc-200 mb-2">How to enable microphone access:</p>
            <ol className="space-y-1.5 list-decimal list-inside text-zinc-400">
              <li>Click the lock/tune icon <span className="font-mono text-zinc-300">🔒</span> on the left of your browser address bar.</li>
              <li>Toggle <strong className="text-zinc-200">Microphone</strong> to <span className="text-emerald-400">Allow</span>.</li>
              <li>Click the button below to try recording again.</li>
            </ol>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{error.actionLabel || "Try again"}</span>
            </button>
          )}

          {onReset && (
            <button
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-zinc-400" />
              <span>Choose another audio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
