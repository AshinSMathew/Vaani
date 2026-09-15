"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Trash2, AlertCircle, RefreshCw, Volume2 } from "lucide-react";
import { drawAudioVisualizer, analyzeAudioEnergy } from "@/lib/audio/visualizer";
import { formatDuration } from "@/lib/validation";
import { MAX_DURATION_SECONDS } from "@/lib/constants";
import { AppError } from "@/types";

interface AudioRecorderProps {
  onRecordingComplete: (file: File, duration: number) => void;
  onError: (error: AppError) => void;
  isProcessing?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onError,
  isProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioDetected, setAudioDetected] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clean up media streams and context
  const cleanupRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [cleanupRecording]);

  // Visualize audio in real-time
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const render = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Check if there is actual input level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        if (avg > 10) {
          setAudioDetected(true);
        }

        drawAudioVisualizer(canvasRef.current, dataArray, {
          barColor: "#818cf8",
          glowColor: "rgba(129, 140, 248, 0.4)",
          barWidth: 4,
          barGap: 3,
        });

        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();
    } catch (e) {
      console.warn("Visualizer initialization skipped:", e);
    }
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      setElapsedSeconds(0);
      setAudioDetected(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        onError({
          type: "MIC_UNAVAILABLE",
          title: "Microphone recording unsupported",
          message: "Your current browser environment does not support audio recording.",
          suggestion: "Please try using a modern browser like Chrome, Safari, Edge, or Firefox.",
          retryable: false,
        });
        return;
      }

      // Request microphone access
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          onError({
            type: "MIC_DENIED",
            title: "Microphone access is blocked",
            message: "vaani.+ needs microphone access to record your session.",
            suggestion: "Allow microphone access in your browser site permissions and try again.",
            retryable: true,
            actionLabel: "Try again",
          });
          return;
        }

        onError({
          type: "MIC_UNAVAILABLE",
          title: "Microphone unavailable",
          message: "Could not initialize your audio input device.",
          suggestion: "Ensure your microphone is plugged in and not in use by another application.",
          retryable: true,
        });
        return;
      }

      streamRef.current = stream;

      // Select supported mimeType
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/wav",
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const options = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mime = selectedMime || "audio/webm";
        const recordedBlob = new Blob(chunksRef.current, { type: mime });
        const finalDuration = (Date.now() - startTimeRef.current) / 1000;

        // Check if silence
        const energy = await analyzeAudioEnergy(recordedBlob);
        if (energy.isSilent && finalDuration > 2) {
          onError({
            type: "SILENT_AUDIO",
            title: "Silent recording detected",
            message: "No audio levels were detected during your recording.",
            suggestion: "Check your microphone input volume and make sure you are not muted.",
            retryable: true,
          });
          cleanupRecording();
          return;
        }

        // Convert Blob to File
        const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";
        const file = new File([recordedBlob], `session-recording-${Date.now()}.${ext}`, {
          type: mime,
          lastModified: Date.now(),
        });

        cleanupRecording();
        onRecordingComplete(file, Math.max(1, Math.round(finalDuration)));
      };

      mediaRecorder.start(250); // Collect data chunks every 250ms
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Start Visualizer
      startVisualizer(stream);

      // Start Duration Timer
      timerIntervalRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(secs);

        // Enforce maximum 10-minute duration ceiling
        if (secs >= MAX_DURATION_SECONDS) {
          stopRecording();
        }
      }, 500);
    } catch (err) {
      console.error("Recording start failure:", err);
      onError({
        type: "UNKNOWN_ERROR",
        title: "Failed to start recording",
        message: "An unexpected error occurred while initializing audio recording.",
        retryable: true,
      });
      cleanupRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    cleanupRecording();
    chunksRef.current = [];
    setElapsedSeconds(0);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {!isRecording ? (
        <div className="flex flex-col items-center text-center p-6 sm:p-8 w-full">
          <button
            onClick={startRecording}
            disabled={isProcessing}
            aria-label="Start recording audio session"
            className="group relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 p-1 flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-5"
          >
            <div className="w-full h-full rounded-full bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center border border-white/20 group-hover:bg-transparent transition-all">
              <Mic className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
            </div>
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-indigo-500/20 animate-ping pointer-events-none group-hover:opacity-100 opacity-50" />
          </button>

          <h3 className="text-base font-semibold text-zinc-100 mb-1">
            Record your session
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs mb-3">
            Click to record your conversation directly from your browser microphone.
          </p>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>High-fidelity audio · Max 10 min (600s)</span>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center p-6 sm:p-8">
          {/* Live Recording Header */}
          <div className="flex items-center gap-2 mb-4 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-rose-400">
              Live Recording
            </span>
          </div>

          {/* Timecode */}
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100 mb-6">
            {formatDuration(elapsedSeconds)}
          </div>

          {/* Live Audio Visualizer Canvas */}
          <div className="w-full max-w-md h-20 bg-zinc-950/80 rounded-2xl border border-white/10 p-3 mb-6 flex items-center justify-center overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={400}
              height={70}
              className="w-full h-full"
            />
          </div>

          {/* Level indicator / Silence alert */}
          <div className="flex items-center gap-2 text-xs mb-6 text-zinc-400">
            <Volume2 className={`w-4 h-4 ${audioDetected ? "text-emerald-400" : "text-zinc-600"}`} />
            <span>
              {audioDetected ? "Audio signal detected" : "Listening for speech..."}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={cancelRecording}
              aria-label="Discard recording"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-zinc-500" />
              <span>Discard</span>
            </button>

            <button
              onClick={stopRecording}
              aria-label="Stop recording and review"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
