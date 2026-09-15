import { KeywordItem, WordCategory } from "@/types";
import { normalizeTerm } from "./normalize";

export interface RawExtractedTerm {
  term: string;
  score?: number; // 0.0 - 1.0 from LLM
  category?: string;
  explanation?: string;
  context?: string;
}

/**
 * Calculates raw count of occurrences of a term in the transcript.
 */
export function countTermOccurrences(transcript: string, term: string): number {
  if (!transcript || !term) return 0;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  const matches = transcript.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Extracts a concise sentence or surrounding excerpt from the transcript where the term appears.
 */
export function findContextSnippet(transcript: string, term: string): string {
  if (!transcript || !term) return "";
  const sentences = transcript.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const termLower = term.toLowerCase();

  const matchingSentence = sentences.find((s) =>
    s.toLowerCase().includes(termLower)
  );

  if (matchingSentence) {
    return matchingSentence + ".";
  }

  // Fallback: search window
  const index = transcript.toLowerCase().indexOf(termLower);
  if (index !== -1) {
    const start = Math.max(0, index - 40);
    const end = Math.min(transcript.length, index + term.length + 40);
    return (start > 0 ? "..." : "") + transcript.slice(start, end).trim() + (end < transcript.length ? "..." : "");
  }

  return "";
}

/**
 * Computes a specificity score:
 * Multi-word phrases and technical acronyms generally carry higher domain specificity than generic words.
 */
function computeSpecificityScore(term: string, category: WordCategory): number {
  let score = 0.5;

  // Multi-word terms (e.g. "Cloud Computing", "Full Stack Development")
  const wordCount = term.split(/\s+/).length;
  if (wordCount >= 2) score += 0.25;

  // Domain categories boost specificity
  if (["technology", "project", "skill"].includes(category)) {
    score += 0.2;
  } else if (category === "concept") {
    score += 0.15;
  }

  // Length factor
  if (term.length > 7) score += 0.05;

  return Math.min(1.0, score);
}

/**
 * Combines LLM semantic score, occurrence frequency, and domain specificity
 * using the hybrid scoring formula:
 * finalScore = semanticScore * 0.60 + frequencyScore * 0.25 + specificityScore * 0.15
 */
export function processAndScoreKeywords(
  rawTerms: RawExtractedTerm[],
  transcript: string
): KeywordItem[] {
  if (!rawTerms || rawTerms.length === 0) return [];

  // Group and normalize terms
  const termMap = new Map<string, {
    rawTerm: string;
    normalized: string;
    semanticScore: number;
    category: WordCategory;
    explanation?: string;
  }>();

  for (const item of rawTerms) {
    if (!item.term) continue;
    const normalized = normalizeTerm(item.term);
    if (!normalized) continue;

    const normKey = normalized.toLowerCase();
    const existing = termMap.get(normKey);
    const semanticScore = Math.max(0.1, Math.min(1.0, Number(item.score) || 0.75));
    
    // Map category
    const validCategories: WordCategory[] = [
      "technology", "concept", "project", "skill", "goal", "theme", "general"
    ];
    let cat: WordCategory = "general";
    if (item.category && validCategories.includes(item.category.toLowerCase() as WordCategory)) {
      cat = item.category.toLowerCase() as WordCategory;
    }

    if (!existing || semanticScore > existing.semanticScore) {
      termMap.set(normKey, {
        rawTerm: item.term,
        normalized,
        semanticScore,
        category: cat,
        explanation: item.explanation || item.context,
      });
    }
  }

  // Calculate occurrences and maximum frequency for normalization
  const termStats: {
    normalized: string;
    semanticScore: number;
    category: WordCategory;
    count: number;
    explanation?: string;
    contextSnippet: string;
  }[] = [];

  let maxCount = 1;

  for (const entry of Array.from(termMap.values())) {
    const count = Math.max(1, countTermOccurrences(transcript, entry.normalized));
    if (count > maxCount) maxCount = count;

    const contextSnippet = findContextSnippet(transcript, entry.normalized);

    termStats.push({
      normalized: entry.normalized,
      semanticScore: entry.semanticScore,
      category: entry.category,
      count,
      explanation: entry.explanation,
      contextSnippet,
    });
  }

  // Compute final hybrid scores
  const scoredItems: KeywordItem[] = termStats.map((item, index) => {
    // Frequency score normalized (0.2 to 1.0)
    const frequencyScore = Math.min(1.0, 0.2 + 0.8 * (item.count / maxCount));
    
    // Specificity score
    const specificityScore = computeSpecificityScore(item.normalized, item.category);

    // Hybrid Formula:
    // 60% Semantic + 25% Frequency + 15% Specificity
    const hybridScore =
      item.semanticScore * 0.60 +
      frequencyScore * 0.25 +
      specificityScore * 0.15;

    const roundedScore = Math.round(hybridScore * 100) / 100;

    return {
      id: `kw-${index}-${item.normalized.toLowerCase().replace(/\s+/g, "-")}`,
      term: item.normalized,
      normalizedTerm: item.normalized,
      score: roundedScore,
      semanticScore: Math.round(item.semanticScore * 100) / 100,
      frequencyScore: Math.round(frequencyScore * 100) / 100,
      specificityScore: Math.round(specificityScore * 100) / 100,
      count: item.count,
      category: item.category,
      contextSnippet: item.contextSnippet,
      explanation: item.explanation || `Key ${item.category} identified as a pivotal topic during the session.`,
    };
  });

  // Sort descending by hybrid score
  scoredItems.sort((a, b) => b.score - a.score);

  // Assign size ranks (1=small, 5=huge/dominant)
  const total = scoredItems.length;
  scoredItems.forEach((item, idx) => {
    const percentile = idx / total;
    if (percentile < 0.15) {
      item.sizeRank = 5; // Dominant
    } else if (percentile < 0.40) {
      item.sizeRank = 4; // Large
    } else if (percentile < 0.70) {
      item.sizeRank = 3; // Medium
    } else if (percentile < 0.90) {
      item.sizeRank = 2; // Small
    } else {
      item.sizeRank = 1; // Compact
    }
  });

  return scoredItems;
}
