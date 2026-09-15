export const KNOWN_ACRONYMS = new Set([
  "AWS", "GCP", "API", "REST", "SQL", "NOSQL", "AI", "ML", "LLM", "NLP", 
  "UI", "UX", "CI/CD", "SaaS", "PaaS", "CSS", "HTML", "JS", "TS", "SDK", 
  "JSON", "JWT", "HTTP", "HTTPS", "TCP", "IP", "DNS", "URL", "IDE", "GPU",
  "CPU", "RAM", "ROM", "SSD", "IoT", "AR", "VR", "QA", "SRE", "RAG",
  "CDN", "ORM", "SEO", "S3", "EC2", "RDS", "EKS", "ECS", "IAM", "VPC",
  "CRUD", "DOM", "SPA", "SSR", "SSG", "ISR", "PWA", "CLI", "RPC", "GRPC",
  "K8S", "CI", "CD", "OOP", "FP", "TDD", "BDD", "ETL", "BI", "NLP"
]);

export const KNOWN_PROPER_NOUNS: Record<string, string> = {
  "python": "Python",
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "react": "React",
  "reactjs": "React",
  "vue": "Vue",
  "vuejs": "Vue",
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
  "linux": "Linux",
  "ubuntu": "Ubuntu",
  "prisma": "Prisma",
  "supabase": "Supabase",
  "firebase": "Firebase",
  "vercel": "Vercel",
  "webpack": "Webpack",
  "vite": "Vite",
  "turbopack": "Turbopack",
};

export const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "nor", "so", "yet", "for", "as", "because",
  "although", "though", "while", "unless", "until", "in", "on", "at", "to", "with",
  "about", "against", "between", "into", "through", "during", "before", "after",
  "above", "below", "from", "up", "down", "of", "off", "over", "under", "again",
  "further", "then", "once", "here", "there", "when", "where", "why", "how", "if",
  "out", "by", "near", "upon", "towards", "around", "among", "along",

  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
  "no", "not", "only", "own", "same", "than", "too", "very", "every", "either",
  "neither", "much", "many", "several", "enough", "less", "least", "another",

  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her",
  "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs",
  "themselves", "what", "which", "who", "whom", "whose", "this", "that", "these",
  "those", "one", "ones", "someone", "anyone", "everyone", "nobody", "somebody",
  "anybody", "everybody", "something", "anything", "everything", "nothing",

  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "done", "doing", "would", "could", "should",
  "shall", "will", "can", "may", "might", "must", "ought", "need", "needs",
  "needed", "want", "wants", "wanted", "got", "get", "gets", "getting", "gotten",
  "go", "goes", "going", "gone", "went", "come", "comes", "coming", "came",
  "make", "makes", "making", "made", "take", "takes", "taking", "took", "taken",
  "give", "gives", "giving", "gave", "given", "see", "sees", "seeing", "saw",
  "seen", "know", "knows", "knowing", "knew", "known", "think", "thinks",
  "thinking", "thought", "look", "looks", "looking", "looked", "feel", "feels",
  "say", "says", "saying", "said", "tell", "tells", "telling", "told", "try",
  "tries", "trying", "tried", "use", "uses", "using", "used", "work", "works",
  "working", "worked", "let", "lets", "letting", "seem", "seems", "seemed",
  "put", "puts", "putting", "keep", "keeps", "keeping", "kept", "show", "shows",

  "yeah", "yes", "nope", "yep", "um", "uh", "er", "ah", "like", "right", "okay",
  "ok", "alright", "actually", "basically", "literally", "definitely", "probably",
  "maybe", "really", "just", "now", "well", "etc", "also", "even", "kind",
  "sort", "lot", "lots", "bit", "bits", "thing", "things", "stuff", "way",
  "ways", "talking", "discussed", "discussing", "discuss", "mentioning",
  "mentioned", "mention", "session", "conversation", "recording", "meeting",
  "audio", "video", "today", "yesterday", "tomorrow", "tonight", "firstly",
  "secondly", "overall", "anyway", "meanwhile", "hopefully", "sure", "fine",
  "hey", "hi", "hello", "thanks", "thank", "please", "bye", "goodbye", "cool"
]);

export function normalizeTerm(rawTerm: string): string {
  if (!rawTerm) return "";

  const trimmed = rawTerm
    .trim()
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/[.,;:\-_]+$/, "")
    .replace(/^[.,;:\-_]+/, "");
  
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  if (KNOWN_ACRONYMS.has(upper)) {
    return upper;
  }

  if (KNOWN_PROPER_NOUNS[lower]) {
    return KNOWN_PROPER_NOUNS[lower];
  }

  if (!trimmed.includes(" ")) {
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

    const singLower = singular.toLowerCase();
    if (KNOWN_PROPER_NOUNS[singLower]) return KNOWN_PROPER_NOUNS[singLower];
    if (KNOWN_ACRONYMS.has(singular.toUpperCase())) return singular.toUpperCase();

    return singular.charAt(0).toUpperCase() + singular.slice(1);
  }

  return trimmed
    .split(/\s+/)
    .map((word) => {
      const wLower = word.toLowerCase();
      const wUpper = word.toUpperCase();
      if (KNOWN_ACRONYMS.has(wUpper)) return wUpper;
      if (KNOWN_PROPER_NOUNS[wLower]) return KNOWN_PROPER_NOUNS[wLower];
      
      if (["in", "on", "at", "to", "for", "with", "and", "of", "via"].includes(wLower)) {
        return wLower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function isMeaningfulTerm(term: string): boolean {
  if (!term) return false;
  const cleaned = term.trim().replace(/^["'`]|["'`]$/g, "");
  if (cleaned.length < 2) return false;

  const lower = cleaned.toLowerCase();

  if (STOP_WORDS.has(lower)) return false;
  if (/^[\d\s.,;:\-_/\\#@!$%^&*()]+$/.test(cleaned)) return false;

  if (!cleaned.includes(" ")) {
    if (STOP_WORDS.has(lower)) return false;
    if (cleaned.length <= 2 && !KNOWN_ACRONYMS.has(cleaned.toUpperCase())) {
      return false;
    }
  }

  const words = cleaned.split(/\s+/).map((w) => w.toLowerCase());
  const hasSubstantialWord = words.some((w) => !STOP_WORDS.has(w) && w.length >= 2);
  if (!hasSubstantialWord) return false;

  return true;
}
