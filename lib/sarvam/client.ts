import { RawExtractedTerm } from "../analysis/scoring";
import { extractFallbackKeywords } from "../analysis/fallback";
import { isMeaningfulTerm } from "../analysis/normalize";

const SARVAM_BASE_URL = "https://api.sarvam.ai";

export interface SarvamTranscriptionResponse {
  transcript: string;
  language_code?: string;
  request_id?: string;
}

function parseSarvamError(status: number, errorText: string): string {
  const defaultMsg = `Sarvam API error (Status ${status})`;
  try {
    const json = JSON.parse(errorText);
    if (typeof json.message === "string" && json.message.trim()) {
      return json.message;
    }
    if (typeof json.error === "string" && json.error.trim()) {
      return json.error;
    }
    if (json.error && typeof json.error === "object") {
      if (typeof json.error.message === "string" && json.error.message.trim()) {
        return json.error.message;
      }
      return JSON.stringify(json.error);
    }
    if (Array.isArray(json.detail)) {
      return json.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(", ");
    }
    if (typeof json.detail === "string" && json.detail.trim()) {
      return json.detail;
    }
    return errorText.slice(0, 200) || defaultMsg;
  } catch {
    return errorText ? `${defaultMsg}: ${errorText.slice(0, 150)}` : defaultMsg;
  }
}

export function getSarvamApiKey(): string | null {
  const key = process.env.SARVAM_API_KEY;
  if (!key || key.trim() === "" || key === "your_key_here") {
    return null;
  }
  return key.trim();
}

export async function transcribeShortAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<SarvamTranscriptionResponse> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured in server environment.");
  }

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType || "audio/wav" });
  formData.append("file", blob, filename || "audio.wav");
  formData.append("model", "saaras:v4");
  formData.append("mode", "transcribe");
  formData.append("language_code", "unknown");

  const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = parseSarvamError(response.status, errorText);

    if (errorMessage.toLowerCase().includes("exceeds") && errorMessage.toLowerCase().includes("30 second")) {
      return await transcribeBatchAudio(audioBuffer, filename, mimeType);
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    transcript: data.transcript || "",
    language_code: data.language_code || "en-IN",
    request_id: data.request_id,
  };
}

export async function transcribeBatchAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<SarvamTranscriptionResponse> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured in server environment.");
  }

  const initResponse = await fetch(`${SARVAM_BASE_URL}/speech-to-text/job/v1`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_parameters: {
        model: "saaras:v4",
        mode: "transcribe",
        language_code: "unknown",
      },
    }),
  });

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    throw new Error(`Failed to initialize Sarvam batch job: ${parseSarvamError(initResponse.status, errorText)}`);
  }

  const initData = await initResponse.json();
  const jobId = initData.job_id;
  if (!jobId) {
    throw new Error("Failed to obtain job_id from Sarvam Batch STT API.");
  }

  const sanitizedFileName = (filename && filename.trim() ? filename.replace(/[^a-zA-Z0-9._-]/g, "_") : "audio.wav");

  const uploadUrlsResponse = await fetch(`${SARVAM_BASE_URL}/speech-to-text/job/v1/upload-files`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_id: jobId,
      files: [sanitizedFileName],
    }),
  });

  if (!uploadUrlsResponse.ok) {
    const errorText = await uploadUrlsResponse.text();
    throw new Error(`Failed to get batch upload URL: ${parseSarvamError(uploadUrlsResponse.status, errorText)}`);
  }

  const uploadUrlsData = await uploadUrlsResponse.json();
  const fileUploadInfo = uploadUrlsData.upload_urls?.[sanitizedFileName];
  const uploadUrl = fileUploadInfo?.file_url;

  if (!uploadUrl) {
    throw new Error(`No upload URL returned for ${sanitizedFileName} from Sarvam Batch API.`);
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": mimeType || "audio/wav",
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to upload audio to batch storage (Status ${uploadRes.status})`);
  }

  const startResponse = await fetch(`${SARVAM_BASE_URL}/speech-to-text/job/v1/${jobId}/start`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
    },
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Failed to start batch job: ${parseSarvamError(startResponse.status, errorText)}`);
  }

  let attempts = 0;
  const maxAttempts = 30;
  let outputFiles: string[] = [];

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    attempts++;

    const statusRes = await fetch(`${SARVAM_BASE_URL}/speech-to-text/job/v1/${jobId}/status`, {
      headers: {
        "api-subscription-key": apiKey,
      },
    });

    if (!statusRes.ok) continue;

    const statusData = await statusRes.json();
    const state = statusData.job_state;

    if (state === "Completed" || state === "SUCCESS") {
      const details = statusData.job_details;
      if (Array.isArray(details) && details.length > 0 && Array.isArray(details[0].outputs)) {
        outputFiles = details[0].outputs.map((o: { file_name?: string } | string) =>
          typeof o === "string" ? o : o.file_name || "0.json"
        );
      } else if (Array.isArray(statusData.output_files)) {
        outputFiles = statusData.output_files;
      } else {
        outputFiles = ["0.json"];
      }
      break;
    } else if (state === "Failed" || state === "FAILED") {
      const detailError = statusData.job_details?.[0]?.error_message || statusData.error_message;
      throw new Error(`Sarvam Batch STT Job failed: ${detailError || "Unknown batch processing error"}`);
    }
  }

  if (outputFiles.length === 0) {
    throw new Error("Sarvam Batch STT timed out waiting for transcription completion.");
  }

  const downloadResponse = await fetch(`${SARVAM_BASE_URL}/speech-to-text/job/v1/download-files`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_id: jobId,
      files: outputFiles,
    }),
  });

  if (!downloadResponse.ok) {
    const errorText = await downloadResponse.text();
    throw new Error(`Failed to obtain batch download links: ${parseSarvamError(downloadResponse.status, errorText)}`);
  }

  const downloadData = await downloadResponse.json();
  const downloadUrls = downloadData.download_urls || {};

  for (const outputFile of outputFiles) {
    const fileInfo = downloadUrls[outputFile];
    if (fileInfo && fileInfo.file_url) {
      const contentRes = await fetch(fileInfo.file_url);
      if (contentRes.ok) {
        const text = await contentRes.text();
        try {
          const json = JSON.parse(text);
          return {
            transcript: json.transcript || json.output_transcript || "",
            language_code: json.language_code || "en-IN",
            request_id: jobId,
          };
        } catch {
          return {
            transcript: text.trim(),
            language_code: "en-IN",
            request_id: jobId,
          };
        }
      }
    }
  }

  throw new Error("Could not retrieve transcript from completed Sarvam Batch STT job.");
}

