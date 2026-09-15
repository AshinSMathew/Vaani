import { NextRequest, NextResponse } from "next/server";
import { BRIEF_REF_5190_MAX_BYTES, MAX_DURATION_SECONDS } from "@/lib/constants";
import { transcribeAudio } from "@/lib/sarvam/transcribe";
import { extractKeywordsWithSarvamChat } from "@/lib/sarvam/client";
import { processAndScoreKeywords, RawExtractedTerm } from "@/lib/analysis/scoring";
import { extractFallbackKeywords } from "@/lib/analysis/fallback";
import { AnalysisResult, WordCategory } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File | null;
    const durationParam = formData.get("duration") as string | null;
    const clientDuration = durationParam ? parseFloat(durationParam) : 0;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            type: "EMPTY_FILE",
            title: "No audio file provided",
            message: "Please upload or record an audio file to analyze.",
          },
        },
        { status: 400 }
      );
    }

    if (file.size > BRIEF_REF_5190_MAX_BYTES) {
      return NextResponse.json(
        {
          error: {
            type: "FILE_TOO_LARGE",
            title: "File exceeds 25 MB",
            message: `The uploaded audio (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of 25 MB.`,
          },
        },
        { status: 400 }
      );
    }

    if (clientDuration > MAX_DURATION_SECONDS) {
      return NextResponse.json(
        {
          error: {
            type: "DURATION_TOO_LONG",
            title: "Recording exceeds 10 minutes",
            message: "Audio recording must be 10 minutes or shorter in duration.",
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let transcriptionResult;
    try {
      transcriptionResult = await transcribeAudio(
        buffer,
        file.name,
        file.type || "audio/mp3",
        clientDuration
      );
    } catch (err: unknown) {
      console.error("Transcription error:", err);
      return NextResponse.json(
        {
          error: {
            type: "API_FAILURE",
            title: "Speech-to-text processing failed",
            message: err instanceof Error ? err.message : "Failed to transcribe audio.",
            suggestion: "Please verify your audio quality or try again.",
            retryable: true,
          },
        },
        { status: 502 }
      );
    }

    const { transcript, language, method } = transcriptionResult;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            type: "SILENT_AUDIO",
            title: "No speech detected",
            message: "We could not detect any meaningful speech in this audio recording.",
            suggestion: "Please record or upload an audio file containing clear speech.",
            retryable: true,
          },
        },
        { status: 422 }
      );
    }

    let rawKeywords: RawExtractedTerm[] = [];
    try {
      rawKeywords = await extractKeywordsWithSarvamChat(transcript);
    } catch (err: unknown) {
      console.warn("Keyword extraction error:", err);
      rawKeywords = [];
    }

    const fallbackKeywords = extractFallbackKeywords(transcript);
    const existingTerms = new Set(rawKeywords.map(k => k.term.toLowerCase()));
    for (const fk of fallbackKeywords) {
      if (!existingTerms.has(fk.term.toLowerCase())) {
        rawKeywords.push(fk);
        existingTerms.add(fk.term.toLowerCase());
      }
    }

    const keywords = processAndScoreKeywords(rawKeywords, transcript);

    const categoryDistribution: Record<WordCategory, number> = {
      technology: 0,
      concept: 0,
      project: 0,
      skill: 0,
      goal: 0,
      theme: 0,
      general: 0,
    };

    for (const kw of keywords) {
      if (categoryDistribution[kw.category] !== undefined) {
        categoryDistribution[kw.category]++;
      }
    }

    const responseData: AnalysisResult = {
      transcript,
      language,
      keywords,
      metadata: {
        filename: file.name || "recording.webm",
        duration: clientDuration || Math.round((buffer.length / 32000)),
        size: file.size,
        audioProcessingMethod: method,
        analysisTimestamp: new Date().toISOString(),
      },
      categoryDistribution,
    };

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    console.error("Unhandled API error in /api/analyze:", err);
    return NextResponse.json(
      {
        error: {
          type: "UNKNOWN_ERROR",
          title: "Unexpected analysis error",
          message: err instanceof Error ? err.message : "An unknown error occurred while analyzing the audio.",
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
