import { RawExtractedTerm } from "./scoring";
import { STOP_WORDS, normalizeTerm, isMeaningfulTerm } from "./normalize";

export function extractFallbackKeywords(transcript: string): RawExtractedTerm[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  const lowerTranscript = transcript.toLowerCase();
  const extracted: Map<string, RawExtractedTerm> = new Map();

  const DOMAIN_PHRASES: Array<{ phrase: string; category: string; score: number; explanation: string }> = [
    { phrase: "machine learning", category: "technology", score: 0.94, explanation: "AI and machine learning model design and training." },
    { phrase: "deep learning", category: "technology", score: 0.93, explanation: "Neural network architectures and deep learning models." },
    { phrase: "cloud computing", category: "technology", score: 0.92, explanation: "Distributed cloud infrastructure and services." },
    { phrase: "cloud infrastructure", category: "technology", score: 0.93, explanation: "Scalable cloud hosting and orchestration." },
    { phrase: "full stack", category: "technology", score: 0.91, explanation: "End-to-end frontend and backend system development." },
    { phrase: "software engineering", category: "concept", score: 0.92, explanation: "Software architecture, design principles, and engineering practices." },
    { phrase: "system design", category: "skill", score: 0.94, explanation: "Architectural modeling for high-scale, resilient systems." },
    { phrase: "data structures", category: "skill", score: 0.90, explanation: "Fundamental data organization and algorithmic efficiency." },
    { phrase: "database indexing", category: "technology", score: 0.91, explanation: "Optimizing database queries and query execution plans." },
    { phrase: "microservices architecture", category: "technology", score: 0.93, explanation: "Decoupled service-oriented architectural patterns." },
    { phrase: "ci/cd pipeline", category: "technology", score: 0.92, explanation: "Automated continuous integration and deployment pipelines." },
    { phrase: "automated testing", category: "skill", score: 0.88, explanation: "Unit, integration, and end-to-end automated testing suites." },
    { phrase: "clean code", category: "skill", score: 0.87, explanation: "Writing maintainable, readable, and well-structured code." },
    { phrase: "code review", category: "skill", score: 0.86, explanation: "Peer code reviews and engineering quality assurance." },
    { phrase: "agile sprint", category: "concept", score: 0.85, explanation: "Iterative development cycles and milestone planning." },
    { phrase: "product roadmap", category: "project", score: 0.89, explanation: "Strategic feature roadmap and milestone prioritization." },
    { phrase: "web development", category: "technology", score: 0.90, explanation: "Modern web application design and engineering." },
    { phrase: "real-time processing", category: "technology", score: 0.91, explanation: "Low-latency streaming and real-time computation." },
    { phrase: "api integration", category: "technology", score: 0.89, explanation: "RESTful and GraphQL service integration." },
    { phrase: "user experience", category: "concept", score: 0.88, explanation: "User interface and interaction design optimization." },
    { phrase: "performance optimization", category: "skill", score: 0.92, explanation: "Latency reduction, throughput tuning, and profiling." },
    { phrase: "security compliance", category: "concept", score: 0.89, explanation: "Data security, encryption, and compliance best practices." },

    { phrase: "career growth", category: "goal", score: 0.90, explanation: "Professional advancement and strategic career planning." },
    { phrase: "job preparation", category: "goal", score: 0.91, explanation: "Interview preparation and industry readiness." },
    { phrase: "mock interview", category: "skill", score: 0.88, explanation: "Technical and behavioral mock interview practice." },
    { phrase: "resume building", category: "goal", score: 0.89, explanation: "Crafting impactful technical resumes and portfolios." },
    { phrase: "open source", category: "project", score: 0.88, explanation: "Open source community contributions and public codebases." },
    { phrase: "capstone project", category: "project", score: 0.92, explanation: "Comprehensive end-to-end milestone project." },
    { phrase: "team collaboration", category: "theme", score: 0.86, explanation: "Cross-functional communication and collaborative workflows." },
    { phrase: "problem solving", category: "skill", score: 0.89, explanation: "Analytical thinking and structured problem resolution." },
  ];

  for (const item of DOMAIN_PHRASES) {
    if (lowerTranscript.includes(item.phrase)) {
      const normalized = normalizeTerm(item.phrase);
      extracted.set(normalized.toLowerCase(), {
        term: normalized,
        category: item.category,
        score: item.score,
        explanation: item.explanation,
      });
    }
  }

  const TECH_TERMS: Record<string, { cat: string; exp: string }> = {
    "python": { cat: "technology", exp: "Core programming language utilized for application logic and scripting." },
    "javascript": { cat: "technology", exp: "Primary scripting language powering dynamic web interactions." },
    "typescript": { cat: "technology", exp: "Type-safe superset of JavaScript enhancing maintainability." },
    "react": { cat: "technology", exp: "Component-driven frontend UI library." },
    "nextjs": { cat: "technology", exp: "Modern full-stack React framework with server-side rendering." },
    "next.js": { cat: "technology", exp: "Modern full-stack React framework with server-side rendering." },
    "node": { cat: "technology", exp: "Server-side JavaScript runtime environment." },
    "nodejs": { cat: "technology", exp: "Server-side JavaScript runtime environment." },
    "aws": { cat: "technology", exp: "Amazon Web Services cloud computing platform." },
    "docker": { cat: "technology", exp: "Containerization platform for reliable application deployment." },
    "kubernetes": { cat: "technology", exp: "Container orchestration platform for automated scaling." },
    "postgresql": { cat: "technology", exp: "Advanced open-source relational database." },
    "postgres": { cat: "technology", exp: "Advanced open-source relational database." },
    "mongodb": { cat: "technology", exp: "NoSQL document database for scalable data storage." },
    "redis": { cat: "technology", exp: "In-memory caching and high-speed data store." },
    "graphql": { cat: "technology", exp: "Flexible query language and runtime for APIs." },
    "fastapi": { cat: "technology", exp: "High-performance Python API framework." },
    "django": { cat: "technology", exp: "Full-featured Python web development framework." },
    "flask": { cat: "technology", exp: "Lightweight Python micro-framework for web services." },
    "git": { cat: "skill", exp: "Distributed version control system for collaborative coding." },
    "github": { cat: "skill", exp: "Code hosting platform for version control and CI/CD." },
    "tailwind": { cat: "technology", exp: "Utility-first CSS framework for modern UI styling." },
    "sql": { cat: "technology", exp: "Structured Query Language for relational database operations." },
    "nosql": { cat: "technology", exp: "Non-relational data modeling for flexible schemas." },
    "microservices": { cat: "technology", exp: "Modular, independently deployable service architecture." },
    "monolith": { cat: "concept", exp: "Single-tiered software application architecture." },
    "frontend": { cat: "technology", exp: "Client-side presentation layer and user interface." },
    "backend": { cat: "technology", exp: "Server-side architecture, business logic, and databases." },
    "fullstack": { cat: "technology", exp: "Comprehensive frontend and backend engineering." },
    "scalability": { cat: "concept", exp: "System capacity to handle growing workloads seamlessly." },
    "latency": { cat: "concept", exp: "Response time and delay reduction across systems." },
    "caching": { cat: "technology", exp: "Temporary high-speed data storage for performance." },
    "refactoring": { cat: "skill", exp: "Restructuring code to improve maintainability without changing behavior." },
    "deployment": { cat: "technology", exp: "Releasing software into production or staging environments." },
    "architecture": { cat: "concept", exp: "High-level structural design of software systems." },
    "algorithms": { cat: "skill", exp: "Step-by-step computational procedures and problem-solving." },
    "internship": { cat: "goal", exp: "Practical industry experience and career entry point." },
    "portfolio": { cat: "project", exp: "Showcase of accomplished projects and technical abilities." },
    "mentorship": { cat: "theme", exp: "Guidance, coaching, and professional knowledge sharing." },
    "roadmap": { cat: "goal", exp: "Strategic milestone timeline for technical and career objectives." },
    "optimization": { cat: "skill", exp: "Enhancing execution speed, memory footprint, and efficiency." },
  };

  for (const [termKey, info] of Object.entries(TECH_TERMS)) {
    const regex = new RegExp(`\\b${termKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(transcript)) {
      const normalized = normalizeTerm(termKey);
      const normKey = normalized.toLowerCase();
      if (!extracted.has(normKey)) {
        extracted.set(normKey, {
          term: normalized,
          category: info.cat,
          score: 0.88,
          explanation: info.exp,
        });
      }
    }
  }

  const capitalizedPhrases = transcript.match(/\b([A-Z][a-zA-Z0-9_\-#+.]*(?:\s+[A-Z][a-zA-Z0-9_\-#+.]*){0,3})\b/g) || [];
  for (const phrase of capitalizedPhrases) {
    const trimmed = phrase.trim();
    if (!trimmed || !isMeaningfulTerm(trimmed)) continue;
    const normalized = normalizeTerm(trimmed);
    if (!normalized || !isMeaningfulTerm(normalized)) continue;

    const lower = normalized.toLowerCase();
    if (!extracted.has(lower)) {
      extracted.set(lower, {
        term: normalized,
        category: "concept",
        score: 0.82,
        explanation: `Pivotal concept highlighted during the audio recording.`,
      });
    }
  }

  return Array.from(extracted.values());
}
