"use client";

import { useEffect, useState } from "react";

import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  SparkIcon,
} from "@/components/Icons";
import { EXAMPLE_MESSAGES } from "@/lib/examples";
import type { ExampleMessage, Gender } from "@/lib/types";

interface MessageInputProps {
  message: string;
  myWords: string;
  context: string;
  gender: Gender;
  onMessageChange: (value: string) => void;
  onMyWordsChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onSummarize: () => void;
  summarizing: boolean;
  summaryReady: boolean;
  onPickExample: (example: ExampleMessage) => void;
}

export function MessageInput({
  message,
  myWords,
  context,
  gender,
  onMessageChange,
  onMyWordsChange,
  onContextChange,
  onGenderChange,
  onSummarize,
  summarizing,
  summaryReady,
  onPickExample,
}: MessageInputProps) {
  const [showContext, setShowContext] = useState(false);
  const [showGender, setShowGender] = useState(false);
  useEffect(() => {
    if (context) {
      setShowContext(true);
    }
  }, [context]);

  useEffect(() => {
    if (gender !== "unknown") {
      setShowGender(true);
    }
  }, [gender]);

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSummarize();
      }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-ember-600">
            "02 / 粘贴原话"
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink-950">
            "把那条消息放进来"
          </h2>
        </div>
        <span className="pb-0.5 text-[11px] text-ink-400">
          {message.length} / 1999
        </span>
      </div>

      <div
        className="relative mt-3.5 rounded-2xl border border-ink-950/10 bg-white transition-all duration-200 focus-within:border-ember-300 focus-within:shadow-soft"
      >
        <textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          maxLength={1999}
          rows={5}
          placeholder="例如：我最近有点忙，晚点再说吧。"
          onFocus={(event) => {
            const node = event.currentTarget;
            window.setTimeout(() => {
              node.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 260);
          }}
          aria-label="要解读的消息"
          className="block min-h-[132px] w-full resize-none bg-transparent px-4 py-4 text-[16px] leading-7 text-ink-950 outline-none placeholder:text-ink-400/65"
        />
        <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-ember-500">
          <SparkIcon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="my-words"
            className="text-[11px] font-medium text-ink-600"
          >
            我自己想怎么回
          </label>
          <span className="text-[9px] text-ink-400">
            {myWords.length} / 600 · 可选
          </span>
        </div>
        <textarea
          id="my-words"
          value={myWords}
          onChange={(event) => onMyWordsChange(event.target.value)}
          maxLength={600}
          rows={2}
          placeholder="比如：我想说我在意，但不想显得我在求对方。"
          className="mt-1.5 block w-full resize-none bg-transparent text-[16px] leading-6 text-ink-800 outline-none placeholder:text-ink-400/60"
        />
        <p className="mt-1 text-[9px] leading-4 text-ink-400">
          写一句就行，我会顺着你的意思改，不会替你换立场。
        </p>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowContext((visible) => !visible)}
          aria-expanded={showContext}
          className="flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-ember-600"
        >
          补充一点背景
          <span className="text-[10px] text-ink-400/70">可不填</span>
          <ChevronDownIcon
            className={[
              "h-3.5 w-3.5 transition-transform duration-200",
              showContext ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {showContext ? (
          <textarea
            value={context}
            onChange={(event) => onContextChange(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="比如：我们之前约好了周末见面 / 对方是我上司 / 这句话前面还聊了……"
            aria-label="补充背景"
            className="mt-2.5 block w-full resize-none rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 py-3 text-[16px] leading-6 text-ink-800 outline-none transition-colors placeholder:text-ink-400/60 focus:border-ember-300 focus:bg-white"
          />
        ) : null}
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowGender((visible) => !visible)}
          aria-expanded={showGender}
          className="flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-ember-600"
        >
          补充对方性别
          <span className="text-[10px] text-ink-400/70">可选</span>
          <ChevronDownIcon
            className={[
              "h-3.5 w-3.5 transition-transform duration-200",
              showGender ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {showGender ? (
          <div className="mt-2.5 rounded-xl border border-ink-950/10 bg-cream-50 p-3">
            <div>
              <p className="mb-1.5 text-[10px] font-medium text-ink-400">
                对方性别
              </p>
              <div className="flex gap-1.5">
                {[
                  { value: "unknown" as const, label: "不填" },
                  { value: "female" as const, label: "女性" },
                  { value: "male" as const, label: "男性" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onGenderChange(option.value)}
                    className={[
                      "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                      gender === option.value
                        ? "border-ember-500 bg-ember-50 text-ember-700"
                        : "border-ink-950/10 bg-white text-ink-500 hover:border-ember-300",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[9px] text-ink-400">
                不填时会统一用「对方 / TA」，不会猜性别。
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[11px] font-medium text-ink-400">
            试试：
          </span>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
            {EXAMPLE_MESSAGES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => onPickExample(example)}
                className="shrink-0 rounded-full border border-ink-950/10 bg-white px-2.5 py-1.5 text-[11px] text-ink-600 transition-all hover:border-ember-300 hover:bg-ember-50 hover:text-ember-700"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={summarizing || message.trim().length < 20}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-4 text-[15px] font-semibold text-cream-50 shadow-[0_12px_30px_-20px_rgba(27,33,28,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {summarizing ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100/30 border-t-cream-50" />
            正在拆这段…
          </>
        ) : (
          <>
            {summaryReady ? "重新提炼" : "提炼这段"}
            <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
      <p className="mt-2 text-[9px] leading-4 text-ink-400">
        未配置自有模型时，会使用有频率限制的公共模型服务。请勿输入身份证、住址等敏感信息。
      </p>
    </form>
  );
}
