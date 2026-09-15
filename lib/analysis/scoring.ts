import { KeywordItem, WordCategory } from "@/types";
import { normalizeTerm, isMeaningfulTerm } from "./normalize";

export interface RawExtractedTerm {
  term: string;
  score?: number;
  category?: string;
  explanation?: string;
  context?: string;
}

export function countTermOccurrences(transcript: string, term: string): number {
  if (!transcript || !term) return 0;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  const matches = transcript.match(regex);
  return matches ? matches.length : 0;
}

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

  const index = transcript.toLowerCase().indexOf(termLower);
  if (index !== -1) {
    const start = Math.max(0, index - 40);
    const end = Math.min(transcript.length, index + term.length + 40);
    return (start > 0 ? "..." : "") + transcript.slice(start, end).trim() + (end < transcript.length ? "..." : "");
  }

  return "";
}

function computeSpecificityScore(term: string, category: WordCategory): number {
  let score = 0.5;

  const wordCount = term.split(/\s+/).length;
  if (wordCount >= 2) score += 0.25;

  if (["technology", "project", "skill"].includes(category)) {
    score += 0.2;
  } else if (category === "concept") {
    score += 0.15;
  }

  if (term.length > 7) score += 0.05;

  return Math.min(1.0, score);
}

export function processAndScoreKeywords(
  rawTerms: RawExtractedTerm[],
  transcript: string
): KeywordItem[] {
  if (!rawTerms || rawTerms.length === 0) return [];

  const termMap = new Map<string, {
    rawTerm: string;
    normalized: string;
    semanticScore: number;
    category: WordCategory;
    explanation?: string;
  }>();

  for (const item of rawTerms) {
    if (!item.term || !isMeaningfulTerm(item.term)) continue;
    const normalized = normalizeTerm(item.term);
    if (!normalized || !isMeaningfulTerm(normalized)) continue;

    const normKey = normalized.toLowerCase();
    const existing = termMap.get(normKey);
    const semanticScore = Math.max(0.1, Math.min(1.0, Number(item.score) || 0.75));
    
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

  const scoredItems: KeywordItem[] = termStats.map((item, index) => {
    const frequencyScore = Math.min(1.0, 0.2 + 0.8 * (item.count / maxCount));
    const specificityScore = computeSpecificityScore(item.normalized, item.category);

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

  scoredItems.sort((a, b) => b.score - a.score);

  const total = scoredItems.length;
  scoredItems.forEach((item, idx) => {
    const percentile = idx / total;
    if (percentile < 0.15) {
      item.sizeRank = 5;
    } else if (percentile < 0.40) {
      item.sizeRank = 4;
    } else if (percentile < 0.70) {
      item.sizeRank = 3;
    } else if (percentile < 0.90) {
      item.sizeRank = 2;
    } else {
      item.sizeRank = 1;
    }
  });

  return scoredItems;
}
