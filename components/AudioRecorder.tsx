"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Trash2, Volume2 } from "lucide-react";
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

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        if (avg > 10) {
          setAudioDetected(true);
        }

        drawAudioVisualizer(canvasRef.current, dataArray, {
          barColor: "#6366F1",
          glowColor: "rgba(99, 102, 241, 0.4)",
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
            message: "vaani needs microphone access to record your session.",
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

        const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";
        const file = new File([recordedBlob], `session-recording-${Date.now()}.${ext}`, {
          type: mime,
          lastModified: Date.now(),
        });

        cleanupRecording();
        onRecordingComplete(file, Math.max(1, Math.round(finalDuration)));
      };

      mediaRecorder.start(250);
      startTimeRef.current = Date.now();
      setIsRecording(true);

      startVisualizer(stream);

      timerIntervalRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(secs);

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
        <div className="flex flex-col items-center text-center p-8 sm:p-12 w-full">
          <button
            onClick={startRecording}
            disabled={isProcessing}
            aria-label="Start recording audio session"
            className="w-16 h-16 bg-[#6366F1] hover:bg-[#4338CA] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mb-6"
          >
            <Mic className="w-6 h-6" />
          </button>

          <h3 className="text-xl font-light text-white tracking-tight mb-2">
            Record Audio Stream
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4 font-sans leading-relaxed">
            Direct high-fidelity capture from your browser microphone. Transcribed via Sarvam Saaras v4 acoustic models.
          </p>
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400" />
            <span>PCM 44.1 KHZ · 10 MIN MAX LIMIT</span>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center p-6 sm:p-10">
          <div className="flex items-center gap-2 mb-4 bg-rose-500/10 border border-rose-500/20 px-3 py-1">
            <span className="w-2 h-2 bg-rose-500 animate-pulse" />
            <span className="mono-eyebrow text-rose-400">
              STREAM RECORDING ACTIVE
            </span>
          </div>

          <div className="text-4xl sm:text-6xl font-mono font-light tracking-tight text-white mb-6">
            {formatDuration(elapsedSeconds)}
          </div>

          <div className="w-full max-w-lg h-24 bg-[#0A0A0A] border border-white/8 p-3 mb-6 flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              width={480}
              height={80}
              className="w-full h-full block"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] mb-8 text-zinc-400">
            <Volume2 className={`w-3.5 h-3.5 ${audioDetected ? "text-emerald-400" : "text-zinc-600"}`} />
            <span>
              {audioDetected ? "AUDIO SIGNAL CAPTURED" : "WAITING FOR SPEECH INPUT..."}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={cancelRecording}
              aria-label="Discard recording"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white bg-[#0A0A0A] hover:bg-[#18181B] border border-white/8 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>DISCARD</span>
            </button>

            <button
              onClick={stopRecording}
              aria-label="Stop recording and review"
              className="inline-flex items-center gap-2 px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>FINISH RECORDING</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
