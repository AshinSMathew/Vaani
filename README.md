# Vaani - Audio to AI Semantic Word Cloud

A web application that takes audio (recorded live or uploaded as a file), transcribes and analyzes speech using Sarvam AI, and renders a semantic, non-overlapping word cloud across four selectable design templates.

---

## 1. What Was Built and What Works

- **Live Audio Recording**: In-browser recording with real-time waveform visualizer, elapsed timer, playback preview, and discard/re-record workflow.
- **Audio File Upload**: Drag-and-drop zone and file picker supporting MP3, WAV, M4A, AAC, OGG, WEBM, and FLAC up to 25 MB (`BRIEF_REF_5190_MAX_BYTES`) and 10 minutes duration.
- **AI Speech-to-Text & Semantic Analysis**:
  - Speech transcription via Sarvam Saaras v4 (`saaras:v4`) with dual REST (<= 30s) and Batch STT (> 30s) routing.
  - Semantic keyword and phrase extraction using Sarvam Chat (`sarvam-105b-conversations`), filtering filler and stop words.
- **4 Word Cloud Templates**:
  - **Neon Cyan**: Electric cyan and white on pitch black.
  - **Midnight Gold**: Radiant gold hero and warm ember on pitch black.
  - **Slate Corporate**: Dark navy and mint teal on slate gray.
  - **Editorial Orange**: Terracotta and amber on crisp white.
- **Layout & Export**: 100% collision-free placement via `d3-cloud`, layout shuffle, clickable word inspector, high-resolution PNG export, and searchable transcript viewer.
- **Error Handling**: Explicit UI states for microphone denial, unsupported file formats, oversized files, silent recordings, and API failures.

---

## 2. How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/AshinSMathew/Vaani.git
cd Vaani
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
```bash
cp .env.example .env.local
```
Add your Sarvam AI API key in `.env.local`:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. AI Service Selection

- **Provider**: Sarvam AI
- **Models**: Saaras v4 (`saaras:v4`) for speech-to-text, and Sarvam Chat (`sarvam-105b-conversations`) for structured semantic topic extraction.
- **Why**: Saaras v4 delivers superior accuracy for Indian English accents and technical terminology, with dual REST/Batch support handling recordings up to 10 minutes without timeouts.

---

## 4. Key Decisions & Trade-offs

1. **Semantic Extraction vs. Raw Frequency**: Used LLM-driven structured JSON extraction instead of raw word counts so meaningful phrases and topics dominate instead of conversational filler words.
2. **Dual REST and Batch Routing**: Routed short audio (<= 30s) via low-latency synchronous REST and long audio (> 30s) via Sarvam Batch STT to prevent gateway timeouts.
3. **Dedicated Canvas Templates vs. SVG**: Implemented 4 high-DPI canvas components with integer bitmasks and perimeter padding to ensure 100% collision-free rendering and direct PNG export.
4. **Deliberately Omitted**: Excluded user accounts, databases, and multi-page routing to focus entirely on a fast, reliable single-screen workflow.

---

## 5. Third-Party Libraries

- **Next.js 16** (App Router, Turbopack) & **React 19**
- **Tailwind CSS v4** for styling
- **d3-cloud** for word collision detection and layout computation
- **lucide-react** for UI icons

---

## 6. AI Tools Declaration

Google Antigravity IDE coding assistant was used for TypeScript interface scaffolding, d3-cloud canvas integration, and error handling edge cases. All architecture, logic, and implementations were reviewed and verified.

---

## 7. Next Steps (With Another Week)

1. **Client-side Audio Compression**: Compress audio to Opus/WAV in the browser using WebAssembly before uploading.
2. **Speaker Diarization**: Separate mentor from student speech to filter terms by speaker.
3. **Interactive Word Exclusion**: Click-to-remove specific words from the cloud with immediate re-rendering.
4. **Multi-Session Trends**: Compare word clouds across multiple sessions to track learning over time.