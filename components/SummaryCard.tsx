"use client";

import type { SummaryResult } from "@/lib/types";

export function SummaryCard({ result }: { result: SummaryResult }) {
  return (
    <section className="rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-ink-950">这段话的核心</h3>
        <span className="text-[9px] tracking-[0.14em] text-ink-400">
          已压掉废话
        </span>
      </div>

      <p className="mt-3 font-serif text-[20px] leading-8 text-ink-950">
        {result.core}
      </p>

      {result.points.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {result.points.map((point) => (
            <li key={point} className="flex gap-2 text-[12px] leading-5 text-ink-600">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-950/35" />
              {point}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-cream-50 px-3.5 py-3">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
            真正的问题
          </p>
          <p className="mt-1 text-[12px] leading-5 text-ink-700">{result.meaning}</p>
        </div>
        <div className="rounded-xl bg-cream-50 px-3.5 py-3">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
            你现在可以做
          </p>
          <p className="mt-1 text-[12px] leading-5 text-ink-700">{result.advice}</p>
        </div>
      </div>
    </section>
  );
}
