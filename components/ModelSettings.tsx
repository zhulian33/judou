"use client";

import { useState } from "react";

import { FREE_LIMIT, type ModelPrefs } from "@/lib/useModelKey";

interface ModelSettingsProps {
  open: boolean;
  prefs: ModelPrefs;
  remaining: number;
  onClose: () => void;
  onSave: (patch: Partial<ModelPrefs>) => void;
}

export function ModelSettings({
  open,
  prefs,
  remaining,
  onClose,
  onSave,
}: ModelSettingsProps) {
  const [key, setKey] = useState(prefs.key);
  const [base, setBase] = useState(prefs.base);
  const [model, setModel] = useState(prefs.model);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-settings-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-ink-950/10 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="model-settings-title"
              className="text-[15px] font-semibold text-ink-950"
            >
              模型设置
            </h2>
            <p className="mt-1 text-[11px] leading-4 text-ink-500">
              免费额度 {FREE_LIMIT} 次，已用 {FREE_LIMIT - remaining} 次，
              还剩 {remaining} 次。用完后填自己的 Key 继续。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 whitespace-nowrap rounded-full border border-ink-950/10 px-3 py-1 text-[11px] text-ink-500 hover:text-ink-950"
          >
            关闭
          </button>
        </div>

        <label className="mt-4 block text-[11px] font-medium text-ink-600">
          API Key
          <input
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="sk-..."
            autoComplete="off"
            className="mt-1 block w-full rounded-lg border border-ink-950/12 bg-white px-3 py-2 text-[13px] text-ink-900 outline-none focus:border-ember-300"
          />
        </label>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block text-[11px] font-medium text-ink-600">
            Base URL（可选）
            <input
              value={base}
              onChange={(event) => setBase(event.target.value)}
              placeholder="https://api.openai.com/v1"
              className="mt-1 block w-full rounded-lg border border-ink-950/12 bg-white px-3 py-2 text-[12px] text-ink-900 outline-none focus:border-ember-300"
            />
          </label>
          <label className="block text-[11px] font-medium text-ink-600">
            模型（可选）
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="gpt-4o-mini"
              className="mt-1 block w-full rounded-lg border border-ink-950/12 bg-white px-3 py-2 text-[12px] text-ink-900 outline-none focus:border-ember-300"
            />
          </label>
        </div>

        <p className="mt-3 rounded-xl bg-cream-50 px-3 py-2 text-[10px] leading-4 text-ink-500">
          Key 只存在你这台设备的浏览器里，请求时随请求头发给服务端，服务端用完即弃，不落盘、不写日志。
          公共电脑上用完记得点「清除」。
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onSave({ key: key.trim(), base: base.trim(), model: model.trim() });
              onClose();
            }}
            className="flex-1 rounded-xl bg-ink-950 px-4 py-2.5 text-[13px] font-semibold text-cream-50"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => {
              setKey("");
              setBase("");
              setModel("");
              onSave({ key: "", base: "", model: "" });
            }}
            className="rounded-xl border border-ink-950/12 px-4 py-2.5 text-[13px] text-ink-600"
          >
            清除
          </button>
        </div>
      </div>
    </div>
  );
}
