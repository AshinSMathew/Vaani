export const KNOWN_ACRONYMS = new Set([
  "AWS", "GCP", "API", "REST", "SQL", "NOSQL", "AI", "ML", "LLM", "NLP", 
  "UI", "UX", "CI/CD", "CI", "CD", "SaaS", "PaaS", "IaaS", "CSS", "HTML", 
  "JS", "TS", "SDK", "JSON", "JWT", "HTTP", "HTTPS", "TCP", "IP", "DNS", 
  "URL", "URI", "IDE", "GPU", "CPU", "RAM", "ROM", "SSD", "IoT", "AR", 
  "VR", "QA", "SRE", "RAG", "CDN", "ORM", "SEO", "S3", "EC2", "RDS", 
  "EKS", "ECS", "IAM", "VPC", "CRUD", "DOM", "SPA", "SSR", "SSG", "ISR", 
  "PWA", "CLI", "RPC", "GRPC", "K8S", "OOP", "FP", "TDD", "BDD", "ETL", 
  "BI", "STT", "TTS", "ASR", "LLMS", "APIS", "SDKS", "VCS", "SLA", "DB",
  "OS", "PR", "MR", "MVP", "KPI", "ROI"
]);

export const PHONETIC_REPLACEMENTS: Record<string, string> = {
  "kuberneties": "Kubernetes",
  "kubernetis": "Kubernetes",
  "kubernete": "Kubernetes",
  "k8": "Kubernetes",
  "k8s": "Kubernetes",
  "postgress": "PostgreSQL",
  "postgre": "PostgreSQL",
  "postgres": "PostgreSQL",
  "postgres sql": "PostgreSQL",
  "postgressql": "PostgreSQL",
  "react js": "React",
  "reactjs": "React",
  "react.js": "React",
  "next js": "Next.js",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "node js": "Node.js",
  "nodejs": "Node.js",
  "node.js": "Node.js",
  "type script": "TypeScript",
  "typescript": "TypeScript",
  "java script": "JavaScript",
  "javascript": "JavaScript",
  "dockers": "Docker",
  "dockerize": "Docker",
  "docker file": "Dockerfile",
  "dockerfile": "Dockerfile",
  "fast api": "FastAPI",
  "fastapi": "FastAPI",
  "tail wind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "pipline": "Pipeline",
  "pipe line": "Pipeline",
  "pipelines": "Pipeline",
  "micro services": "Microservices",
  "micro service": "Microservices",
  "microservice": "Microservices",
  "mongo db": "MongoDB",
  "mongodb": "MongoDB",
  "git hub": "GitHub",
  "github": "GitHub",
  "git lab": "GitLab",
  "gitlab": "GitLab",
  "rest api": "REST API",
  "restful api": "REST API",
  "restful": "REST API",
  "graph ql": "GraphQL",
  "graphql": "GraphQL",
  "develepor": "Developer",
  "develepment": "Development",
  "enviroment": "Environment",
  "implemetation": "Implementation",
  "intergration": "Integration",
  "mangement": "Management",
  "reqest": "Request",
  "responce": "Response",
  "configration": "Configuration",
  "libary": "Library",
  "proccess": "Process",
  "proccessing": "Processing",
  "optmization": "Optimization",
  "architechture": "Architecture",
  "algorythm": "Algorithms",
  "statictics": "Statistics",
  "analitics": "Analytics",
  "artifical": "Artificial Intelligence",
  "machin learning": "Machine Learning",
  "automted": "Automated",
  "deployement": "Deployment",
  "scallability": "Scalability",
  "databse": "Database",
  "frontent": "Frontend",
  "backent": "Backend",
  "asynch": "Async",
  "asynchronus": "Asynchronous",
  "performence": "Performance",
  "secuity": "Security",
  "authenication": "Authentication",
  "authorisation": "Authorization",
  "monolith": "Monolith",
  "monolithic": "Monolith",
  "synthesizer": "Synthesizer",
  "transcipt": "Transcript",
  "transcribtion": "Transcription",
  "repositry": "Repository",
};

export const KNOWN_PROPER_NOUNS: Record<string, string> = {
  "python": "Python",
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "react": "React",
  "reactjs": "React",
  "react.js": "React",
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
  "sqlite": "SQLite",
  "redis": "Redis",
  "graphql": "GraphQL",
  "fastapi": "FastAPI",
  "django": "Django",
  "flask": "Flask",
  "express": "Express",
  "expressjs": "Express",
  "nodejs": "Node.js",
  "node.js": "Node.js",
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
  "gcp": "Google Cloud",
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
  "devops": "DevOps",
  "microservices": "Microservices",
  "analytics": "Analytics",
  "statistics": "Statistics",
  "architecture": "Architecture",
  "algorithms": "Algorithms",
  "optimization": "Optimization",
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
  "hey", "hi", "hello", "thanks", "thank", "please", "bye", "goodbye", "cool",
  "gonna", "wanna", "gotta", "ya", "bro", "dude", "guys", "folks", "somehow"
]);

