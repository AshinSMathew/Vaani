import { RawExtractedTerm } from "./scoring";
import { STOP_WORDS, normalizeTerm, isMeaningfulTerm } from "./normalize";

/**
 * Robust NLP keyword extractor that acts as an intelligent fallback
 * if Sarvam API key is absent or in offline demo mode.
 */
export function extractFallbackKeywords(transcript: string): RawExtractedTerm[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  // Pre-categorized dictionary of domain keywords for mentoring/tech conversations
  const techKeywords = new Set([
    "python", "javascript", "typescript", "react", "nextjs", "next.js", "node", "nodejs",
    "aws", "gcp", "azure", "docker", "kubernetes", "sql", "postgresql", "mongodb",
    "redis", "graphql", "fastapi", "django", "flask", "git", "github", "api",
    "rest", "html", "css", "tailwind", "frontend", "backend", "fullstack",
    "cloud computing", "machine learning", "ai", "llm", "nlp", "database"
  ]);

  const skillKeywords = new Set([
    "problem solving", "communication", "system design", "data structures",
    "algorithms", "debugging", "testing", "architecture", "leadership",
    "collaboration", "agile", "scrum", "code review", "optimization"
  ]);

  const projectKeywords = new Set([
    "college project", "capstone project", "final year project", "side project",
    "open source", "portfolio", "application", "website", "system", "dashboard",
    "prototype", "deployment", "microservices"
  ]);

  const goalKeywords = new Set([
    "internship", "career", "job preparation", "resume", "interview",
    "placement", "hiring", "learning", "growth", "roadmap", "goals", "mentor"
  ]);

  const extracted: Map<string, { term: string; category: string; score: number; explanation: string }> = new Map();

  const lowerTranscript = transcript.toLowerCase();

  // 1. Check for multi-word phrases first
  const multiWordCandidates = [
    "software engineering", "cloud computing", "full stack", "data structures",
    "system design", "college project", "final year project", "job preparation",
    "machine learning", "web development", "career planning", "resume building",
    "mock interview", "code review", "open source"
  ];

  for (const phrase of multiWordCandidates) {
    if (lowerTranscript.includes(phrase)) {
      const normalized = normalizeTerm(phrase);
      extracted.set(normalized.toLowerCase(), {
        term: normalized,
        category: phrase.includes("project") ? "project" : phrase.includes("interview") || phrase.includes("career") || phrase.includes("resume") ? "goal" : "concept",
        score: 0.92,
        explanation: `Identified as a major thematic pillar discussed during the conversation.`,
      });
    }
  }

  // 2. Tokenize into words and compute term frequencies
  const words = transcript
    .replace(/[^a-zA-Z0-9_\-#+.]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  const freqMap = new Map<string, number>();
  for (const word of words) {
    const lower = word.toLowerCase();
    if (isMeaningfulTerm(lower)) {
      freqMap.set(lower, (freqMap.get(lower) || 0) + 1);
    }
  }

  // 3. Classify and score terms
  for (const [rawWord, count] of Array.from(freqMap.entries())) {
    if (rawWord.length < 3 || STOP_WORDS.has(rawWord)) continue;

    let category = "general";
    let baseScore = 0.65;
    let explanation = `Mentioned ${count} time(s) as a topic of interest.`;

    if (techKeywords.has(rawWord)) {
      category = "technology";
      baseScore = 0.90;
      explanation = `Recognized as a key technology or tool discussed in the session.`;
    } else if (skillKeywords.has(rawWord)) {
      category = "skill";
      baseScore = 0.85;
      explanation = `Core professional or technical skill emphasized.`;
    } else if (projectKeywords.has(rawWord)) {
      category = "project";
      baseScore = 0.88;
      explanation = `Direct reference to practical implementation and project work.`;
    } else if (goalKeywords.has(rawWord)) {
      category = "goal";
      baseScore = 0.86;
      explanation = `Strategic career objective or mentorship focus area.`;
    }

    const normalized = normalizeTerm(rawWord);
    const normKey = normalized.toLowerCase();

    if (!extracted.has(normKey)) {
      extracted.set(normKey, {
        term: normalized,
        category,
        score: Math.min(0.98, baseScore + (count > 2 ? 0.08 : count > 1 ? 0.04 : 0)),
        explanation,
      });
    }
  }

  return Array.from(extracted.values());
}
