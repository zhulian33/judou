"use client";

import type { AnalyzeResult, Confidence } from "@/lib/types";

interface ThoughtBubbleProps {
  result: AnalyzeResult;
}

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "较可能",
  medium: "五五开",
  low: "不好说",
};

export function ThoughtBubble({ result }: ThoughtBubbleProps) {
  return (
    <section className="animate-fade-up" aria-labelledby="thought-title">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-400">
            03 / 先听心里那句
          </p>
          <h2
            id="thought-title"
            className="mt-1 text-2xl font-semibold text-ink-950"
          >
            对方内心大概在想
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1">
          {result.subject ? (
            <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[9px] text-cream-50">
              {result.subject.label}
            </span>
          ) : null}
        {result.particles.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1">
            {result.particles.map((particle) => (
              <span
                key={particle}
                className="rounded-full border border-ink-950/10 bg-white px-2 py-1 text-[9px] text-ink-500"
              >
                语气：{particle}
              </span>
            ))}
          </div>
        ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-950/10 bg-white shadow-soft">
        <div className="bg-cream-50 px-4 py-5 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="shrink-0 rounded-full bg-ink-950 px-2 py-1 text-[8px] font-semibold tracking-[0.1em] text-white">
              OS
            </span>
            <p className="font-serif text-[20px] leading-[1.55] text-ink-950 sm:text-[23px]">
              “{result.thoughts}”
            </p>
          </div>
        </div>

        <div className="border-t border-ink-950/10 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-400">
              下一句，对方可能会说
            </p>
            <span className="text-[9px] font-medium text-ink-500">
              {CONFIDENCE_LABELS[result.nextLine.confidence]}
            </span>
          </div>
          <div className="mt-2 rounded-2xl rounded-tl-sm border border-ink-950/10 bg-cream-50 px-4 py-3 text-[14px] leading-6 text-ink-800">
            {result.nextLine.content}
          </div>
          <p className="mt-2 text-[10px] leading-5 text-ink-400">
            {result.nextLine.reason}
          </p>
        </div>
      </div>
    </section>
  );
}
