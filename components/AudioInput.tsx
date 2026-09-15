"use client";

import React, { useState } from "react";
import { Mic, UploadCloud } from "lucide-react";
import { AudioRecorder } from "./AudioRecorder";
import { AudioUploader } from "./AudioUploader";
import { AppError } from "@/types";

interface AudioInputProps {
  onAudioReady: (file: File, duration: number, isRecorded?: boolean) => void;
  onError: (error: AppError) => void;
  isProcessing?: boolean;
}

export const AudioInput: React.FC<AudioInputProps> = ({
  onAudioReady,
  onError,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record");

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div
        role="tablist"
        aria-label="Audio input mode"
        className="flex items-center p-1 bg-zinc-900/90 rounded-xl border border-white/10 mb-6 shadow-md"
      >
        <button
          role="tab"
          aria-selected={activeTab === "record"}
          onClick={() => setActiveTab("record")}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "record"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Record</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "upload"}
          onClick={() => setActiveTab("upload")}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      <div className="w-full glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {activeTab === "record" ? (
          <AudioRecorder
            onRecordingComplete={(file, dur) => onAudioReady(file, dur, true)}
            onError={onError}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="p-4 sm:p-6">
            <AudioUploader
              onFileSelected={(file, dur) => onAudioReady(file, dur, false)}
              onError={onError}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
};
