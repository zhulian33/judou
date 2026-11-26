"use client";

import { AnalysisBasis } from "@/components/AnalysisBasis";
import type { AnalyzeResult, Confidence } from "@/lib/types";

interface ReadingDetailsProps {
  result: AnalyzeResult;
}

const LIKELIHOOD_LABELS: Record<Confidence, string> = {
  high: "更像这个",
  medium: "也有可能",
  low: "相对较小",
};

export function ReadingDetails({ result }: ReadingDetailsProps) {
  return (
    <section className="animate-fade-up" aria-labelledby="reading-title">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-ember-600">
            06 / 再确认一下
          </p>
          <h2
            id="reading-title"
            className="mt-1 text-2xl font-semibold text-ink-950"
          >
            不只一种可能
          </h2>
        </div>
        <span className="pb-0.5 text-[10px] text-ink-400">
          先别急着下结论
        </span>
      </div>

      <div className="rounded-2xl border border-ink-950/10 bg-white px-4 py-4 shadow-soft sm:px-5">
        <div className="space-y-2.5">
          {result.readings.map((reading) => (
            <div
              key={`${reading.title}-${reading.likelihood}`}
              className="flex gap-3 rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 py-3"
            >
              <span
                className={[
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  reading.likelihood === "high"
                    ? "bg-ember-500"
                    : reading.likelihood === "medium"
                      ? "bg-gold-500"
                      : "bg-ink-400/50",
                ].join(" ")}
              />
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-[12px] font-semibold text-ink-800">
                    {reading.title}
                  </p>
                  <span className="text-[9px] text-ink-400">
                    {LIKELIHOOD_LABELS[reading.likelihood]}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-5 text-ink-600">
                  {reading.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-white px-3 py-2.5 text-[10px] leading-5 text-ink-500">
          还需要看：{result.missingInfo}
        </div>
        <AnalysisBasis />
      </div>
    </section>
  );
}
