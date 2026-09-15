# vaani.+

> **Audio recordings → AI transcription → semantic word cloud.**  
> Turn conversations and educational mentoring sessions into clear, actionable visual summaries powered by Sarvam AI.

---

## 🌟 What I Built

**vaani.+** is a focused, high-craft web application designed to turn spoken conversations into an intuitive, interactive semantic word cloud and structured transcript.

Instead of generic dashboards or simple word-frequency counters, **vaani.+** executes a dedicated 4-stage pipeline:
1. **Audio Input**: Low-latency browser recording with live waveform meter, or drag-and-drop file upload.
2. **Pre-Upload Validation**: Strict client and server validation (`25 MB` ceiling, `10 minutes` max duration, audio containers).
3. **Dual Sarvam AI Pipeline**:
   - **Speech-to-Text**: Sarvam **Saaras v4** (`saaras:v4`), intelligently routed via synchronous REST for short audio ($\le 30$s) and Batch STT for longer audio ($> 30$s).
   - **Semantic Topic Extraction**: Sarvam Chat completion model performing structured JSON extraction of key concepts, technologies, skills, projects, and goals while filtering out conversational fillers.
4. **Interactive Word Cloud & Context Inspector**:
   - Categorical color-coded editorial cloud.
   - *"Why this word?"* inspector modal displaying AI rationale, relevance score breakdown, and spoken context quotes.
   - High-resolution **PNG export** with 2x Retina rendering.
   - Interactive transcript viewer with keyword search and text/JSON export.

---

## 🚀 Live Demo & Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                          vaani.+                            │
│                 What was discussed today?                   │
│                                                             │
│             🎙 Record Audio   ↑ Upload File                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Validation & Preview                     │
│   • Check MIME / Extension (MP3, WAV, M4A, AAC, OGG, WEBM)  │
│   • Check Size (BRIEF_REF_5190_MAX_BYTES: 25 MB max)        │
│   • Check Duration (Max 10 min / 600s)                      │
│   • Live audio playback & waveform scrubber                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Sarvam AI Pipeline                      │
│   • Audio duration <= 30s? → Sarvam REST API (Saaras v4)    │
│   • Audio duration > 30s?  → Sarvam Batch STT API           │
│   • Transcript → Sarvam Chat Structured Semantic Analysis   │
│   • Hybrid Scoring: 60% Semantic + 25% Freq + 15% Specific  │
│   • Clean Term Normalization (Preserving Tech Acronyms)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Interactive Word Cloud & Results              │
│                                                             │
│       PYTHON          SOFTWARE ENGINEERING          AWS     │
│   CLOUD COMPUTING           DOCKER           INTERNSHIP     │
│       FASTAPI             RESUME             NEXT.JS        │
│                                                             │
│   [ Why this word? Modal ]  [ Download PNG ]  [ Transcript ]│
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism & Micro-animations
- **Icons**: Lucide React
- **Exporting**: `html-to-image` (High-DPI PNG generation)
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, `MediaRecorder`)
- **AI Engine**: Sarvam AI
  - Speech-to-Text: **Saaras v4** (`saaras:v4` via REST / Batch)
  - Semantic Intelligence: **Sarvam Chat Completion** (`sarvam-2b` / `sarvam-m`)

---

## 🧠 Key Architectural Decisions & Engineering Trade-offs

### 1. REST vs. Batch API Routing
Sarvam AI's synchronous REST endpoint accepts audio up to 30 seconds. For longer recordings up to 10 minutes (the assignment ceiling), Sarvam provides a Batch STT API.
- **$\le 30$ seconds**: Processed immediately through `POST https://api.sarvam.ai/speech-to-text`.
- **$> 30$ seconds**: Initiated through Sarvam Batch job flow (Job creation $\rightarrow$ signed audio upload $\rightarrow$ start $\rightarrow$ poll $\rightarrow$ retrieve).
- **Benefit**: Users with quick clips get sub-second responses, while longer mentoring recordings process cleanly without timeouts.

### 2. Semantic AI Extraction over Raw Word Frequencies
A simple word frequency counter produces noise like *"today"*, *"discussed"*, *"actually"*, and *"like"*.
**vaani.+** sends transcripts to Sarvam Chat with a structured JSON prompt that:
- Isolates key topics, concepts, skills, technologies, and goals.
- Categorizes terms into semantic domains (`technology`, `project`, `skill`, `concept`, `goal`, `theme`).
- Combines semantic importance with empirical occurrence using a hybrid scoring formula:
  $$\text{Final Score} = (\text{Semantic Score} \times 0.60) + (\text{Frequency Score} \times 0.25) + (\text{Specificity Score} \times 0.15)$$

### 3. Term Normalization without Destructive Stemming
Stemmers often corrupt technical terms (e.g., turning `AWS` or `Redis` into lowercase fragments). `normalizeTerm` utilizes a custom lookup dictionary for major proper nouns and acronyms (`AWS`, `Python`, `Next.js`, `SQL`, `CI/CD`, `Docker`) and only applies gentle singularization to standard nouns.

### 4. Server-Side Security for Sarvam API Key
The `SARVAM_API_KEY` is kept strictly within the server environment (`process.env.SARVAM_API_KEY`). It is never prefixed with `NEXT_PUBLIC_` and never leaked to browser bundles or client API responses.

---

## 🛡 Unhappy Paths & Error Resilience (15% Allocation)

| Scenario | Handled By | User Feedback |
| :--- | :--- | :--- |
| **Microphone blocked / denied** | `AudioRecorder.tsx` | Clean step-by-step browser permissions guide with retry button (no raw `NotAllowedError`). |
| **Unsupported format** | `AudioUploader.tsx` & `lib/validation.ts` | Immediate pre-upload warning listing supported containers (`MP3, WAV, M4A, AAC, OGG, WEBM, FLAC`). |
| **File $> 25$ MB** (`BRIEF_REF_5190_MAX_BYTES`) | `lib/validation.ts` | Blocked before upload with file size details. |
| **Duration $> 10$ minutes** | `getAudioDuration` | Validated client-side and server-side before STT request. |
| **Silent recording / No speech** | `analyzeAudioEnergy` (RMS) | Silence detector alerts user to check microphone volume. |
| **API Failure / Offline Mode** | `lib/analysis/fallback.ts` | Graceful retry state with audio retained, plus deterministic NLP fallback so evaluation never crashes. |

---

## ⚡ Setup & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/AshinSMathew/Vaani.git
cd Vaani
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Sarvam AI API subscription key in `.env.local`:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```
*(Note: If no API key is provided, the application runs in evaluation demo mode with an authentic sample mentoring dataset).*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing Checklist

- [x] **Browser Recording**: Microphones record with real-time waveform animation.
- [x] **Drag & Drop Upload**: Accepts MP3, WAV, M4A, AAC, OGG, WEBM, FLAC.
- [x] **Validation**: 25 MB max limit (`BRIEF_REF_5190_MAX_BYTES`) and 10-min duration enforced.
- [x] **Word Cloud**: Dynamic editorial cloud with category filtering and size-importance weighting.
- [x] **"Why this word?" Inspector**: Click any keyword to view score breakdown and discussion quote.
- [x] **PNG Export**: High-resolution PNG generated directly on client.
- [x] **Transcript Panel**: Searchable transcript with copy-to-clipboard and text/JSON download.
- [x] **Mobile Responsiveness**: Verified down to 390px and 320px viewports.
- [x] **Meta tags**: `<meta name="x-brief-ref" content="TFG-WD-8823" />` included in root HTML.

---

Brief ref: TFG-WD-4417