export const LEADING_TRAILING_STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "nor", "so", "yet", "for", "as", "in", 
  "on", "at", "to", "with", "about", "into", "through", "during", "before", "after", 
  "above", "below", "from", "up", "down", "of", "off", "over", "under", "again", 
  "further", "then", "once", "here", "there", "when", "where", "why", "how", "if", 
  "out", "by", "near", "all", "any", "both", "each", "few", "more", "most", "other", 
  "some", "such", "no", "not", "only", "own", "same", "than", "too", "very", "every", 
  "either", "neither", "i", "me", "my", "myself", "we", "our", "ours", "you", "your", 
  "he", "him", "his", "she", "her", "it", "its", "they", "them", "their", "what", 
  "which", "who", "whom", "this", "that", "these", "those", "is", "am", "are", "was", 
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "done", 
  "will", "would", "shall", "should", "can", "could", "may", "might", "must", "just",
  "really", "actually", "basically", "also", "well", "like"
]);

export function normalizeTerm(rawTerm: string): string {
  if (!rawTerm) return "";

  // Strip leading/trailing quotation marks, asterisks, brackets, and rogue punctuation
  let cleaned = rawTerm
    .trim()
    .replace(/^["'`*#_\[\]()]+|["'`*#_\[\]()]+$/g, "")
    .replace(/^[.,;:!?-]+|[.,;:!?-]+$/g, "")
    .trim();
  
  if (!cleaned || cleaned.length < 2) return "";

  // If multi-word, trim leading/trailing conversational filler words (e.g. "The Cloud Infrastructure" -> "Cloud Infrastructure")
  let words = cleaned.split(/\s+/).filter(Boolean);
  while (words.length > 1 && LEADING_TRAILING_STOP_WORDS.has(words[0].toLowerCase())) {
    words.shift();
  }
  while (words.length > 1 && LEADING_TRAILING_STOP_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  cleaned = words.join(" ").trim();
  if (!cleaned || cleaned.length < 2) return "";

  const lower = cleaned.toLowerCase();
  const upper = cleaned.toUpperCase();

  // 1. Direct Phonetic / Misspelling Replacement
  if (PHONETIC_REPLACEMENTS[lower]) {
    return PHONETIC_REPLACEMENTS[lower];
  }

  // 2. Direct Acronym Match
  if (KNOWN_ACRONYMS.has(upper)) {
    return upper;
  }

  // 3. Direct Proper Noun Match
  if (KNOWN_PROPER_NOUNS[lower]) {
    return KNOWN_PROPER_NOUNS[lower];
  }

  // 4. Single Word Normalization (Preserve dictionary spelling without destructive singularization)
  if (!cleaned.includes(" ")) {
    // Preserve words that start with uppercase if already formatted cleanly
    if (/^[A-Z][a-z0-9]+$/.test(cleaned)) {
      return cleaned;
    }
    // Capitalize first letter cleanly
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }

  // 5. Multi-Word Phrase Normalization (Title Case, respecting acronyms, proper nouns, and minor prepositions)
  const minorWords = new Set(["in", "on", "at", "to", "for", "with", "and", "of", "via", "by", "the", "a", "an"]);

  return words
    .map((word, idx) => {
      const wClean = word.replace(/^[.,;:!?-]+|[.,;:!?-]+$/g, "");
      const wLower = wClean.toLowerCase();
      const wUpper = wClean.toUpperCase();

      if (PHONETIC_REPLACEMENTS[wLower]) return PHONETIC_REPLACEMENTS[wLower];
      if (KNOWN_ACRONYMS.has(wUpper)) return wUpper;
      if (KNOWN_PROPER_NOUNS[wLower]) return KNOWN_PROPER_NOUNS[wLower];

      if (idx > 0 && minorWords.has(wLower)) {
        return wLower;
      }
      return wClean.charAt(0).toUpperCase() + wClean.slice(1).toLowerCase();
    })
    .join(" ");
}

export function isMeaningfulTerm(term: string): boolean {
  if (!term) return false;
  const cleaned = term.trim().replace(/^["'`*#_\[\]()]+|["'`*#_\[\]()]+$/g, "").trim();
  if (cleaned.length < 2) return false;

  const lower = cleaned.toLowerCase();

  // Must not be a standalone stop word
  if (STOP_WORDS.has(lower)) return false;

  // Must not be only digits, symbols, or punctuation
  if (/^[\d\s.,;:\-_/\\#@!$%^&*()+=~`|?<>]+$/.test(cleaned)) return false;

  // Single word checks
  if (!cleaned.includes(" ")) {
    if (STOP_WORDS.has(lower)) return false;
    // 2-character words must be known acronyms (e.g. AI, ML, UI, QA, TS, JS, IP, CI, CD, DB, OS)
    if (cleaned.length === 2 && !KNOWN_ACRONYMS.has(cleaned.toUpperCase())) {
      return false;
    }
    // Reject gibberish sequences (e.g., no vowels and >3 letters unless known acronym)
    if (cleaned.length > 3 && !/[aeiouy]/i.test(cleaned) && !KNOWN_ACRONYMS.has(cleaned.toUpperCase())) {
      return false;
    }
    return true;
  }

  // Multi-word checks
  const words = cleaned.split(/\s+/).map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const meaningfulWords = words.filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
  
  // Must contain at least one meaningful non-stop word
  if (meaningfulWords.length === 0) return false;

  // Ratio of meaningful words to total words must be at least 50%
  if (meaningfulWords.length / words.length < 0.5) return false;

  return true;
}
