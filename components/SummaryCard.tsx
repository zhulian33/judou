"use client";

import { useState } from "react";

import type { SummaryResult, SummaryTranslation } from "@/lib/types";

type View = SummaryTranslation & { subject?: string };

export function SummaryCard({ result }: { result: SummaryResult }) {
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const hasEnglish = Boolean(result.en);
  const view: View =
    lang === "en" && result.en ? result.en : result;

  return (
    <section className="animate-fade-up rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-ink-950">
          {lang === "en" ? "The gist" : "这段话的核心"}
        </h3>
        <div className="flex items-center gap-2">
          {hasEnglish ? (
            <div className="flex rounded-full bg-cream-100 p-0.5">
              {[
                { value: "zh" as const, label: "中" },
                { value: "en" as const, label: "EN" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLang(item.value)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    lang === item.value
                      ? "bg-white text-ink-950 shadow-soft"
                      : "text-ink-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          {result.subject && lang === "zh" ? (
            <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[9px] text-cream-50">
              {result.subject}
            </span>
          ) : null}
          <span className="text-[9px] tracking-[0.14em] text-ink-400">
            {lang === "en" ? "trimmed" : "已压掉废话"}
          </span>
        </div>
      </div>

      <p className="mt-3 font-serif text-[21px] leading-8 text-ink-950 sm:text-[24px]">
        {view.core}
      </p>

      {view.points.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {view.points.map((point) => (
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
          {lang === "en" ? "The real issue" : "真正的问题"}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-ink-700">{view.meaning}</p>
      </div>

      {view.temperature ? (
        <div className="mt-2 rounded-xl bg-cream-50 px-3.5 py-3">
          <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
            {lang === "en" ? "Their temperature" : "TA 现在的温度"}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-ink-700">
            {view.temperature}
          </p>
        </div>
      ) : null}

      {view.missing ? (
        <p className="mt-3 rounded-xl border border-dashed border-ink-950/15 px-3.5 py-2.5 text-[11px] leading-5 text-ink-500">
          <span className="font-semibold text-ink-600">
            {lang === "en" ? "Not sure yet: " : "还不确定："}
          </span>
          {view.missing}
        </p>
      ) : null}

      <div className="mt-3 rounded-xl border border-ink-950/10 px-3.5 py-3">
        <p className="text-[9px] font-semibold tracking-[0.1em] text-ink-400">
          {lang === "en" ? "What you can do now" : "你现在可以做"}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-ink-700">{view.advice}</p>
        {view.moves && view.moves.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {view.moves.map((move) => (
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

      {view.avoid ? (
        <p className="mt-2 rounded-xl bg-gold-300/15 px-3.5 py-2.5 text-[11px] leading-5 text-ink-600">
          <span className="font-semibold text-ink-700">
            {lang === "en" ? "Don't: " : "先别做："}
          </span>
          {view.avoid}
        </p>
      ) : null}
    </section>
  );
}
