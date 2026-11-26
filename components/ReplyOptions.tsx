"use client";

import { useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/Icons";
import type { AnalyzeResult, ReplyOption, ReplyStyle } from "@/lib/types";

interface ReplyOptionsProps {
  result: AnalyzeResult;
}

const STYLE_META: Record<
  ReplyStyle,
  { index: string; tag: string; badgeClass: string }
> = {
  gentle: {
    index: "01",
    tag: "委婉",
    badgeClass: "bg-cream-200 text-ink-600",
  },
  humor: {
    index: "02",
    tag: "幽默",
    badgeClass: "bg-cream-100 text-ink-600",
  },
  deadpan: {
    index: "02",
    tag: "冷幽默",
    badgeClass: "bg-ink-950 text-white",
  },
  straight: {
    index: "03",
    tag: "直球",
    badgeClass: "bg-ink-950 text-white",
  },
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
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function ReplyCard({
  reply,
  copied,
  onCopy,
  extra,
}: {
  reply: ReplyOption;
  copied: boolean;
  onCopy: () => void;
  extra?: React.ReactNode;
}) {
  const meta = STYLE_META[reply.style];

  return (
    <article className="rounded-2xl border border-ink-950/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-ink-400">
            {meta.index}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-semibold ${meta.badgeClass}`}
          >
            {reply.style === "straight" ? "直球" : meta.tag}
          </span>
          <span className="text-[10px] font-medium text-ink-400">
            {reply.label}
          </span>
          {reply.affectionBonus !== undefined ? (
            <span className="rounded-full bg-cream-100 px-2 py-1 text-[9px] font-semibold text-ink-600">
              +{reply.affectionBonus} 好感
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onCopy}
          aria-label={`复制${meta.tag}回复`}
          className="flex h-7 shrink-0 items-center gap-1 rounded-full border border-ink-950/10 bg-cream-50 px-2.5 text-[10px] font-medium text-ink-500 transition-colors hover:border-ink-950/25 hover:text-ink-950"
        >
          {copied ? (
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
        {reply.content}
      </p>
      {reply.whyItWorks ? (
        <p className="mt-2 text-[10px] leading-5 text-ink-400">
          {reply.whyItWorks}
        </p>
      ) : null}
      {extra}
    </article>
  );
}

export function ReplyOptions({ result }: ReplyOptionsProps) {
  const [copiedStyle, setCopiedStyle] = useState<ReplyStyle | null>(null);
  const [humorStyle, setHumorStyle] = useState<"humor" | "deadpan">("deadpan");

  const gentle = result.replies.find((reply) => reply.style === "gentle");
  const humor = result.replies.find((reply) => reply.style === humorStyle);
  const straight = result.replies.find((reply) => reply.style === "straight");

  if (!gentle || !humor || !straight) {
    return null;
  }

  async function handleCopy(reply: ReplyOption) {
    await copyText(reply.content);
    setCopiedStyle(reply.style);
    window.setTimeout(() => setCopiedStyle(null), 1600);
  }

  return (
    <section className="animate-fade-up" aria-labelledby="reply-title">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-ink-400">
            04 / 三种回法
          </p>
          <h2
            id="reply-title"
            className="mt-1 text-2xl font-semibold text-ink-950"
          >
            挑一句回
          </h2>
        </div>
        <span className="rounded-full border border-ink-950/10 px-2.5 py-1 text-[9px] font-medium text-ink-500">
          共 3 条
        </span>
      </div>

      <div className="space-y-2.5">
        <ReplyCard
          reply={gentle}
          copied={copiedStyle === gentle.style}
          onCopy={() => handleCopy(gentle)}
        />
        <ReplyCard
          reply={humor}
          copied={copiedStyle === humor.style}
          onCopy={() => handleCopy(humor)}
          extra={
            <div className="mt-3 flex items-center gap-1.5 border-t border-ink-950/10 pt-2.5">
              <span className="text-[9px] text-ink-400">幽默语气</span>
              {[
                { value: "humor" as const, label: "轻松" },
                { value: "deadpan" as const, label: "冷幽默" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHumorStyle(option.value)}
                  className={`rounded-full px-2 py-1 text-[9px] ${
                    humorStyle === option.value
                      ? "bg-ink-950 text-white"
                      : "bg-cream-100 text-ink-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />
        <ReplyCard
          reply={straight}
          copied={copiedStyle === straight.style}
          onCopy={() => handleCopy(straight)}
        />
      </div>
    </section>
  );
}
