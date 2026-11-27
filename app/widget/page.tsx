"use client";

import { useEffect, useRef, useState } from "react";

import { ModelSettings } from "@/components/ModelSettings";
import { RegisterDialog } from "@/components/RegisterDialog";
import { SummaryCard } from "@/components/SummaryCard";
import { useAccount } from "@/lib/useAccount";
import { PLACES } from "@/lib/places";
import { useModelKey } from "@/lib/useModelKey";
import type {
  AlmanacData,
  AskResult,
  Scene,
  SummaryResult,
} from "@/lib/types";

const SCENES: Array<{ id: Scene; label: string }> = [
  { id: "flirt", label: "暧昧" },
  { id: "work", label: "职场" },
  { id: "family", label: "家庭" },
  { id: "service", label: "客服" },
  { id: "friend", label: "朋友" },
];

type WidgetMode = "detail" | "reply" | "ask";

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
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthGender, setBirthGender] = useState("");
  const [showBirth, setShowBirth] = useState(false);
  const [partnerDate, setPartnerDate] = useState("");
  const [partnerTime, setPartnerTime] = useState("");
  const [partnerPlace, setPartnerPlace] = useState("");
  const [partnerGender, setPartnerGender] = useState("");
  const [showPartner, setShowPartner] = useState(false);
  const [focus, setFocus] = useState<"self" | "partner">("self");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { account, register } = useAccount();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    prefs: modelPrefs,
    save: saveModelPrefs,
    consumeFree,
    remaining: freeLeft,
    needsKey,
    headers: modelHeaders,
  } = useModelKey();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("judou.birth.v1");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          date?: string;
          time?: string;
          place?: string;
          gender?: string;
        };
        if (parsed.date) setBirthDate(parsed.date);
        if (parsed.time) setBirthTime(parsed.time);
        if (parsed.place) setBirthPlace(parsed.place);
        if (parsed.gender) setBirthGender(parsed.gender);
        const partnerRaw = window.localStorage.getItem("judou.partner.v1");
        if (partnerRaw) {
          const partner = JSON.parse(partnerRaw) as {
            date?: string;
            time?: string;
            place?: string;
            gender?: string;
          };
          if (partner.date) setPartnerDate(partner.date);
          if (partner.time) setPartnerTime(partner.time);
          if (partner.place) setPartnerPlace(partner.place);
          if (partner.gender) setPartnerGender(partner.gender);
        }
      }
    } catch {
      // 忽略损坏的本地数据
    }
  }, []);

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
  }, [almanac, mode, registerOpen, summary, askResult]);

  const tint = 0.04;
  async function summarize() {
    if (needsKey) {
      setSettingsOpen(true);
      setSummaryError("免费次数用完了，填一个自己的 API Key 继续。");
      return;
    }
    if (message.trim().length < 20) {
      setSummaryError("先把那段话贴进来，20 字以上才好拆。");
      return;
    }

    setSummarizing(true);
    setSummaryError(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...modelHeaders },
        body: JSON.stringify({ text: message, scene }),
      });
      const payload = (await response.json()) as SummaryResult | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "没拆出来。");
      }

      const source = response.headers.get("X-Judou-Source");
      if (source === "server" || source === "public") {
        consumeFree();
      }
      setSummary(payload);
    } catch (requestError) {
      setSummaryError(
        requestError instanceof Error ? requestError.message : "请稍后再试。",
      );
    } finally {
      setSummarizing(false);
    }
  }

  async function askAlmanac() {
    if (needsKey) {
      setSettingsOpen(true);
      setAskError("免费次数用完了，填一个自己的 API Key 继续。");
      return;
    }
    if (!question.trim()) {
      setAskError("先写一句你想问的。");
      return;
    }

    setAskLoading(true);
    setAskError(null);
    setAskResult(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...modelHeaders },
        body: JSON.stringify({
          question,
          scene,
          focus,
          ...(birthDate
            ? {
                birth: {
                  date: birthDate,
                  ...(birthTime
                    ? {
                        hour: Number(birthTime.split(":")[0]),
                        minute: Number(birthTime.split(":")[1]),
                      }
                    : {}),
                  ...(birthPlace ? { place: birthPlace } : {}),
                  ...(birthGender === "male" || birthGender === "female"
                    ? { gender: birthGender }
                    : {}),
                },
              }
            : {}),
          ...(partnerDate
            ? {
                partnerBirth: {
                  date: partnerDate,
                  ...(partnerTime
                    ? {
                        hour: Number(partnerTime.split(":")[0]),
                        minute: Number(partnerTime.split(":")[1]),
                      }
                    : {}),
                  ...(partnerPlace ? { place: partnerPlace } : {}),
                  ...(partnerGender === "male" || partnerGender === "female"
                    ? { gender: partnerGender }
                    : {}),
                },
              }
            : {}),
        }),
      });
      const payload = (await response.json()) as AskResult | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "没查出来。");
      }

      const source = response.headers.get("X-Judou-Source");
      if (source === "server" || source === "public") {
        consumeFree();
      }
      setAskResult(payload);
    } catch (requestError) {
      setAskError(
        requestError instanceof Error ? requestError.message : "请稍后再试。",
      );
    } finally {
      setAskLoading(false);
    }
  }

  function headerActions() {
    return (
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="text-[9px] text-ink-400 hover:text-ink-950"
        >
          设置{freeLeft > 0 ? ` · 剩${freeLeft}` : ""}
        </button>
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
            <img
              src="/icon-512.png"
              alt="句读JUDOU"
              className="h-7 w-7 rounded-full"
            />
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
            <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-1 flex items-center justify-between bg-[#fbfbf9]/95 px-4 pb-2 pt-4 backdrop-blur">
              <button
                type="button"
                onClick={() => setMode("detail")}
                className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] text-ink-600 hover:text-ink-950"
              >
                ← 回到黄历
              </button>
              <p className="text-[9px] tracking-[0.12em] text-ink-400">
                提炼
              </p>
            </div>

            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setSummary(null);
              }}
              rows={4}
              autoFocus
              onFocus={(event) => {
                const node = event.currentTarget;
                window.setTimeout(() => {
                  node.scrollIntoView({ block: "center", behavior: "smooth" });
                }, 220);
              }}
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
              onClick={summarize}
              disabled={summarizing || message.trim().length < 20}
              className="mt-3 w-full rounded-xl bg-black px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              {summarizing
                ? "正在拆这段…"
                : summary
                  ? "重新提炼"
                  : "提炼这段"}
            </button>

            {summaryError ? (
              <p className="mt-2 text-[10px] text-ink-500">{summaryError}</p>
            ) : null}

            {summary ? (
              <div className="mt-3">
                <SummaryCard result={summary} />
              </div>
            ) : null}

            </div>
          </div>
        ) : mode === "ask" ? (
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
              <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-1 flex items-center justify-between bg-[#fbfbf9]/95 px-4 pb-2 pt-4 backdrop-blur">
                <button
                  type="button"
                  onClick={() => setMode("detail")}
                  className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] text-ink-600 hover:text-ink-950"
                >
                  ← 回到黄历
                </button>
                <p className="text-[9px] tracking-[0.12em] text-ink-400">
                  先知
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-cream-100 p-1">
                {[
                  { value: "self" as const, label: "只看自己" },
                  { value: "partner" as const, label: "看看 TA" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setFocus(item.value);
                      if (item.value === "partner") setShowPartner(true);
                    }}
                    className={`rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                      focus === item.value
                        ? "bg-white text-ink-950 shadow-soft"
                        : "text-ink-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={3}
                autoFocus
                onFocus={(event) => {
                  const node = event.currentTarget;
                  window.setTimeout(() => {
                    node.scrollIntoView({ block: "center", behavior: "smooth" });
                  }, 220);
                }}
                placeholder="比如：今天适合约 TA 出来吗？还是先别打扰她？"
                className="mt-4 block w-full resize-none rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[16px] leading-6 text-ink-900 outline-none focus:border-black/30"
              />

              <div className="mt-2 flex flex-wrap gap-1">
                {["今天适合约 TA 吗", "今天适合把话说开吗", "今天适合谈钱吗"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setQuestion(item)}
                      className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] text-ink-500 hover:text-ink-950"
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <div className="mt-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setShowBirth((value) => !value)}
                  className="flex w-full items-center justify-between text-[10px] text-ink-500"
                >
                  <span>
                    生日（可选，排四柱用）
                    {birthDate ? ` · ${birthDate}` : ""}
                  </span>
                  <span>{showBirth ? "收起" : "填写"}</span>
                </button>
                {showBirth ? (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(event) => {
                          const value = event.target.value;
                          setBirthDate(value);
                          window.localStorage.setItem(
                            "judou.birth.v1",
                            JSON.stringify({
                              date: value,
                              time: birthTime,
                              place: birthPlace,
                              gender: birthGender,
                            }),
                          );
                        }}
                        className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      />
                      <input
                        type="time"
                        value={birthTime}
                        onChange={(event) => {
                          const value = event.target.value;
                          setBirthTime(value);
                          window.localStorage.setItem(
                            "judou.birth.v1",
                            JSON.stringify({
                              date: birthDate,
                              time: value,
                              place: birthPlace,
                              gender: birthGender,
                            }),
                          );
                        }}
                        className="w-[86px] rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={birthPlace}
                        onChange={(event) => {
                          const value = event.target.value;
                          setBirthPlace(value);
                          window.localStorage.setItem(
                            "judou.birth.v1",
                            JSON.stringify({
                              date: birthDate,
                              time: birthTime,
                              place: value,
                              gender: birthGender,
                            }),
                          );
                        }}
                        className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      >
                        <option value="">出生城市（真太阳时）</option>
                        {PLACES.map((place) => (
                          <option key={place.name} value={place.name}>
                            {place.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={birthGender}
                        onChange={(event) => {
                          const value = event.target.value;
                          setBirthGender(value);
                          window.localStorage.setItem(
                            "judou.birth.v1",
                            JSON.stringify({
                              date: birthDate,
                              time: birthTime,
                              place: birthPlace,
                              gender: value,
                            }),
                          );
                        }}
                        className="w-[76px] rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      >
                        <option value="">性别</option>
                        <option value="male">男</option>
                        <option value="female">女</option>
                      </select>
                    </div>
                  </div>
                ) : null}
                <p className="mt-1 text-[9px] leading-4 text-ink-400">
                  按真太阳时排，时间精确到分钟；城市修正经度，性别只影响大运。
                </p>
              </div>

              <div className="mt-1.5 rounded-xl border border-black/10 bg-white/70 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setShowPartner((value) => !value)}
                  className="flex w-full items-center justify-between text-[10px] text-ink-500"
                >
                  <span>
                    TA 的生辰（合盘）
                    {partnerDate
                      ? ` · ${partnerDate}`
                      : focus === "partner"
                        ? " · 必填"
                        : ""}
                  </span>
                  <span>{showPartner ? "收起" : "填写"}</span>
                </button>
                {showPartner ? (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={partnerDate}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPartnerDate(value);
                          window.localStorage.setItem(
                            "judou.partner.v1",
                            JSON.stringify({ date: value, time: partnerTime, place: partnerPlace, gender: partnerGender }),
                          );
                        }}
                        className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      />
                      <input
                        type="time"
                        value={partnerTime}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPartnerTime(value);
                          window.localStorage.setItem(
                            "judou.partner.v1",
                            JSON.stringify({ date: partnerDate, time: value, place: partnerPlace, gender: partnerGender }),
                          );
                        }}
                        className="w-[86px] rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <select
                        value={partnerPlace}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPartnerPlace(value);
                          window.localStorage.setItem(
                            "judou.partner.v1",
                            JSON.stringify({ date: partnerDate, time: partnerTime, place: value, gender: partnerGender }),
                          );
                        }}
                        className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      >
                        <option value="">出生城市</option>
                        {PLACES.map((place) => (
                          <option key={place.name} value={place.name}>
                            {place.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={partnerGender}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPartnerGender(value);
                          window.localStorage.setItem(
                            "judou.partner.v1",
                            JSON.stringify({ date: partnerDate, time: partnerTime, place: partnerPlace, gender: value }),
                          );
                        }}
                        className="w-[76px] rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[11px] text-ink-800 outline-none"
                      >
                        <option value="">性别</option>
                        <option value="female">女</option>
                        <option value="male">男</option>
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={askAlmanac}
                disabled={askLoading}
                className="mt-3 w-full rounded-xl bg-black px-4 py-2.5 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                {askLoading ? "正在排盘…" : "问先知"}
              </button>

              {askError ? (
                <p className="mt-2 text-[10px] text-ink-500">{askError}</p>
              ) : null}

              {askResult ? (
                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border border-black/10 bg-white p-3">
                    <p className="text-[9px] font-semibold text-ink-400">
                      今日排盘
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-ink-800">
                      {askResult.answer}
                    </p>
                  </div>
                  {askResult.chart ? (
                    <div className="rounded-xl border border-black/10 bg-white p-3">
                      <p className="text-[9px] font-semibold text-ink-400">
                        命盘（民俗参考）
                      </p>
                      {askResult.chart.lines.map((line) => (
                        <p
                          key={line}
                          className="mt-1 text-[10px] leading-4 text-ink-700"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : null}
                  {askResult.synastry ? (
                    <div className="rounded-xl border border-black/10 bg-white p-3">
                      <p className="text-[9px] font-semibold text-ink-400">
                        合盘（民俗参考）
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-ink-800">
                        {askResult.synastry.relation}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-ink-600">
                        {askResult.synastry.note}
                      </p>
                    </div>
                  ) : null}
                  <div className="rounded-xl bg-cream-50 px-3 py-2.5">
                    <p className="text-[9px] font-semibold text-ink-400">
                      依据
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {askResult.basis.map((item) => (
                        <li
                          key={item}
                          className="flex gap-1.5 text-[10px] leading-4 text-ink-600"
                        >
                          <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-ink-950/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="px-1 text-[10px] leading-4 text-ink-500">
                    {askResult.caution}
                  </p>
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
                  onClick={() => setMode("ask")}
                  className="w-full rounded-xl bg-black px-3 py-3 text-[12px] font-semibold text-white"
                >
                  先知
                </button>
                <button
                  type="button"
                  onClick={() => setMode("reply")}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-[12px] font-semibold text-ink-950"
                >
                  提炼
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

      <ModelSettings
        open={settingsOpen}
        prefs={modelPrefs}
        remaining={freeLeft}
        onClose={() => setSettingsOpen(false)}
        onSave={saveModelPrefs}
      />
    </main>
  );
}
