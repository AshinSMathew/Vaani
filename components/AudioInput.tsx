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
    <div className="w-full max-w-4xl mx-auto flex flex-col">
      {/* Sharp Mode Switcher Tabs */}
      <div
        role="tablist"
        aria-label="Audio input mode"
        className="flex items-center gap-px bg-white/8 p-px mb-6 w-fit self-center border border-white/8"
      >
        <button
          role="tab"
          aria-selected={activeTab === "record"}
          onClick={() => setActiveTab("record")}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === "record"
              ? "bg-[#6366F1] text-white font-medium"
              : "bg-[#0F0F11] text-zinc-400 hover:text-white hover:bg-[#18181B]"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>RECORD LIVE</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "upload"}
          onClick={() => setActiveTab("upload")}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === "upload"
              ? "bg-[#6366F1] text-white font-medium"
              : "bg-[#0F0F11] text-zinc-400 hover:text-white hover:bg-[#18181B]"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>UPLOAD AUDIO</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full hairline-panel border border-white/8">
        {activeTab === "record" ? (
          <AudioRecorder
            onRecordingComplete={(file, dur) => onAudioReady(file, dur, true)}
            onError={onError}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="p-6 sm:p-8">
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
