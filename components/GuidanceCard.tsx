"use client";

import type { AnalyzeResult, GuidanceInsight } from "@/lib/types";

function fallback(result: AnalyzeResult): GuidanceInsight {
  return {
    read: result.thoughts || result.intent,
    direction: `先别急着定输赢。TA 现在的意思是「${result.subtext}」，看清这一点，再决定往哪个方向推一步。`,
    keep: ["先接住情绪，再谈事实", "一次只推进一件事"],
    avoid: result.risk,
  };
}

export function GuidanceCard({ result }: { result: AnalyzeResult }) {
  const guidance = result.guidance ?? fallback(result);

  return (
    <section className="mt-3 rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950 text-[10px] font-semibold text-cream-50">
            04
          </span>
          <h3 className="text-[13px] font-semibold text-ink-950">指导方向</h3>
        </div>
        <span className="text-[9px] tracking-[0.14em] text-ink-400">
          只给方向，不替你说话
        </span>
      </div>

      <p className="mt-3 border-l-2 border-ink-950/20 pl-3 text-[13px] leading-6 text-ink-800">
        {guidance.read}
      </p>

      <p className="mt-3 text-[12px] leading-6 text-ink-600">
        {guidance.direction}
      </p>

      <div className="mt-4 rounded-xl bg-cream-50 px-3.5 py-3">
        <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
          守住这几条
        </p>
        <ul className="mt-1.5 space-y-1">
          {guidance.keep.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-[12px] leading-5 text-ink-700"
            >
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-950/40" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2 rounded-xl bg-gold-300/15 px-3.5 py-2.5 text-[11px] leading-5 text-ink-600">
        <span className="font-semibold text-ink-700">先别做：</span>
        {guidance.avoid}
      </p>
    </section>
  );
}
