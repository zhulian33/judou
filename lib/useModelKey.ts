"use client";

import { useCallback, useEffect, useState } from "react";

export const FREE_LIMIT = 5;
const STORAGE_KEY = "judou.model.v1";

export interface ModelPrefs {
  key: string;
  base: string;
  model: string;
  used: number;
}

const EMPTY: ModelPrefs = { key: "", base: "", model: "", used: 0 };

function load(): ModelPrefs {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ModelPrefs>;
    return {
      key: typeof parsed.key === "string" ? parsed.key : "",
      base: typeof parsed.base === "string" ? parsed.base : "",
      model: typeof parsed.model === "string" ? parsed.model : "",
      used: typeof parsed.used === "number" ? parsed.used : 0,
    };
  } catch {
    return EMPTY;
  }
}

function persist(prefs: ModelPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // 无痕模式写不进去就算了
  }
}

export function useModelKey() {
  const [prefs, setPrefs] = useState<ModelPrefs>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPrefs(load());
    setReady(true);
  }, []);

  const save = useCallback((patch: Partial<ModelPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      persist(next);
      return next;
    });
  }, []);

  /** 用掉一次免费额度（只在服务端用的是部署方 Key 时调用） */
  const consumeFree = useCallback(() => {
    setPrefs((current) => {
      const next = { ...current, used: current.used + 1 };
      persist(next);
      return next;
    });
  }, []);

  const remaining = Math.max(0, FREE_LIMIT - prefs.used);
  const hasOwnKey = prefs.key.trim().length > 0;
  const needsKey = ready && !hasOwnKey && remaining <= 0;

  const headers: Record<string, string> = {};
  if (hasOwnKey) {
    headers["x-judou-key"] = prefs.key.trim();
    if (prefs.base.trim()) headers["x-judou-base"] = prefs.base.trim();
    if (prefs.model.trim()) headers["x-judou-model"] = prefs.model.trim();
  }

  return { prefs, ready, save, consumeFree, remaining, hasOwnKey, needsKey, headers };
}
