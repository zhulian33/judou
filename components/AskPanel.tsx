"use client";

import { useEffect, useState } from "react";

import { ArrowUpRightIcon } from "@/components/Icons";
import type { AskResult, Scene } from "@/lib/types";

const PRESETS = [
  "今天适合约 TA 出来吗？",
  "今天适合把话说开吗？",
  "今天适合开口道歉吗？",
  "今天适合谈钱吗？",
];

const SCENE_LABEL: Record<Scene, string> = {
  flirt: "暧昧",
  work: "职场",
  family: "家庭",
  service: "客服",
  friend: "朋友",
};

export function AskPanel({ scene }: { scene: Scene }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [showBirth, setShowBirth] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("judou.birth.v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { date?: string; hour?: string };
      if (parsed.date) setBirthDate(parsed.date);
      if (parsed.hour) setBirthHour(parsed.hour);
    } catch {
      // 忽略损坏的本地数据
    }
  }, []);

  function saveBirth(date: string, hour: string) {
    setBirthDate(date);
    setBirthHour(hour);
    window.localStorage.setItem(
      "judou.birth.v1",
      JSON.stringify({ date, hour }),
    );
  }

  async function ask() {
    if (!question.trim()) {
      setError("先写一句你想问的。");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          scene,
          ...(birthDate
            ? {
                birth: {
                  date: birthDate,
                  ...(birthHour ? { hour: Number(birthHour) } : {}),
                },
              }
            : {}),
        }),
      });
      const payload = (await response.json()) as AskResult | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "没问出来。");
      }

      setResult(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "请稍后再试。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-ember-600">
            01 / 先知
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink-950">
            今天想先问点什么？
          </h2>
        </div>
        <span className="pb-0.5 text-[11px] text-ink-400">
          {SCENE_LABEL[scene]} · 按当天排盘回答
        </span>
      </div>

      <textarea
        value={question}
        onChange={(event) => {
          setQuestion(event.target.value);
          setError(null);
        }}
        rows={4}
        maxLength={300}
        placeholder="比如：今天适合约 TA 出来吗？还是先别打扰她？"
        className="mt-3.5 block min-h-[120px] w-full resize-none rounded-2xl border border-ink-950/10 bg-white px-4 py-4 text-[16px] leading-7 text-ink-950 outline-none transition-colors placeholder:text-ink-400/65 focus:border-ember-300"
      />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setQuestion(item)}
            className="rounded-full border border-ink-950/10 bg-cream-50 px-3 py-1 text-[11px] text-ink-600 hover:border-ink-950/30 hover:text-ink-950"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 py-3">
        <button
          type="button"
          onClick={() => setShowBirth((value) => !value)}
          className="flex w-full items-center justify-between text-[11px] font-medium text-ink-600"
        >
          <span>
            生日 + 时辰
            {birthDate ? ` · ${birthDate}` : "（可选，填了才排四柱）"}
          </span>
          <span className="text-[10px] text-ink-400">
            {showBirth ? "收起" : "填写"}
          </span>
        </button>
        {showBirth ? (
          <div className="mt-2.5 flex gap-2">
            <input
              type="date"
              value={birthDate}
              onChange={(event) => saveBirth(event.target.value, birthHour)}
              className="flex-1 rounded-lg border border-ink-950/10 bg-white px-2.5 py-2 text-[12px] text-ink-800 outline-none"
            />
            <select
              value={birthHour}
              onChange={(event) => saveBirth(birthDate, event.target.value)}
              className="w-[110px] rounded-lg border border-ink-950/10 bg-white px-2 py-2 text-[12px] text-ink-800 outline-none"
            >
              <option value="">时辰不详</option>
              {Array.from({ length: 24 }, (_, index) => (
                <option key={index} value={index}>
                  {`${index}:00`}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <p className="mt-1.5 text-[10px] leading-4 text-ink-400">
          排盘必须有出生年月日时；不填就只按今天的黄历回答。生辰只存在本机。
        </p>
      </div>

      <button
        type="button"
        onClick={ask}
        disabled={loading}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-4 text-[15px] font-semibold text-cream-50 shadow-[0_12px_30px_-20px_rgba(27,33,28,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ember-700 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream-100/30 border-t-cream-50" />
            正在排盘…
          </>
        ) : (
          <>
            问先知
            <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      {error ? (
        <p role="alert" className="mt-2 text-[11px] text-ink-500">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-ink-950/10 bg-white p-4">
            <p className="text-[9px] font-semibold tracking-[0.14em] text-ink-400">
              先知说
            </p>
            <p className="mt-1.5 text-[13px] leading-6 text-ink-800">
              {result.answer}
            </p>
            <p className="mt-2 text-[10px] leading-4 text-ink-400">
              {result.caution}
            </p>
          </div>

          {result.chart ? (
            <div className="rounded-2xl border border-ink-950/10 bg-cream-50 p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-[9px] font-semibold tracking-[0.14em] text-ink-400">
                  命盘 · 民俗参考
                </p>
                <span className="text-[10px] text-ink-500">
                  日主 {result.chart.dayMaster}
                  {result.chart.dayMasterElement}
                </span>
              </div>
              <p className="mt-1.5 font-serif text-[15px] tracking-[0.08em] text-ink-950">
                {result.chart.pillars}
              </p>
              <div className="mt-2 space-y-1">
                {result.chart.lines.map((line) => (
                  <p key={line} className="text-[11px] leading-5 text-ink-600">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-ink-950/10 bg-white p-4">
            <p className="text-[9px] font-semibold tracking-[0.14em] text-ink-400">
              依据
            </p>
            <ul className="mt-1.5 space-y-1">
              {result.basis.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[11px] leading-5 text-ink-600"
                >
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-950/35" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
