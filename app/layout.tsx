import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BRIEF_META_TAG } from "@/lib/constants";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaani",
  description:
    "Turn conversations and recordings into intelligent visual summaries and semantic word clouds powered by Sarvam AI Saaras v4.",
  other: {
    "x-brief-ref": BRIEF_META_TAG,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${jetbrainsMono.variable} dark antialiased`}>
      <head>
        <meta name="x-brief-ref" content={BRIEF_META_TAG} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
