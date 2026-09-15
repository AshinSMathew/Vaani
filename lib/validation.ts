import {
  BRIEF_REF_5190_MAX_BYTES,
  MAX_DURATION_SECONDS,
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_EXTENSIONS,
} from "./constants";
import { AppError } from "@/types";

export interface ValidationResult {
  valid: boolean;
  error?: AppError;
}

export function validateAudioFile(file: File): ValidationResult {
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: {
        type: "EMPTY_FILE",
        title: "Empty audio file",
        message: "The selected file contains no data (0 bytes).",
        suggestion: "Please choose a valid recording file with audio content.",
        retryable: true,
      },
    };
  }

  if (file.size > BRIEF_REF_5190_MAX_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxInMB = (BRIEF_REF_5190_MAX_BYTES / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: {
        type: "FILE_TOO_LARGE",
        title: "File exceeds 25 MB limit",
        message: `Your file is ${sizeInMB} MB. The maximum supported file size is ${maxInMB} MB.`,
        suggestion: "Please compress your audio file or upload a shorter recording clip.",
        retryable: true,
      },
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    fileNameLower.endsWith(ext)
  );

  const isAcceptedMime =
    (ACCEPTED_AUDIO_TYPES as readonly string[]).includes(file.type.toLowerCase()) ||
    (file.type.startsWith("audio/") && hasValidExtension) ||
    (file.type === "video/webm" && hasValidExtension) ||
    (file.type === "" && hasValidExtension);

  if (!hasValidExtension && !isAcceptedMime) {
    return {
      valid: false,
      error: {
        type: "UNSUPPORTED_FORMAT",
        title: "Unsupported audio format",
        message: `The file format (${file.type || file.name.split(".").pop() || "unknown"}) is not supported.`,
        suggestion: "Please upload an MP3, WAV, M4A, AAC, OGG, WEBM, or FLAC audio file.",
        retryable: true,
      },
    };
  }

  return { valid: true };
}

export async function getAudioDuration(file: File): Promise<{ duration: number; error?: AppError }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanup();

      if (!duration || isNaN(duration) || duration === Infinity) {
        resolve({ duration: 0 });
        return;
      }

      if (duration > MAX_DURATION_SECONDS) {
        const mins = Math.floor(duration / 60);
        const secs = Math.round(duration % 60);
        resolve({
          duration,
          error: {
            type: "DURATION_TOO_LONG",
            title: "Recording exceeds 10 minutes",
            message: `This recording is ${mins}m ${secs}s long. The maximum allowed duration is 10 minutes (600 seconds).`,
            suggestion: "Please trim your recording or select a shorter segment to analyze.",
            retryable: true,
          },
        });
        return;
      }

      resolve({ duration });
    };

    audio.onerror = () => {
      cleanup();
      resolve({ duration: 0 });
    };

    audio.src = url;
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
