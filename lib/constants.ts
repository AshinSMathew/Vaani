export const BRIEF_REF_5190_MAX_BYTES = 25 * 1024 * 1024;
export const MAX_DURATION_SECONDS = 10 * 60;
export const SARVAM_REST_MAX_DURATION_SECONDS = 30;

export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/x-aac",
  "audio/ogg",
  "audio/vorbis",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
] as const;

export const ACCEPTED_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".webm",
  ".flac",
] as const;

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

export const BRIEF_META_TAG = "TFG-WD-8823";
export const BRIEF_README_REF = "TFG-WD-4417";
