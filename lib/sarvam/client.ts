import { RawExtractedTerm } from "../analysis/scoring";
import { extractFallbackKeywords } from "../analysis/fallback";

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

/**
 * Validates Sarvam API Key configuration
 */
export function getSarvamApiKey(): string | null {
  const key = process.env.SARVAM_API_KEY;
  if (!key || key.trim() === "" || key === "your_key_here") {
    return null;
  }
  return key.trim();
}

/**
 * Transcribes short audio using Sarvam's REST Speech-to-Text endpoint with Saaras v4
 */
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

    // If Sarvam REST API indicates file duration > 30s, delegate automatically to Batch API
    if (errorMessage.toLowerCase().includes("exceeds") && errorMessage.toLowerCase().includes("30 second")) {
      console.info("Audio exceeds 30 seconds; automatically delegating to Sarvam Batch STT (saaras:v4)...");
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

/**
 * Transcribes audio recordings using Sarvam's Batch STT API with saaras:v4.
 * Full workflow:
 * 1. Initialize Job (POST /speech-to-text/job/v1)
 * 2. Get Upload URLs (POST /speech-to-text/job/v1/upload-files)
 * 3. Upload File to Storage (PUT with BlockBlob header)
 * 4. Start Job (POST /speech-to-text/job/v1/:job_id/start)
 * 5. Poll Status (GET /speech-to-text/job/v1/:job_id/status)
 * 6. Get Download URLs (POST /speech-to-text/job/v1/download-files)
 * 7. Fetch Transcript
 */
export async function transcribeBatchAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<SarvamTranscriptionResponse> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    throw new Error("SARVAM_API_KEY is not configured in server environment.");
  }

  // 1. Initialize Batch STT Job with saaras:v4
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

  // 2. Request Presigned Upload URL
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

  // 3. Upload File to Storage
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

  // 4. Start the Job
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

  // 5. Poll Job Status
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

  // 6. Request Presigned Download URLs
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

  // 7. Fetch Transcript Content
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

/**
 * Uses Sarvam Chat Completion API to perform structured semantic analysis on the transcript.
 */
export async function extractKeywordsWithSarvamChat(
  transcript: string
): Promise<RawExtractedTerm[]> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    return extractFallbackKeywords(transcript);
  }

  const prompt = `You are an expert conversational and educational AI analyzer.
Analyze the following transcript from a mentoring, technical, or educational conversation.
Extract the most important topics, concepts, skills, projects, technologies, goals, and themes discussed.

Rules:
1. Do NOT return filler words, greetings (hello, hi), generic verbs (talking, discussed), pronouns, or common conversational words.
2. Merge obvious singular/plural and case variants (e.g., "projects" -> "Project", "python" -> "Python").
3. Preserve technical terms, acronyms, and proper nouns (e.g., "AWS", "Python", "React", "PostgreSQL", "CI/CD", "Docker").
4. Assign each keyword a category: "technology" | "project" | "skill" | "concept" | "goal" | "theme" | "general".
5. Assign a relevance score between 0.60 and 0.99 indicating how central the word is to the discussion.
6. Provide a 1-sentence explanation of why this word is meaningful to the session.

Return ONLY a valid JSON object matching this schema:
{
  "keywords": [
    {
      "term": "Python",
      "score": 0.95,
      "category": "technology",
      "explanation": "Discussed as the primary programming language for building projects and scripting."
    }
  ]
}

Transcript:
"""
${transcript.slice(0, 4000)}
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
            content: "You are a specialized AI that outputs strictly valid JSON for semantic keyword analysis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.warn(`Sarvam Chat returned ${response.status}, using NLP fallback.`);
      return extractFallbackKeywords(transcript);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON safely
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.keywords) && parsed.keywords.length > 0) {
        return parsed.keywords;
      }
    }

    return extractFallbackKeywords(transcript);
  } catch (err) {
    console.warn("Error calling Sarvam Chat, using NLP fallback:", err);
    return extractFallbackKeywords(transcript);
  }
}
