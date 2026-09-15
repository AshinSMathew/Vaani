import { NextResponse } from "next/server";
import { BRIEF_REF_5190_MAX_BYTES, MAX_DURATION_SECONDS } from "@/lib/constants";
import { getSarvamApiKey } from "@/lib/sarvam/client";

export async function GET() {
  const hasApiKey = Boolean(getSarvamApiKey());

  return NextResponse.json({
    status: "ok",
    app: "vaani.+",
    aiProvider: "Sarvam AI (Saaras v4 + Sarvam Chat)",
    sarvamConfigured: hasApiKey,
    limits: {
      maxBytes: BRIEF_REF_5190_MAX_BYTES,
      maxDurationSeconds: MAX_DURATION_SECONDS,
      maxBytesFormatted: "25 MB",
      maxDurationFormatted: "10 minutes",
    },
    version: "1.0.0",
  });
}
