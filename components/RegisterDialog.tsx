"use client";

import { useEffect, useState } from "react";

interface RegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onRegister: (nickname: string) => void;
}

export function RegisterDialog({
  open,
  onClose,
  onRegister,
}: RegisterDialogProps) {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-ink-950/10 bg-white p-5 shadow-2xl">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-ink-400">
          注册
        </p>
        <h2
          id="register-title"
          className="mt-1 text-xl font-semibold text-ink-950"
        >
          注册后解锁电子黄历
        </h2>
        <p className="mt-2 text-[12px] leading-5 text-ink-500">
          这是本机体验注册，不接服务器。正式账号体系可在这里替换成真实注册接口。
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-600">
            昵称
          </span>
          <input
            autoFocus
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={20}
            placeholder="怎么称呼你"
            className="h-11 w-full rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 text-[16px] text-ink-800 outline-none focus:border-ink-950/30 focus:bg-white"
          />
        </label>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[12px] text-ink-500 hover:bg-cream-100"
          >
            先不注册
          </button>
          <button
            type="button"
            onClick={() => {
              onRegister(nickname);
              onClose();
            }}
            className="rounded-xl bg-ink-950 px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-black"
          >
            完成注册
          </button>
        </div>
      </div>
    </div>
  );
}
