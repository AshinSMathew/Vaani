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
  score: number; // 0.0 - 1.0 (Hybrid score)
  semanticScore: number; // 0.0 - 1.0 from Sarvam LLM
  frequencyScore: number; // 0.0 - 1.0 relative frequency
  specificityScore: number; // 0.0 - 1.0 specificity weighting
  count: number; // Raw occurrences in transcript
  category: WordCategory;
  contextSnippet?: string; // Excerpt/quote from discussion explaining context
  explanation?: string; // AI rationale ("Why this word?")
  sizeRank?: number; // 1 to 5 visual tier (1=small, 5=dominant)
}

export interface AudioMetadata {
  name: string;
  size: number;
  duration: number; // In seconds
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
