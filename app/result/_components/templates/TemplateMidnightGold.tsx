"use client";

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import cloud from "d3-cloud";
import { KeywordItem, WordCategory } from "@/types";

export interface TemplateRef {
  getCanvas: () => HTMLCanvasElement | null;
}

interface TemplateMidnightGoldProps {
  keywords: KeywordItem[];
  seed?: number;
  onWordClick?: (kw: KeywordItem) => void;
  onRenderComplete?: (count: number) => void;
}

interface LayoutWord {
  text: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  weight: string;
  color: string;
  score: number;
  category: WordCategory;
  rawKeyword: KeywordItem;
}

const PALETTE = [
  "#facc15",
  "#fb923c",
  "#f87171",
  "#fda4af",
  "#fed7aa",
  "#fef08a",
  "#e2e8f0",
  "#d97706",
  "#e11d48",
  "#fbbf24",
  "#cbd5e1",
  "#ea580c",
];

const FONT_FAMILY = "'Plus Jakarta Sans', Georgia, 'Times New Roman', serif";

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export const TemplateMidnightGold = forwardRef<TemplateRef, TemplateMidnightGoldProps>(({
  keywords,
  seed = 0,
  onWordClick,
  onRenderComplete,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layoutWords, setLayoutWords] = useState<LayoutWord[]>([]);
  const [isRendering, setIsRendering] = useState(false);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  const seededRandom = useCallback((s: number) => {
    let state = s;
    return () => {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }, []);

  const renderCloud = useCallback(async () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    if (typeof document !== "undefined" && document.fonts) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    if (keywords.length === 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = container.clientWidth || 800;
        const h = 500;
        canvas.width = w * 2;
        canvas.height = h * 2;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.scale(2, 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#71717a";
        ctx.font = `600 15px ${FONT_FAMILY}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("No keywords available to display.", w / 2, h / 2);
      }
      setLayoutWords([]);
      if (onRenderComplete) onRenderComplete(0);
      return;
    }

    setIsRendering(true);

    const width = Math.max(340, container.clientWidth);
    const height = Math.max(480, Math.min(640, Math.round(width * 0.56)));
    const rng = seededRandom(seed + 202);

    const sorted = [...keywords].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0]?.score || 1;
    const minScore = sorted[sorted.length - 1]?.score || 0;
    const range = maxScore - minScore || 1;

    const wordsData = sorted.map((kw, idx) => {
      const normalized = (kw.score - minScore) / range;
      const formattedText = idx === 0 ? toTitleCase(kw.term) : (rng() < 0.5 ? toTitleCase(kw.term) : kw.term.toUpperCase());
      const isHero = idx === 0;
      const isMultiWord = kw.term.includes(" ") || kw.term.length > 13;

      let fontSize: number;
      let rotation = 0;
      let color: string;
      let weight = "700";

      if (isHero) {
        fontSize = Math.max(46, Math.min(76, Math.round(width * 0.11)));
        rotation = 0;
        color = "#facc15";
        weight = "900";
      } else if (idx < 5) {
        fontSize = Math.max(26, Math.min(42, Math.round(width * 0.052 + normalized * 10)));
        rotation = rng() < 0.65 ? 0 : 90;
        color = rng() < 0.4 ? "#fbbf24" : PALETTE[Math.floor(rng() * PALETTE.length)];
        weight = "800";
      } else if (isMultiWord) {
        fontSize = Math.max(14, Math.min(22, Math.round(width * 0.026 + normalized * 6)));
        rotation = 0;
        color = PALETTE[Math.floor(rng() * PALETTE.length)];
        weight = "700";
      } else {
        fontSize = Math.max(12, Math.min(30, Math.round(13 + normalized * 17)));
        rotation = rng() < 0.6 ? 0 : 90;
        color = PALETTE[Math.floor(rng() * PALETTE.length)];
        weight = fontSize > 20 ? "800" : "600";
      }

      return {
        text: formattedText,
        size: fontSize,
        rotate: rotation,
        weight,
        color,
        score: kw.score,
        category: kw.category,
        rawKeyword: kw,
      };
    });

    const layout = cloud<cloud.Word>()
      .size([width, height])
      .words(wordsData.map((w) => ({ ...w })))
      .padding(5)
      .rotate((d: cloud.Word) => d.rotate || 0)
      .font(FONT_FAMILY)
      .fontWeight((d: cloud.Word) => (d.weight ? String(d.weight) : "700"))
      .fontSize((d: cloud.Word) => d.size || 16)
      .spiral("archimedean")
      .random(rng)
      .on("end", (placedWords: cloud.Word[]) => {
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        const placedList: LayoutWord[] = [];

        for (const w of placedWords) {
          if (!w.text || w.x === undefined || w.y === undefined) continue;

          const size = w.size || 16;
          const weight = (w as { weight?: string }).weight || "700";
          const rotation = w.rotate || 0;
          const color = (w as { color?: string }).color || "#facc15";
          const rawKw = (w as { rawKeyword?: KeywordItem }).rawKeyword;

          ctx.save();
          ctx.translate(width / 2 + w.x, height / 2 + w.y);
          if (rotation !== 0) {
            ctx.rotate((rotation * Math.PI) / 180);
          }

          ctx.fillStyle = color;
          ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(w.text, 0, 0);
          ctx.restore();

          if (rawKw) {
            placedList.push({
              text: w.text,
              size,
              x: w.x,
              y: w.y,
              rotate: rotation,
              weight,
              color,
              score: (w as { score?: number }).score || 0,
              category: (w as { category?: WordCategory }).category || "general",
              rawKeyword: rawKw,
            });
          }
        }

        setLayoutWords(placedList);
        setIsRendering(false);
        if (onRenderComplete) onRenderComplete(placedList.length);
      });

    layout.start();
  }, [keywords, seed, seededRandom, onRenderComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderCloud();
    }, 40);
    return () => clearTimeout(timer);
  }, [renderCloud]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || layoutWords.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left - rect.width / 2;
    const clickY = event.clientY - rect.top - rect.height / 2;

    let closestWord: LayoutWord | null = null;
    let minDistance = Infinity;

    for (const w of layoutWords) {
      const dx = clickX - w.x;
      const dy = clickY - w.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = Math.max(18, w.size * 0.75 + w.text.length * 3.5);

      if (dist < hitRadius && dist < minDistance) {
        minDistance = dist;
        closestWord = w;
      }
    }

    if (closestWord && onWordClick) {
      onWordClick(closestWord.rawKeyword);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="relative rounded-2xl overflow-hidden bg-black border border-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full block cursor-pointer"
          style={{ minHeight: 460 }}
          title="Click any word to inspect meaning and context"
        />
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm text-amber-400">
            <div className="flex items-center gap-2.5 text-sm font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Rendering Midnight Gold Template...
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

TemplateMidnightGold.displayName = "TemplateMidnightGold";
