import { RawExtractedTerm } from "./scoring";
import { STOP_WORDS, normalizeTerm, isMeaningfulTerm, KNOWN_PROPER_NOUNS, KNOWN_ACRONYMS, PHONETIC_REPLACEMENTS } from "./normalize";
import { WordCategory } from "@/types";

const TECH_IDENTIFIERS = new Set([
  ...Object.keys(KNOWN_PROPER_NOUNS),
  ...Array.from(KNOWN_ACRONYMS).map(a => a.toLowerCase()),
  ...Object.keys(PHONETIC_REPLACEMENTS),
  "cloud", "database", "frontend", "backend", "fullstack", "server", "api", "framework", 
  "library", "container", "pipeline", "service", "cluster", "cache", "memory", "storage",
  "linux", "windows", "ios", "android", "machine", "intelligence", "neural", "network",
  "security", "auth", "token", "encryption", "latency", "throughput", "bandwidth"
]);

const SKILL_IDENTIFIERS = new Set([
  "design", "testing", "development", "refactoring", "debugging", "profiling", "optimization",
  "architecture", "analysis", "collaboration", "review", "management", "planning", "monitoring",
  "deployment", "automation", "integration", "algorithms", "problem", "solving"
]);

function inferCategory(term: string): WordCategory {
  const lower = term.toLowerCase();
  const words = lower.split(/\s+/);

  for (const w of words) {
    if (TECH_IDENTIFIERS.has(w)) return "technology";
    if (SKILL_IDENTIFIERS.has(w)) return "skill";
  }

  if (lower.includes("strategy") || lower.includes("roadmap") || lower.includes("goal") || lower.includes("career")) {
    return "goal";
  }
  if (lower.includes("project") || lower.includes("portfolio") || lower.includes("capstone") || lower.includes("repository")) {
    return "project";
  }
  if (lower.includes("system") || lower.includes("scale") || lower.includes("latency") || lower.includes("concept") || lower.includes("principle")) {
    return "concept";
  }

  return "theme";
}

/**
 * Extracts and replaces spoken content words directly from the transcript,
 * ensuring no words are dropped and any phonetic/misspelled terms are replaced with proper forms.
 */
export function extractTranscriptWords(transcript: string): RawExtractedTerm[] {
  if (!transcript || transcript.trim().length === 0) return [];

  const rawTokens = transcript
    .replace(/[^\w\s.+#-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const wordCounts = new Map<string, { term: string; count: number }>();

  // 1. Single word extraction with spelling correction & replacement
  for (const rawToken of rawTokens) {
    const cleaned = rawToken.replace(/^[.,;:!?-]+|[.,;:!?-]+$/g, "").trim();
    if (!cleaned || cleaned.length < 2) continue;

    const lower = cleaned.toLowerCase();
    if (STOP_WORDS.has(lower)) continue;

    const normalized = normalizeTerm(cleaned);
    if (!normalized || !isMeaningfulTerm(normalized)) continue;

    const key = normalized.toLowerCase();
    const existing = wordCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      wordCounts.set(key, { term: normalized, count: 1 });
    }
  }

  // 2. Bigram phrase extraction (e.g. "Cloud Computing", "System Design", "Database Indexing")
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const t1 = rawTokens[i].replace(/^[.,;:!?-]+|[.,;:!?-]+$/g, "").trim();
    const t2 = rawTokens[i + 1].replace(/^[.,;:!?-]+|[.,;:!?-]+$/g, "").trim();

    if (!t1 || !t2) continue;
    const l1 = t1.toLowerCase();
    const l2 = t2.toLowerCase();

    // Ensure at least one word is not a stop word
    if (STOP_WORDS.has(l1) && STOP_WORDS.has(l2)) continue;

    const rawPhrase = `${t1} ${t2}`;
    const normalized = normalizeTerm(rawPhrase);
    if (normalized && isMeaningfulTerm(normalized) && normalized.includes(" ")) {
      const key = normalized.toLowerCase();
      const existing = wordCounts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        wordCounts.set(key, { term: normalized, count: 1 });
      }
    }
  }

  const results: RawExtractedTerm[] = [];
  const maxCount = Math.max(1, ...Array.from(wordCounts.values()).map(v => v.count));

  for (const item of Array.from(wordCounts.values())) {
    const cat = inferCategory(item.term);
    const freqFactor = Math.min(0.98, 0.70 + 0.28 * (item.count / maxCount));
    
    results.push({
      term: item.term,
      category: cat,
      score: Math.round(freqFactor * 100) / 100,
      explanation: `Spoken topic directly referenced in audio (${item.count} occurrences).`,
    });
  }

  return results;
}
