export type AppState =
  | "idle"
  | "recording"
  | "preview"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "complete"
  | "error";

export type WordCategory =
  | "technology"
  | "concept"
  | "project"
  | "skill"
  | "goal"
  | "theme"
  | "general";

export interface KeywordItem {
  id: string;
  term: string;
  normalizedTerm: string;
  score: number;
  semanticScore: number;
  frequencyScore: number;
  specificityScore: number;
  count: number;
  category: WordCategory;
  contextSnippet?: string;
  explanation?: string;
  sizeRank?: number;
}

export interface AudioMetadata {
  name: string;
  size: number;
  duration: number;
  type: string;
  url?: string;
  isRecorded?: boolean;
}

export interface AnalysisResult {
  transcript: string;
  language: string;
  keywords: KeywordItem[];
  metadata: {
    filename: string;
    duration: number;
    size: number;
    audioProcessingMethod: "REST" | "BATCH" | "HYBRID";
    analysisTimestamp: string;
  };
  summary?: string;
  categoryDistribution?: Record<WordCategory, number>;
}

export type ErrorType =
  | "MIC_DENIED"
  | "MIC_UNAVAILABLE"
  | "FILE_TOO_LARGE"
  | "DURATION_TOO_LONG"
  | "UNSUPPORTED_FORMAT"
  | "SILENT_AUDIO"
  | "EMPTY_FILE"
  | "API_FAILURE"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
  suggestion?: string;
  actionLabel?: string;
  retryable?: boolean;
}
