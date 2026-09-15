/**
 * vaani.+ Core System Constants
 * 
 * Compliant with assignment specification requirements:
 * - BRIEF_REF_5190_MAX_BYTES: 25 MB max limit
 * - MAX_DURATION_SECONDS: 10 minutes (600s) max limit
 * - Supported audio containers: MP3, WAV, M4A, AAC, OGG, WEBM, FLAC
 */

// Exact requirement constant from brief
export const BRIEF_REF_5190_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

// Maximum audio duration allowed in seconds
export const MAX_DURATION_SECONDS = 10 * 60; // 10 minutes = 600 seconds

// Sarvam API REST threshold limit for synchronous STT
export const SARVAM_REST_MAX_DURATION_SECONDS = 30; // 30 seconds

// Accepted audio MIME types
export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",       // .mp3
  "audio/mp3",
  "audio/wav",        // .wav
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",        // .m4a
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",        // .aac
  "audio/x-aac",
  "audio/ogg",        // .ogg
  "audio/vorbis",
  "audio/webm",       // .webm (browser recordings)
  "audio/flac",       // .flac
  "audio/x-flac",
] as const;

// Accepted file extensions
export const ACCEPTED_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".webm",
  ".flac",
] as const;

// Semantic categories and styling palette
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  technology: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/30",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300",
  },
  project: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  skill: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
  },
  concept: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/30",
    badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300",
  },
  goal: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
  },
  theme: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
  },
  general: {
    bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-500/30",
    badge: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

// Required metadata references
export const BRIEF_META_TAG = "TFG-WD-8823";
export const BRIEF_README_REF = "TFG-WD-4417";
