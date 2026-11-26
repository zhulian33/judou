"use client";

import { ShieldIcon, SparkIcon } from "@/components/Icons";
import { getSceneOption } from "@/lib/scenes";
import type { AnalyzeResult, Confidence, Scene } from "@/lib/types";

interface ResultCardProps {
  result: AnalyzeResult;
  scene: Scene;
  source: "configured" | "public" | "local" | null;
  contactName?: string;
  hasMyWords: boolean;
}

const ANALYSIS_CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "判断较稳",
  medium: "把握一般",
  low: "信息偏少",
};

const TREND_LABELS = {
  warming: "在升温",
  steady: "还算稳",
  cooling: "有点降温",
} as const;

export function ResultCard({
  result,
  scene,
  source,
  contactName,
  hasMyWords,
}: ResultCardProps) {
  const sceneOption = getSceneOption(scene);
  const bond = result.affection ?? result.trust;

  const usedContext = [
    "对方原话",
    ...(hasMyWords ? ["你的想法"] : []),
    ...(contactName ? [`${contactName}资料`] : []),
  ];

  return (
    <section className="animate-fade-up" aria-labelledby="result-title">
      <div className="mb-3 flex flex-col gap-2.5 px-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-ember-600">
            05 / 补充分析
          </p>
          <h2
            id="result-title"
            className="mt-1 text-2xl font-semibold text-ink-950"
          >
            再拆细一点
          </h2>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {source === "local" ? (
            <span className="whitespace-nowrap rounded-full border border-gold-500/25 bg-gold-300/10 px-2.5 py-1 text-[9px] font-semibold tracking-[0.1em] text-gold-700">
              本地解析
            </span>
          ) : null}
          <span className="whitespace-nowrap rounded-full border border-ink-950/10 bg-white px-2.5 py-1 text-[9px] font-semibold tracking-[0.1em] text-ink-400">
            {sceneOption.label}语境
          </span>
          <span className="whitespace-nowrap rounded-full border border-ink-950/10 bg-white px-2.5 py-1 text-[9px] font-semibold tracking-[0.1em] text-ink-400">
            {ANALYSIS_CONFIDENCE_LABELS[result.analysisConfidence]}
          </span>
        </div>
      </div>

      <p className="mb-2 px-1 text-[9px] leading-4 text-ink-400">
        这次结合了：{usedContext.join(" · ")}
      </p>

      <div className="overflow-hidden rounded-2xl border border-ink-950/10 bg-white shadow-card">
        <div className="border-l-[3px] border-ember-500 bg-ember-50/70 px-5 py-6 sm:px-6 sm:py-7">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-ember-600">
            话里可能的意思
          </p>
          <p className="mt-3 font-serif text-[24px] font-semibold leading-[1.5] text-ink-950 sm:text-[28px]">
            {result.subtext}
          </p>
        </div>

        <div className="grid gap-px bg-ink-950/10 sm:grid-cols-2">
          <div className="bg-white px-5 py-4 sm:px-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-400">
              语气
            </p>
            <p className="mt-1.5 text-[13px] font-medium leading-6 text-ink-800">
              {result.emotion}
            </p>
          </div>
          <div className="bg-white px-5 py-4 sm:px-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-400">
              最可能在要什么
            </p>
            <p className="mt-1.5 text-[13px] font-medium leading-6 text-ink-800">
              {result.intent}
            </p>
          </div>
        </div>

        {result.myIntent ? (
          <div className="border-t border-ink-950/10 bg-ember-50/50 px-5 py-4 sm:px-6">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-ember-600">
              你大概想表达
            </p>
            <p className="mt-1.5 text-[13px] leading-6 text-ink-800">
              {result.myIntent.read}
            </p>
            <p className="mt-2 text-[11px] leading-5 text-ink-500">
              可以留意：{result.myIntent.adjustment}
            </p>
          </div>
        ) : null}

        {bond ? (
          <div className="border-t border-ink-950/10 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SparkIcon className="h-4 w-4 text-gold-500" />
                <p className="text-[10px] font-semibold tracking-[0.14em] text-ink-400">
                  {result.affection ? "好感度" : "信任度"}
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-ink-950">
                  {bond.score}
                </span>
                <span className="text-[10px] text-ink-400">/ 100</span>
                <span className="text-[10px] font-medium text-gold-700">
                  {TREND_LABELS[bond.trend]}
                </span>
              </div>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-950/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-300 to-ember-500"
                style={{ width: `${bond.score}%` }}
              />
            </div>
            <p className="mt-2.5 text-[12px] leading-5 text-ink-600">
              {bond.note}
            </p>
          </div>
        ) : null}

        <div className="border-t border-ink-950/10 px-5 py-5 sm:px-6">
          <div className="flex gap-3 rounded-xl border border-gold-500/20 bg-gold-300/10 px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-300/25 text-gold-700">
              <ShieldIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.12em] text-gold-700">
                先别踩这个坑
              </p>
              <p className="mt-1 text-[12px] leading-5 text-ink-800">
                {result.risk}
              </p>
            </div>
          </div>
          {source === "local" ? (
            <p className="mt-3 text-[10px] leading-5 text-ink-400">
              现在用的是本地规则解析，结果会比较有限。模型接口恢复后会自动切换。
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
