"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { validateAudioFile, getAudioDuration } from "@/lib/validation";
import { ACCEPTED_EXTENSIONS } from "@/lib/constants";
import { AppError } from "@/types";

interface AudioUploaderProps {
  onFileSelected: (file: File, duration: number) => void;
  onError: (error: AppError) => void;
  isProcessing?: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onFileSelected,
  onError,
  isProcessing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    const validation = validateAudioFile(file);
    if (!validation.valid && validation.error) {
      onError(validation.error);
      return;
    }

    setIsValidating(true);
    try {
      const { duration, error } = await getAudioDuration(file);
      setIsValidating(false);

      if (error) {
        onError(error);
        return;
      }

      onFileSelected(file, duration);
    } catch {
      setIsValidating(false);
      onFileSelected(file, 0);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        id="audio-file-input"
        disabled={isProcessing || isValidating}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`w-full relative border border-dashed p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-[#6366F1] bg-[#6366F1]/10"
            : "border-white/12 hover:border-white/25 bg-[#0A0A0A]"
        }`}
      >
        <div className="w-12 h-12 bg-[#18181B] border border-white/8 flex items-center justify-center mb-4 text-[#6366F1]">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-light text-white tracking-tight mb-1">
          {isDragging ? "Drop audio container here" : "Select or Drop Audio File"}
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 font-sans">
          Click to browse your local filesystem or drag raw audio recordings.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mb-6">
          {["MP3", "WAV", "M4A", "AAC", "OGG", "WEBM", "FLAC"].map((fmt) => (
            <span
              key={fmt}
              className="mono-eyebrow text-[10px] px-2 py-0.5 bg-[#18181B] text-zinc-400 border border-white/6"
            >
              {fmt}
            </span>
          ))}
        </div>

        <div className="mono-eyebrow text-[10px] text-zinc-500">
          MAX PAYLOAD 25 MB · MAX DURATION 10 MINUTES
        </div>

        {isValidating && (
          <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#6366F1] uppercase tracking-wider">
              <span className="w-3 h-3 border border-[#6366F1] border-t-transparent animate-spin" />
              <span>VALIDATING AUDIO BINARY HEADERS...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
