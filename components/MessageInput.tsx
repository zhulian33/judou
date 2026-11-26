"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ImageIcon,
  SparkIcon,
} from "@/components/Icons";
import { EXAMPLE_MESSAGES, OPENER_EXAMPLES } from "@/lib/examples";
import type { ExampleMessage, Gender } from "@/lib/types";

interface MessageInputProps {
  mode: "reply" | "opener";
  message: string;
  myWords: string;
  context: string;
  gender: Gender;
  loading: boolean;
  error: string | null;
  onMessageChange: (value: string) => void;
  onMyWordsChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onScreenshotImport: (payload: {
    otherText: string;
    myText?: string;
    transcript: string;
  }) => void;
  onAnalyze: () => void;
  onPickExample: (example: ExampleMessage) => void;
}

export function MessageInput({
  mode,
  message,
  myWords,
  context,
  gender,
  loading,
  error,
  onMessageChange,
  onMyWordsChange,
  onContextChange,
  onGenderChange,
  onScreenshotImport,
  onAnalyze,
  onPickExample,
}: MessageInputProps) {
  const isOpener = mode === "opener";
  const [showContext, setShowContext] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrDone, setOcrDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrMessages, setOcrMessages] = useState<
    Array<{ text: string; role: "other" | "me" }>
  >([]);
  const previewRef = useRef<string | null>(null);

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

  useEffect(
    () => () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    },
    [],
  );

  function applyOcrMessages(
    messages: Array<{ text: string; role: "other" | "me" }>,
  ) {
    const otherLines = messages
      .filter((item) => item.role === "other")
      .map((item) => item.text);
    const myLines = messages
      .filter((item) => item.role === "me")
      .map((item) => item.text);
    const otherText = otherLines.at(-1) ?? messages.at(-1)?.text ?? "";

    onScreenshotImport({
      otherText,
      myText: myLines.join("\n") || undefined,
      transcript: messages.map((item) => item.text).join("\n"),
    });
  }

  async function handleScreenshot(file: File) {
    setOcrLoading(true);
    setOcrError(null);
    setOcrDone(false);

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    const preview = URL.createObjectURL(file);
    previewRef.current = preview;
    setPreviewUrl(preview);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as
        | {
            text: string;
            lines: string[];
            blocks: Array<{
              text: string;
              left: number;
              top: number;
              width: number;
            }>;
          }
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload ? payload.error : "截图识别失败。",
        );
      }

      let imageWidth = 0;
      try {
        const bitmap = await createImageBitmap(file);
        imageWidth = bitmap.width;
        bitmap.close();
      } catch {
        imageWidth = 0;
      }

      const detected =
        payload.blocks.length > 0
          ? payload.blocks.map((block) => ({
              text: block.text,
              role:
                imageWidth > 0 && block.left / imageWidth > 0.18
                  ? ("me" as const)
                  : ("other" as const),
            }))
          : payload.lines.map((text) => ({
              text,
              role: "other" as const,
            }));

      setOcrMessages(detected);
      applyOcrMessages(detected);
      setOcrDone(true);
    } catch (requestError) {
      setOcrError(
        requestError instanceof Error
          ? requestError.message
          : "截图识别失败。",
      );
    } finally {
      setOcrLoading(false);
    }
  }

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        onAnalyze();
      }}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-ember-600">
            {isOpener ? "02 / 主动开口" : "02 / 粘贴原话"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink-950">
            {isOpener ? "你想找对方说什么？" : "把那条消息放进来"}
          </h2>
        </div>
        <span className="pb-0.5 text-[11px] text-ink-400">
          {message.length} / {isOpener ? 600 : 1999}
        </span>
      </div>

      <div
        className={[
          "relative mt-3.5 rounded-2xl border bg-white transition-all duration-200 focus-within:shadow-soft",
          error
            ? "border-gold-500/60 ring-4 ring-gold-500/10"
            : "border-ink-950/10 focus-within:border-ember-300",
        ].join(" ")}
      >
        <textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          maxLength={isOpener ? 600 : 1999}
          rows={isOpener ? 4 : 5}
          placeholder={
            isOpener
              ? "例如：想问问 TA 最近怎么样，但怕太突然。"
              : "例如：我最近有点忙，晚点再说吧。"
          }
          aria-label={isOpener ? "想找对方说什么" : "要解读的消息"}
          className="block min-h-[132px] w-full resize-none bg-transparent px-4 py-4 text-[16px] leading-7 text-ink-950 outline-none placeholder:text-ink-400/65"
        />
        <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-ember-500">
          <SparkIcon className="h-4 w-4" />
        </div>
      </div>

      {!isOpener ? (
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
      ) : null}

      <div className="mt-3">
        <label
          htmlFor="chat-screenshot"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files?.[0];
            if (file && !ocrLoading) {
              void handleScreenshot(file);
            }
          }}
          className={[
            "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3.5 py-3 transition-colors",
            ocrLoading
              ? "cursor-wait border-ink-950/10 bg-cream-50"
              : "border-ink-950/20 bg-cream-50 hover:border-ink-950/35 hover:bg-white",
          ].join(" ")}
        >
          <input
            id="chat-screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={ocrLoading}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleScreenshot(file);
              }
              event.target.value = "";
            }}
          />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="已上传的聊天截图"
              className="h-11 w-11 shrink-0 rounded-lg border border-ink-950/10 object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-ink-500">
              <ImageIcon className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[12px] font-medium text-ink-700">
              {ocrLoading ? "正在识别截图…" : "上传聊天截图"}
            </span>
            <span className="mt-0.5 block text-[9px] leading-4 text-ink-400">
              {ocrDone
                ? "已识别，左侧按「对方」、右侧按「我」自动判断"
                : "点击选择图片，也可以直接拖进来"}
            </span>
          </span>
        </label>
        {ocrMessages.length > 0 ? (
          <div className="mt-2 rounded-xl border border-ink-950/10 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-medium text-ink-400">
                识别到 {ocrMessages.length} 段，点标签可改归属
              </p>
              <button
                type="button"
                onClick={() => applyOcrMessages(ocrMessages)}
                className="text-[9px] font-medium text-ember-600 hover:text-ember-700"
              >
                按这版填入
              </button>
            </div>
            <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
              {ocrMessages.map((message, index) => (
                <div
                  key={`${message.text}-${index}`}
                  className="flex items-start gap-2 text-[10px] leading-5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOcrMessages((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                role:
                                  item.role === "other" ? "me" : "other",
                              }
                            : item,
                        ),
                      )
                    }
                    className={`shrink-0 rounded-full px-2 py-0.5 ${
                      message.role === "other"
                        ? "bg-ink-950 text-white"
                        : "bg-cream-100 text-ink-500"
                    }`}
                  >
                    {message.role === "other" ? "对方" : "我"}
                  </button>
                  <span className="text-ink-600">{message.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {ocrError ? (
          <p role="alert" className="mt-1.5 text-[10px] text-ink-500">
            {ocrError}
          </p>
        ) : null}
        <p className="mt-1 text-[9px] leading-4 text-ink-400">
          截图只用于识别文字，不会保存；敏感聊天请先打码。
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
            {(isOpener ? OPENER_EXAMPLES : EXAMPLE_MESSAGES).map((example) => (
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

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-gold-500/25 bg-gold-300/10 px-3.5 py-2.5 text-xs leading-5 text-gold-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-4 text-[15px] font-semibold text-cream-50 shadow-[0_12px_30px_-20px_rgba(27,33,28,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ember-700 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100/30 border-t-cream-50" />
            正在读潜台词…
          </>
        ) : (
          <>
            {isOpener ? "帮我想开场" : "看看怎么回"}
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
