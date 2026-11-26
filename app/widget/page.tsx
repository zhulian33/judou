"use client";

import { useEffect, useRef, useState } from "react";

import { BrandMark, CheckIcon, CopyIcon } from "@/components/Icons";
import { RegisterDialog } from "@/components/RegisterDialog";
import { useAccount } from "@/lib/useAccount";
import type {
  AlmanacData,
  AnalyzeResult,
  OpenerResult,
  Scene,
} from "@/lib/types";

const SCENES: Array<{ id: Scene; label: string }> = [
  { id: "flirt", label: "暧昧" },
  { id: "work", label: "职场" },
  { id: "family", label: "家庭" },
  { id: "service", label: "客服" },
  { id: "friend", label: "朋友" },
];

type WidgetMode = "detail" | "reply" | "opener";

function getDateByOffset(offset: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Date.now() + offset * 86_400_000));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function WidgetPage() {
  const cardRef = useRef<HTMLElement>(null);
  const [almanac, setAlmanac] = useState<AlmanacData | null>(null);
  const [mode, setMode] = useState<WidgetMode>("detail");
  const [dayOffset, setDayOffset] = useState(0);
  const [message, setMessage] = useState("");
  const [scene, setScene] = useState<Scene>("friend");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openerIdea, setOpenerIdea] = useState("");
  const [openerResult, setOpenerResult] = useState<OpenerResult | null>(null);
  const [openerLoading, setOpenerLoading] = useState(false);
  const [openerError, setOpenerError] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { account, register } = useAccount();

  useEffect(() => {
    let cancelled = false;
    const date = getDateByOffset(dayOffset);

    fetch(`/api/almanac?date=${date}`, { cache: "no-store" })
      .then((response) => response.json() as Promise<AlmanacData>)
      .then((data) => {
        if (!cancelled) {
          setAlmanac(data);
        }
      })
      .catch((requestError) => {
        console.error("[句读] widget almanac failed:", requestError);
      });

    return () => {
      cancelled = true;
    };
  }, [dayOffset]);

  useEffect(() => {
    const sendHeight = () => {
      const height = registerOpen
        ? 540
        : Math.max(350, (cardRef.current?.offsetHeight ?? 420) + 24);
      const webkit = (
        window as Window & {
          webkit?: {
            messageHandlers?: {
              judouResize?: { postMessage: (value: number) => void };
            };
          };
        }
      ).webkit;
      if (window.innerWidth <= 620) {
        webkit?.messageHandlers?.judouResize?.postMessage(height);
      }
    };

    const frame = window.requestAnimationFrame(sendHeight);
    return () => window.cancelAnimationFrame(frame);
  }, [almanac, mode, registerOpen, result, openerResult]);

  const bondScore = result?.affection?.score ?? result?.trust?.score ?? 0;
  const tint = 0.015 + (bondScore / 100) * 0.22;
  const compactReplies = result
    ? (["gentle", "deadpan", "straight"] as const)
        .map((style) => result.replies.find((reply) => reply.style === style))
        .filter((reply): reply is NonNullable<typeof reply> => Boolean(reply))
    : [];

  async function analyze() {
    if (!message.trim()) {
      setError("先把对方的话贴进来。");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, scene }),
      });
      const payload = (await response.json()) as
        | AnalyzeResult
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "没有读出结果。");
      }

      setResult(payload);
      window.localStorage.setItem(
        "judou.widget.lastResult",
        JSON.stringify(payload),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "请稍后再试。",
      );
    } finally {
      setLoading(false);
    }
  }

  async function askOpener() {
    if (!openerIdea.trim()) {
      setOpenerError("先说一句你想干嘛，哪怕只有几个字。");
      return;
    }

    setOpenerLoading(true);
    setOpenerError(null);
    setOpenerResult(null);

    try {
      const response = await fetch("/api/opener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: openerIdea, scene }),
      });
      const payload = (await response.json()) as
        | OpenerResult
        | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "没想出合适的开场。");
      }

      setOpenerResult(payload);
    } catch (requestError) {
      setOpenerError(
        requestError instanceof Error ? requestError.message : "请稍后再试。",
      );
    } finally {
      setOpenerLoading(false);
    }
  }

  async function copyReply(content: string, key: string) {
    await navigator.clipboard.writeText(content);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function headerActions() {
    return (
      <div className="flex items-center gap-2.5">
        {!account && (
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="text-[9px] text-ink-400 hover:text-ink-950"
          >
            注册
          </button>
        )}
        <a
          href="/"
          className="text-[9px] text-ink-400 underline decoration-ink-950/15 underline-offset-2 hover:text-ink-950"
        >
          完整版
        </a>
      </div>
    );
  }

  return (
    <main
      className="flex min-h-screen items-start justify-center p-3"
      style={{
        background: `radial-gradient(circle at 50% 0%, rgb(var(--tint-rgb) / ${tint}), transparent 72%)`,
      }}
    >
      <section
        ref={cardRef}
        className="w-full max-w-[360px] overflow-hidden rounded-[26px] border border-black/10 bg-[#fbfbf9]/95 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.45)] backdrop-blur min-[620px]:max-w-[900px]"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-white">
              <BrandMark className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.06em] text-ink-950">
                句读
              </p>
              <p className="text-[7px] font-semibold tracking-[0.14em] text-ink-400">
                赛博黄历
              </p>
            </div>
          </div>
          {headerActions()}
        </div>

        {mode === "reply" ? (
          <div className="max-h-[620px] overflow-y-auto px-4 py-4 min-[620px]:grid min-[620px]:grid-cols-[210px_1fr] min-[620px]:items-start min-[620px]:gap-4">
            <aside className="hidden min-[620px]:block">
              <p className="text-[9px] font-medium text-ink-400">
                {almanac?.date}
              </p>
              <p className="mt-1 font-serif text-5xl font-semibold leading-none text-ink-950">
                {almanac?.date.slice(8)}
              </p>
              <p className="mt-2 text-[10px] text-ink-500">
                农历 {almanac?.lunarDate}
              </p>
              <p className="mt-3 border-l-2 border-black/15 pl-2.5 text-[10px] leading-5 text-ink-600">
                {almanac?.summary}
              </p>
              <div className="mt-3 space-y-2 text-[10px]">
                <p className="leading-5 text-ink-700">
                  <span className="font-semibold text-ink-400">宜 </span>
                  {almanac?.yi.slice(0, 4).join(" · ")}
                </p>
                <p className="leading-5 text-ink-700">
                  <span className="font-semibold text-ink-400">忌 </span>
                  {almanac?.ji.slice(0, 3).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode("detail")}
                className="mt-3 text-[9px] text-ink-400 underline decoration-black/15 underline-offset-2 hover:text-ink-950"
              >
                看完整黄历
              </button>
            </aside>

            <div className="min-[620px]:col-start-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode("detail")}
                className="text-[10px] text-ink-400 hover:text-ink-950"
              >
                ← 回到黄历
              </button>
              <p className="text-[9px] tracking-[0.12em] text-ink-400">
                回一句
              </p>
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              autoFocus
              placeholder="把对方的话放进来"
              className="mt-4 block w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[16px] leading-6 text-ink-900 outline-none focus:border-black/30"
            />

            <div className="mt-2 flex flex-wrap gap-1">
              {SCENES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScene(item.id)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] ${
                    scene === item.id
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-ink-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={analyze}
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-black px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-60"
            >
              {loading ? "正在看…" : "看看怎么回"}
            </button>

            {error ? (
              <p className="mt-2 text-[10px] text-ink-500">{error}</p>
            ) : null}

            {result ? (
              <div className="mt-4 space-y-2">
                <div className="rounded-xl border border-black/10 bg-cream-50 px-3 py-2.5">
                  <p className="text-[9px] font-semibold text-ink-400">
                    对方内心 OS
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-ink-700">
                    “{result.thoughts}”
                  </p>
                  <p className="mt-2 text-[9px] font-semibold text-ink-400">
                    下一句可能会说
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-ink-700">
                    {result.nextLine.content}
                  </p>
                </div>
                {compactReplies.map((reply) => (
                  <div
                    key={reply.style}
                    className="rounded-xl border border-black/10 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-semibold text-ink-400">
                        {reply.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyReply(reply.content, reply.style)
                        }
                        aria-label={`复制${reply.label}`}
                        className="flex items-center gap-1 text-[9px] text-ink-400 hover:text-ink-950"
                      >
                        {copied === reply.style ? (
                          <>
                            <CheckIcon className="h-3 w-3" /> 已复制
                          </>
                        ) : (
                          <>
                            <CopyIcon className="h-3 w-3" /> 复制
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-5 text-ink-900">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            </div>
          </div>
        ) : mode === "opener" ? (
          <div className="max-h-[780px] overflow-y-auto px-4 py-4 min-[620px]:grid min-[620px]:grid-cols-[210px_1fr] min-[620px]:items-start min-[620px]:gap-4">
            <aside className="hidden min-[620px]:block">
              <p className="text-[9px] font-medium text-ink-400">
                {almanac?.date}
              </p>
              <p className="mt-1 font-serif text-5xl font-semibold leading-none text-ink-950">
                {almanac?.date.slice(8)}
              </p>
              <p className="mt-2 text-[10px] text-ink-500">
                农历 {almanac?.lunarDate}
              </p>
              <p className="mt-3 border-l-2 border-black/15 pl-2.5 text-[10px] leading-5 text-ink-600">
                {almanac?.summary}
              </p>
              <button
                type="button"
                onClick={() => setMode("detail")}
                className="mt-3 text-[9px] text-ink-400 underline decoration-black/15 underline-offset-2 hover:text-ink-950"
              >
                看完整黄历
              </button>
            </aside>

            <div className="min-[620px]:col-start-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("detail")}
                  className="text-[10px] text-ink-400 hover:text-ink-950"
                >
                  ← 回到黄历
                </button>
                <p className="text-[9px] tracking-[0.12em] text-ink-400">
                  发一句
                </p>
              </div>

              <textarea
                value={openerIdea}
                onChange={(event) => setOpenerIdea(event.target.value)}
                rows={3}
                autoFocus
                placeholder="你想找对方，是为了什么？比如：想约吃饭，但怕太直接。"
                className="mt-4 block w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[16px] leading-6 text-ink-900 outline-none focus:border-black/30"
              />

              <div className="mt-2 flex flex-wrap gap-1">
                {SCENES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScene(item.id)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] ${
                      scene === item.id
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-ink-500"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={askOpener}
                disabled={openerLoading}
                className="mt-3 w-full rounded-xl bg-black px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                {openerLoading ? "正在想…" : "帮我想一句"}
              </button>

              {openerError ? (
                <p className="mt-2 text-[10px] text-ink-500">{openerError}</p>
              ) : null}

              {openerResult ? (
                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border border-black/10 bg-cream-50 px-3 py-2.5">
                    <p className="text-[9px] font-semibold text-ink-400">
                      先看对方那边
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-ink-700">
                      {openerResult.read}
                    </p>
                  </div>
                  {openerResult.options.map((option) => (
                    <div
                      key={option.style}
                      className="rounded-xl border border-black/10 bg-white p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-semibold text-ink-400">
                          {option.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyReply(option.content, option.style)}
                          aria-label={`复制${option.label}`}
                          className="flex items-center gap-1 text-[9px] text-ink-400 hover:text-ink-950"
                        >
                          {copied === option.style ? (
                            <>
                              <CheckIcon className="h-3 w-3" /> 已复制
                            </>
                          ) : (
                            <>
                              <CopyIcon className="h-3 w-3" /> 复制
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[12px] leading-5 text-ink-900">
                        {option.content}
                      </p>
                    </div>
                  ))}
                  {openerResult.avoid ? (
                    <p className="rounded-xl bg-white/70 px-3 py-2 text-[10px] leading-4 text-ink-500">
                      别这样说：{openerResult.avoid}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="px-4 pb-4 pt-3 min-[620px]:grid min-[620px]:grid-cols-2 min-[620px]:items-start min-[620px]:gap-x-6 min-[620px]:gap-y-3">
            <div className="flex items-center justify-between border-b border-black/10 pb-2 min-[620px]:col-span-2">
              <button
                type="button"
                onClick={() => setDayOffset((value) => value - 1)}
                className="text-[9px] text-ink-400 hover:text-ink-950"
              >
                ← 前一天
              </button>
              <button
                type="button"
                onClick={() => setDayOffset(0)}
                className="rounded-full border border-black/10 px-2.5 py-1 text-[9px] text-ink-500 hover:text-ink-950"
              >
                回到今天
              </button>
              <button
                type="button"
                onClick={() => setDayOffset((value) => value + 1)}
                className="text-[9px] text-ink-400 hover:text-ink-950"
              >
                后一天 →
              </button>
            </div>

            <div className="min-[620px]:col-start-1">
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-medium text-ink-400">
                    {almanac ? `${almanac.date.slice(0, 4)} 年` : "今天"}
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="font-serif text-[68px] font-semibold leading-none tracking-[-0.07em] text-ink-950">
                      {almanac?.date.slice(8) ?? "—"}
                    </span>
                    <div className="pb-1">
                      <p className="text-[11px] text-ink-400">
                        {almanac ? `${Number(almanac.date.slice(5, 7))} 月` : ""}
                      </p>
                      <p className="text-[11px] text-ink-400">{almanac?.weekday}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-600">
                    农历 {almanac?.lunarDate ?? "—"}
                  </p>
                </div>
                <span className="rounded-full border border-black/10 px-2.5 py-1 text-[9px] text-ink-500">
                  {almanac
                    ? `${almanac.dayOfficer} · ${almanac.dayOfficerMeaning ?? "民俗日"}`
                    : "黄历"}
                </span>
              </div>

              <p className="mt-3 border-l-2 border-ink-950/20 pl-3 text-[11px] leading-5 text-ink-600">
                {almanac?.summary ?? "按自己的节奏来。"}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="text-[9px] font-semibold text-ink-400">宜</p>
                  <p className="mt-1 text-[10px] leading-5 text-ink-700">
                    {almanac?.yi.slice(0, 6).join(" · ") ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-2.5">
                  <p className="text-[9px] font-semibold text-ink-400">忌</p>
                  <p className="mt-1 text-[10px] leading-5 text-ink-700">
                    {almanac?.ji.slice(0, 5).join(" · ") ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-[620px]:col-start-2">
              <div className="mt-2 grid gap-2 rounded-xl border border-black/10 bg-white/75 p-3 min-[620px]:mt-3">
                <p className="text-[9px] font-semibold text-ink-400">
                  今天可以这样做
                </p>
                {[
                  ["学习", almanac?.lifeTips.learning],
                  ["沟通", almanac?.lifeTips.communication],
                  ["钱的事", almanac?.lifeTips.money],
                ].map(([label, tip]) => (
                  <div key={label} className="grid grid-cols-[40px_1fr] gap-2">
                    <span className="text-[9px] font-medium text-ink-400">
                      {label}
                    </span>
                    <span className="text-[10px] leading-4 text-ink-700">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-black/10 bg-white/75 p-3 text-[10px]">
                <div>
                  <p className="text-[9px] text-ink-400">生肖相冲</p>
                  <p className="mt-1 text-ink-700">{almanac?.chong ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-ink-400">方位</p>
                  <p className="mt-1 text-ink-700">{almanac?.sha ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-ink-400">今日五行</p>
                  <p className="mt-1 text-ink-700">{almanac?.nayin ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] text-ink-400">吉位</p>
                  <p className="mt-1 text-ink-700">
                    {almanac
                      ? `喜神${almanac.xiDirection} · 财神${almanac.caiDirection}`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("opener")}
                  className="w-full rounded-xl bg-black px-3 py-3 text-[12px] font-semibold text-white"
                >
                  发一句
                </button>
                <button
                  type="button"
                  onClick={() => setMode("reply")}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-[12px] font-semibold text-ink-950"
                >
                  回一句
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-[8px] text-ink-400 min-[620px]:col-span-2">
              黄历为传统民俗信息，仅供参考
            </p>
          </div>
        )}
      </section>

      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={register}
      />
    </main>
  );
}
