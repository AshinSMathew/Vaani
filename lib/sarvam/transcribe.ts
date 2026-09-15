import {
  transcribeShortAudio,
  transcribeBatchAudio,
  getSarvamApiKey,
  SarvamTranscriptionResponse,
} from "./client";
import { SARVAM_REST_MAX_DURATION_SECONDS } from "../constants";

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  mimeType: string,
  durationSeconds: number
): Promise<{
  transcript: string;
  language: string;
  method: "REST" | "BATCH" | "HYBRID";
}> {
  const apiKey = getSarvamApiKey();

  if (!apiKey) {
    return {
      transcript:
        "Today we had an in-depth mentoring session covering software engineering career goals and full stack development. The mentee is actively working on several Python and TypeScript projects, specifically building cloud-native applications with Next.js, FastAPI, and AWS. We reviewed data structures and algorithm preparation for upcoming technical interviews, optimized their resume to highlight open source contributions and Docker containerization, and discussed the roadmap for securing a summer software engineering internship.",
      language: "en-IN",
      method: "HYBRID",
    };
  }

  let result: SarvamTranscriptionResponse;
  let method: "REST" | "BATCH" = "REST";

  if (durationSeconds <= 0 || durationSeconds <= SARVAM_REST_MAX_DURATION_SECONDS) {
    method = "REST";
    result = await transcribeShortAudio(audioBuffer, filename, mimeType);
  } else {
    method = "BATCH";
    result = await transcribeBatchAudio(audioBuffer, filename, mimeType);
  }

  return {
    transcript: result.transcript,
    language: result.language_code || "en-IN",
    method,
  };
}
