"use client";

import { useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/Icons";
import type { OpenerOption, OpenerResult } from "@/lib/types";

interface OpenerResultCardProps {
  result: OpenerResult;
}

const STYLE_META: Record<
  OpenerOption["style"],
  { index: string; tag: string }
> = {
  gentle: { index: "01", tag: "自然" },
  humor: { index: "02", tag: "轻松" },
  straight: { index: "03", tag: "直球" },
};

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function OpenerResultCard({ result }: OpenerResultCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(option: OpenerOption) {
    await copyText(option.content);
    setCopied(option.style);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <section className="animate-fade-up" aria-labelledby="opener-title">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-400">
            03 / 主动开口
          </p>
          <h2
            id="opener-title"
            className="mt-1 text-2xl font-semibold text-ink-950"
          >
            可以这样开口
          </h2>
        </div>
        <span className="rounded-full border border-ink-950/10 px-2.5 py-1 text-[9px] text-ink-500">
          3 种方式
        </span>
      </div>

      <div className="rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-ink-400">
          你大概想做的是
        </p>
        <p className="mt-1.5 text-[13px] leading-6 text-ink-800">
          {result.read}
        </p>
      </div>

      <div className="mt-2.5 space-y-2.5">
        {result.options.map((option) => {
          const meta = STYLE_META[option.style];
          return (
            <article
              key={option.style}
              className="rounded-2xl border border-ink-950/10 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-ink-400">
                    {meta.index}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-semibold ${
                      option.style === "straight"
                        ? "bg-ink-950 text-white"
                        : "bg-cream-200 text-ink-600"
                    }`}
                  >
                    {meta.tag}
                  </span>
                  <span className="text-[10px] text-ink-400">
                    {option.label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(option)}
                  className="flex h-7 items-center gap-1 rounded-full border border-ink-950/10 bg-cream-50 px-2.5 text-[10px] text-ink-500 hover:border-ink-950/25 hover:text-ink-950"
                >
                  {copied === option.style ? (
                    <>
                      <CheckIcon className="h-3 w-3" />
                      已复制
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-3 w-3" />
                      复制
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-[15px] font-medium leading-7 text-ink-950">
                {option.content}
              </p>
              <p className="mt-2 text-[10px] leading-5 text-ink-400">
                {option.whyItWorks}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-gold-500/20 bg-gold-300/10 px-4 py-3 text-[11px] leading-5 text-ink-700">
        <span className="font-semibold text-gold-700">先别这样发：</span>{" "}
        {result.avoid}
      </div>
      {result.timing ? (
        <p className="mt-2 px-1 text-[10px] leading-5 text-ink-400">
          发送时机：{result.timing}
        </p>
      ) : null}
    </section>
  );
}
