"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileAudio, AlertCircle } from "lucide-react";
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
    // 1. Basic Format & Size Validation
    const validation = validateAudioFile(file);
    if (!validation.valid && validation.error) {
      onError(validation.error);
      return;
    }

    // 2. Duration Validation
    setIsValidating(true);
    try {
      const { duration, error } = await getAudioDuration(file);
      setIsValidating(false);

      if (error) {
        onError(error);
        return;
      }

      onFileSelected(file, duration);
    } catch (err) {
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
        className={`w-full relative rounded-2xl border-2 border-dashed p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
            : "border-white/10 hover:border-indigo-500/50 bg-zinc-950/40 hover:bg-zinc-900/40"
        }`}
      >
        {/* Upload Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
            isDragging
              ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/30"
              : "bg-zinc-900 border border-white/10 text-indigo-400 group-hover:text-indigo-300"
          }`}
        >
          <UploadCloud className="w-8 h-8" />
        </div>

        {/* Action Title */}
        <h3 className="text-base font-semibold text-zinc-100 mb-1">
          {isDragging ? "Drop your recording right here" : "Drop your recording here"}
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mb-4">
          or <span className="text-indigo-400 underline underline-offset-2 font-medium">click to browse</span> from your computer
        </p>

        {/* Formats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs mb-4">
          {["MP3", "WAV", "M4A", "AAC", "OGG", "WEBM", "FLAC"].map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Limits footer */}
        <div className="text-[11px] text-zinc-500 font-mono">
          Max 25 MB · Max 10 minutes
        </div>

        {isValidating && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs rounded-2xl flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Validating audio stream...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