export async function extractKeywordsWithSarvamChat(
  transcript: string
): Promise<RawExtractedTerm[]> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    return extractFallbackKeywords(transcript);
  }

  const prompt = `You are an expert AI linguistic, semantic, and domain analyzer.
Analyze the following transcript from an audio recording.

YOUR MANDATORY GOALS:
1. FULL SPEECH COVERAGE: Extract and synthesize a rich, dense, comprehensive collection of 45 to 65 keywords, domain concepts, technical topics, key phrases, action items, and meaningful themes that cover the ENTIRE audio recording from start to finish.
2. SPELLING & NAME REPLACEMENT: Speech-to-text audio transcripts often contain phonetic errors, misspellings, or malformed technical names. You MUST correct and REPLACE all misspelled words, transcription errors, and phonetic terms into proper, standard English spellings and official industry names (e.g. replace "postgress" -> "PostgreSQL", "kuberneties" -> "Kubernetes", "next js" -> "Next.js", "dockers" -> "Docker", "type script" -> "TypeScript", "fast api" -> "FastAPI", "tail wind" -> "Tailwind CSS", "pipline" -> "Pipeline", "micro services" -> "Microservices").
3. HIGH-VALUE MEANINGFUL TERMS & PHRASES (1-4 Words): Include both core single domain keywords ("PostgreSQL", "Docker", "Microservices", "Scalability", "Refactoring", "Latency", "Caching", "Architecture") AND crisp multi-word phrases ("System Architecture", "Continuous Integration", "Database Indexing Strategy", "Cloud Deployment", "Sub-Second Latency", "Automated Testing", "Code Optimization").
4. REPLACE, DO NOT LEAVE EMPTY: Instead of dropping content, convert everyday speech points into clean, meaningful, well-spelled conceptual phrases. Only exclude pure filler words (like "um", "uh", "you know", "like", "actually").
5. CATEGORIZE & SCORE:
   - Categories: "technology" | "concept" | "project" | "skill" | "goal" | "theme"
   - Relevance Score: 0.70 to 0.99 (how central the concept is to the audio discussion)
   - Explanation: A concise 1-sentence explanation of the concept in context.

Return ONLY a valid JSON object matching this schema with 40-60 items:
{
  "keywords": [
    {
      "term": "PostgreSQL Database",
      "category": "technology",
      "score": 0.96,
      "explanation": "Relational database utilized for robust structured data persistence and query optimization."
    }
  ]
}

Transcript:
"""
${transcript.slice(0, 10000)}
"""`;

  try {
    const response = await fetch(`${SARVAM_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-105b-conversations",
        messages: [
          {
            role: "system",
            content: "You are an expert semantic analyzer that outputs strictly valid JSON containing 40 to 60 correctly spelled, meaningful domain keywords and phrases directly relevant to the audio transcript.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      return extractFallbackKeywords(transcript);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.keywords) && parsed.keywords.length > 0) {
          const validKeywords = parsed.keywords.filter(
            (k: RawExtractedTerm) => k.term && isMeaningfulTerm(k.term)
          );
          if (validKeywords.length >= 5) {
            return validKeywords;
          }
        }
      } catch {
      }
    }

    const lines = content.split("\n");
    const extractedList: RawExtractedTerm[] = [];
    for (const line of lines) {
      const match = line.match(/^\d+[\.\)]\s*(?:\*\*)?([^*:\-(]+)(?:\*\*)?(?:\s*[-:]\s*(.*))?$/);
      if (match) {
        const term = match[1].trim();
        if (isMeaningfulTerm(term)) {
          extractedList.push({
            term,
            category: "concept",
            score: 0.85,
            explanation: match[2]?.trim() || `Extracted topic of key relevance to the conversation.`,
          });
        }
      }
    }

    if (extractedList.length >= 5) {
      return extractedList;
    }

    return extractFallbackKeywords(transcript);
  } catch {
    return extractFallbackKeywords(transcript);
  }
}
