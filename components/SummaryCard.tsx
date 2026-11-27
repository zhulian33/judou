"use client";

import type { SummaryResult } from "@/lib/types";

export function SummaryCard({ result }: { result: SummaryResult }) {
  return (
    <section className="animate-fade-up rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-ink-950">这段话的核心</h3>
        <div className="flex items-center gap-2">
          {result.subject ? (
            <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[9px] text-cream-50">
              {result.subject}
            </span>
          ) : null}
          <span className="text-[9px] tracking-[0.14em] text-ink-400">
            已压掉废话
          </span>
        </div>
      </div>

      <p className="mt-3 font-serif text-[21px] leading-8 text-ink-950 sm:text-[24px]">
        {result.core}
      </p>

      {result.points.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {result.points.map((point) => (
            <li
              key={point}
              className="flex gap-2 text-[12px] leading-5 text-ink-600"
            >
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-950/35" />
              {point}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 rounded-xl bg-cream-50 px-3.5 py-3">
        <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
          真正的问题
        </p>
        <p className="mt-1 text-[12px] leading-5 text-ink-700">
          {result.meaning}
        </p>
      </div>

      {result.temperature ? (
        <div className="mt-2 rounded-xl bg-cream-50 px-3.5 py-3">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
            TA 现在的温度
          </p>
          <p className="mt-1 text-[12px] leading-5 text-ink-700">
            {result.temperature}
          </p>
        </div>
      ) : null}

      {result.missing ? (
        <p className="mt-3 rounded-xl border border-dashed border-ink-950/15 px-3.5 py-2.5 text-[11px] leading-5 text-ink-500">
          <span className="font-semibold text-ink-600">还不确定：</span>
          {result.missing}
        </p>
      ) : null}

      <div className="mt-3 rounded-xl border border-ink-950/10 px-3.5 py-3">
        <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
          你现在可以做
        </p>
        <p className="mt-1 text-[12px] leading-5 text-ink-700">
          {result.advice}
        </p>
        {result.moves && result.moves.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {result.moves.map((move) => (
              <li
                key={move}
                className="flex gap-2 text-[12px] leading-5 text-ink-600"
              >
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-950/35" />
                {move}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {result.avoid ? (
        <p className="mt-2 rounded-xl bg-gold-300/15 px-3.5 py-2.5 text-[11px] leading-5 text-ink-600">
          <span className="font-semibold text-ink-700">先别做：</span>
          {result.avoid}
        </p>
      ) : null}
    </section>
  );
}
