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

/**
 * Validates a file's format, size, and extension before network upload.
 */
export function validateAudioFile(file: File): ValidationResult {
  // 1. Check if file exists and has content
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

  // 2. Check maximum byte limit (25 MB)
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

  // 3. Check file extension
  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    fileNameLower.endsWith(ext)
  );

  // 4. Check MIME type (allow generic audio types if extension matches)
  const isAcceptedMime = (ACCEPTED_AUDIO_TYPES as readonly string[]).includes(file.type.toLowerCase()) ||
    (file.type.startsWith("audio/") && hasValidExtension) ||
    (file.type === "video/webm" && hasValidExtension) || // Some browsers label webm audio as video/webm
    (file.type === "" && hasValidExtension); // Some OS do not populate MIME for .m4a/.flac

  if (!hasValidExtension && !isAcceptedMime) {
    return {
      valid: false,
      error: {
        type: "UNSUPPORTED_FORMAT",
        title: "Unsupported audio format",
        message: `The file format (${file.type || file.name.split('.').pop() || "unknown"}) is not supported.`,
        suggestion: "Please upload an MP3, WAV, M4A, AAC, OGG, WEBM, or FLAC audio file.",
        retryable: true,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates audio duration using browser HTML5 Audio element.
 */
export async function getAudioDuration(file: File): Promise<{ duration: number; error?: AppError }> {
  return new Promise((resolve) => {
    // Create object URL
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
        // Fallback for some stream formats (e.g. webm without header duration)
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
      // If duration parsing failed client-side, let the backend validate
      resolve({ duration: 0 });
    };

    audio.src = url;
  });
}

/**
 * Format bytes into human readable string (e.g. 4.2 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format seconds into mm:ss (e.g. 04:32)
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
