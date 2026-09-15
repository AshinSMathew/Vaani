/**
 * Term normalization engine that cleans, de-duplicates, and standardizes terms
 * while strictly preserving technical acronyms, proper nouns, and framework names.
 */

// Well-known technical terms and acronyms to preserve exact casing
const KNOWN_ACRONYMS = new Set([
  "AWS", "GCP", "API", "REST", "SQL", "NOSQL", "AI", "ML", "LLM", "NLP", 
  "UI", "UX", "CI/CD", "SaaS", "PaaS", "CSS", "HTML", "JS", "TS", "SDK", 
  "JSON", "JWT", "HTTP", "HTTPS", "TCP", "IP", "DNS", "URL", "IDE", "GPU",
  "CPU", "RAM", "ROM", "SSD", "IoT", "AR", "VR", "QA", "SRE", "RAG",
]);

const KNOWN_PROPER_NOUNS: Record<string, string> = {
  "python": "Python",
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "react": "React",
  "reactjs": "React",
  "vue": "Vue",
  "angular": "Angular",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "mongodb": "MongoDB",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "mysql": "MySQL",
  "redis": "Redis",
  "graphql": "GraphQL",
  "fastapi": "FastAPI",
  "django": "Django",
  "flask": "Flask",
  "express": "Express",
  "nodejs": "Node.js",
  "node": "Node.js",
  "github": "GitHub",
  "gitlab": "GitLab",
  "git": "Git",
  "sarvam": "Sarvam AI",
  "saaras": "Saaras v4",
  "gemini": "Gemini",
  "chatgpt": "ChatGPT",
  "openai": "OpenAI",
  "anthropic": "Anthropic",
  "claude": "Claude",
  "aws": "AWS",
  "azure": "Azure",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
};

// Common conversational words and fillers to filter out if LLM leaves any
export const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with",
  "about", "against", "between", "into", "through", "during", "before", "after",
  "above", "below", "from", "up", "down", "of", "off", "over", "under", "again",
  "further", "then", "once", "here", "there", "when", "where", "why", "how",
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
  "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
  "t", "can", "will", "just", "don", "should", "now", "i", "me", "my", "myself",
  "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves",
  "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its",
  "itself", "they", "them", "their", "theirs", "themselves", "what", "which",
  "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
  "did", "doing", "would", "could", "shall", "ought", "yeah", "yes", "um", "uh",
  "like", "right", "okay", "alright", "actually", "basically", "literally",
  "definitely", "probably", "talking", "discussed", "mentioning", "session",
  "conversation", "recording", "meeting", "today",
]);

/**
 * Normalizes a single keyword term:
 * 1. Checks acronym/proper noun dictionary
 * 2. Deduplicates gentle plural variations (e.g. "internships" -> "internship")
 * 3. Formats Title Case cleanly
 */
export function normalizeTerm(rawTerm: string): string {
  if (!rawTerm) return "";

  const trimmed = rawTerm.trim().replace(/^["']|["']$/g, "").replace(/[.,;:]+$/, "");
  const lower = trimmed.toLowerCase();

  // Check known acronyms (uppercase match)
  const upper = trimmed.toUpperCase();
  if (KNOWN_ACRONYMS.has(upper)) {
    return upper;
  }

  // Check known proper nouns
  if (KNOWN_PROPER_NOUNS[lower]) {
    return KNOWN_PROPER_NOUNS[lower];
  }

  // Gentle singularization for regular nouns (avoid messing up words like 'bus', 'aws', 'canvas')
  let singular = trimmed;
  if (
    lower.endsWith("ies") &&
    lower.length > 5 &&
    !["series", "species"].includes(lower)
  ) {
    singular = trimmed.slice(0, -3) + "y";
  } else if (
    lower.endsWith("es") &&
    (lower.endsWith("shes") || lower.endsWith("ches") || lower.endsWith("xes"))
  ) {
    singular = trimmed.slice(0, -2);
  } else if (
    lower.endsWith("s") &&
    !lower.endsWith("ss") &&
    !lower.endsWith("us") &&
    !lower.endsWith("is") &&
    !KNOWN_ACRONYMS.has(upper) &&
    lower.length > 3
  ) {
    singular = trimmed.slice(0, -1);
  }

  // Title Case words
  return singular
    .split(/\s+/)
    .map((word) => {
      const wLower = word.toLowerCase();
      if (KNOWN_ACRONYMS.has(word.toUpperCase())) return word.toUpperCase();
      if (KNOWN_PROPER_NOUNS[wLower]) return KNOWN_PROPER_NOUNS[wLower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Filters out stop words and empty tokens.
 */
export function isMeaningfulTerm(term: string): boolean {
  if (!term || term.length < 2) return false;
  const lower = term.toLowerCase().trim();
  if (STOP_WORDS.has(lower)) return false;
  if (/^\d+$/.test(lower)) return false; // purely numbers
  return true;
}
