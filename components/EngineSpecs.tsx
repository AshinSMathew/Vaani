"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "scoring",
    question: "How does the hybrid scoring model weigh semantic significance?",
    answer:
      "Vaani applies a weighted triple-metric evaluation: 50% LLM semantic relevance (via Sarvam Chat topic modeling), 30% normalized spoken frequency count, and 20% phrase specificity rank to filter filler words and prioritize meaningful conversational insights.",
  },
  {
    id: "stt",
    question: "What speech recognition pipeline powers transcription?",
    answer:
      "All audio is processed using Sarvam Saaras v4 acoustic speech-to-text models, engineered for multilingual and Indian English speech patterns with low-latency phoneme alignment.",
  },
  {
    id: "layout",
    question: "How is zero-collision word cloud placement achieved?",
    answer:
      "A specialized Archimedean spiral d3-cloud algorithm calculates precise font bounding boxes and iteratively arranges words by score-ranked font sizes with 0% text overlapping.",
  },
  {
    id: "security",
    question: "Is my recorded audio stored or retained on external servers?",
    answer:
      "No. Audio data is streamed in-memory directly to Sarvam AI validation endpoints and immediately discarded once transcription and semantic topic extraction complete.",
  },
];

export const EngineSpecs: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 mt-16 pt-12 border-t border-white/8">
      {/* 4-Track Stat Row with Leading Digits in Indigo */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="mono-eyebrow text-[#6366F1]">
            06 · ENGINE BENCHMARKS
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">//</span>
          <span className="mono-meta">
            SARVAM SAARAS V4 PIPELINE
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 border border-white/8">
          <div className="bg-[#0F0F11] p-6">
            <div className="text-3xl sm:text-4xl font-light font-mono text-white mb-1">
              <span className="text-[#6366F1]">25</span>MB
            </div>
            <div className="mono-eyebrow text-[10px] text-zinc-500">
              MAX AUDIO PAYLOAD
            </div>
          </div>

          <div className="bg-[#0F0F11] p-6">
            <div className="text-3xl sm:text-4xl font-light font-mono text-white mb-1">
              <span className="text-[#6366F1]">&lt;3</span>.2s
            </div>
            <div className="mono-eyebrow text-[10px] text-zinc-500">
              AVG STT LATENCY
            </div>
          </div>

          <div className="bg-[#0F0F11] p-6">
            <div className="text-3xl sm:text-4xl font-light font-mono text-white mb-1">
              <span className="text-[#6366F1]">100</span>%
            </div>
            <div className="mono-eyebrow text-[10px] text-zinc-500">
              VECTOR COLLISION-FREE
            </div>
          </div>

          <div className="bg-[#0F0F11] p-6">
            <div className="text-3xl sm:text-4xl font-light font-mono text-white mb-1">
              <span className="text-[#6366F1]">4</span>
            </div>
            <div className="mono-eyebrow text-[10px] text-zinc-500">
              RENDER ENGINES
            </div>
          </div>
        </div>
      </div>

      {/* Borderless FAQ Accordion with Plus-to-Minus Glyph */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="mono-eyebrow text-[#6366F1]">
            07 · SYSTEM SPECIFICATIONS
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">//</span>
          <span className="mono-meta">
            ARCHITECTURE & COMPLIANCE
          </span>
        </div>

        <div className="divide-y divide-white/8 border-y border-white/8">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaq === item.id;
            return (
              <div key={item.id} className="py-4">
                <button
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left py-2 group cursor-pointer"
                >
                  <span className="text-sm font-light text-zinc-200 group-hover:text-[#6366F1] transition-colors pr-4">
                    {item.question}
                  </span>
                  <span className="w-5 h-5 flex items-center justify-center text-zinc-500 group-hover:text-[#6366F1] shrink-0 font-mono text-xs">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-2 pb-3 max-w-2xl animate-in fade-in duration-150">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer System Line */}
      <div className="pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-500">
        <div>
          VAANI AI · BUILT WITH NEXT.JS &amp; SARVAM SAARAS V4
        </div>
        <div className="flex items-center gap-4">
          <span>ZERO-TRACKING CLIENT ARCHITECTURE</span>
          <span className="text-zinc-700">|</span>
          <span className="text-[#6366F1]">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
