"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "judou.account.v1";

export interface LocalAccount {
  nickname: string;
  createdAt: number;
}

export function useAccount() {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocalAccount;
        if (parsed.nickname) {
          setAccount(parsed);
        }
      }
    } catch {
      // Ignore malformed local data.
    } finally {
      setHydrated(true);
    }
  }, []);

  function register(nickname: string) {
    const next = {
      nickname: nickname.trim() || "体验用户",
      createdAt: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAccount(next);
  }

  return { account, hydrated, register };
}
