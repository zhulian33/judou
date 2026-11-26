"use client";

import { useEffect, useRef, useState } from "react";

import { BrandMark, SparkIcon } from "@/components/Icons";
import { ContactManager } from "@/components/ContactManager";
import { MessageInput } from "@/components/MessageInput";
import { OpenerResultCard } from "@/components/OpenerResultCard";
import { ReadingDetails } from "@/components/ReadingDetails";
import { GuidanceCard } from "@/components/GuidanceCard";
import { ResultCard } from "@/components/ResultCard";
import { SceneSelector } from "@/components/SceneSelector";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import type { ContactDraft } from "@/lib/contacts";
import {
  appendMemory,
  formatMemory,
  getContactMemory,
  type MemoryEntry,
} from "@/lib/memory";
import { useContacts } from "@/lib/useContacts";
import type {
  AnalyzeResult,
  ApiErrorBody,
  ExampleMessage,
  Gender,
  OpenerResult,
  Scene,
} from "@/lib/types";

function isApiError(
  payload: AnalyzeResult | ApiErrorBody,
): payload is ApiErrorBody {
  return "error" in payload;
}

export default function Home() {
  const [mode, setMode] = useState<"reply" | "opener">("reply");
  const [scene, setScene] = useState<Scene>("flirt");
  const [message, setMessage] = useState("");
  const [myWords, setMyWords] = useState("");
  const [context, setContext] = useState("");
  const [gender, setGender] = useState<Gender>("unknown");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [openerResult, setOpenerResult] = useState<OpenerResult | null>(null);
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelSource, setModelSource] = useState<
    "configured" | "public" | "local" | null
  >(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const appliedContactIdRef = useRef<string | null>(null);
  const bondScore = result?.affection?.score ?? result?.trust?.score ?? 0;
  const tintOpacity = 0.02 + (bondScore / 100) * 0.28;
  const {
    contacts,
    activeId,
    activeContact,
    hydrated,
    addContact,
    updateContact,
    removeContact,
    selectContact,
  } = useContacts();

  function handleModeChange(nextMode: "reply" | "opener") {
    setMode(nextMode);
    setMessage("");
    setMyWords("");
    setResult(null);
    setOpenerResult(null);
    setError(null);
  }

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!activeContact) {
      appliedContactIdRef.current = null;
      return;
    }

    if (appliedContactIdRef.current === activeContact.id) {
      return;
    }

    appliedContactIdRef.current = activeContact.id;
    setScene(activeContact.scene);
    setGender(activeContact.gender);
    setContext(activeContact.notes);
    setResult(null);
    setOpenerResult(null);
    setError(null);
  }, [activeContact, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    setMemoryEntries(activeId ? getContactMemory(activeId) : []);
  }, [activeId, hydrated]);

  function remember(kind: "reply" | "opener", summary: string) {
    if (!activeId) {
      return;
    }
    setMemoryEntries(
      appendMemory({
        contactId: activeId,
        kind,
        summary,
        createdAt: Date.now(),
      }),
    );
  }

  function syncActiveContact(patch: Partial<ContactDraft>) {
    if (activeId) {
      updateContact(activeId, patch);
    }
  }

  function handleSceneChange(nextScene: Scene) {
    setScene(nextScene);
    setError(null);
    setResult(null);
    syncActiveContact({ scene: nextScene });
  }

  function handleMessageChange(value: string) {
    setMessage(value);
    setError(null);
    setResult(null);
  }

  function handleMyWordsChange(value: string) {
    setMyWords(value);
    setError(null);
    setResult(null);
  }

  function handleContextChange(value: string) {
    setContext(value);
    setError(null);
  }

  function handleGenderChange(value: Gender) {
    setGender(value);
    setError(null);
    syncActiveContact({ gender: value });
  }

  function applyContactDraft(draft: ContactDraft) {
    setScene(draft.scene);
    setGender(draft.gender);
    setContext(draft.notes);
    setResult(null);
    setOpenerResult(null);
    setError(null);
  }

  function handleSelectContact(id: string | null) {
    appliedContactIdRef.current = null;
    selectContact(id);

    if (id === null) {
      setScene("flirt");
      setGender("unknown");
      setContext("");
      setResult(null);
      setOpenerResult(null);
      setError(null);
      return;
    }

    const contact = contacts.find((item) => item.id === id);
    if (contact) {
      appliedContactIdRef.current = id;
      applyContactDraft(contact);
    }
  }

  function handleSaveContact(draft: ContactDraft, existingId?: string) {
    if (existingId) {
      updateContact(existingId, draft);
      appliedContactIdRef.current = existingId;
      applyContactDraft(draft);
      return;
    }

    const contact = addContact(draft);
    appliedContactIdRef.current = contact.id;
    applyContactDraft(draft);
  }

  function handleDeleteContact(id: string) {
    removeContact(id);
    appliedContactIdRef.current = null;
    setScene("flirt");
    setGender("unknown");
    setContext("");
    setResult(null);
    setOpenerResult(null);
  }

  function handlePickExample(example: ExampleMessage) {
    setScene(example.scene);
    setMessage(example.message);
    setMyWords("");
    setContext(example.context ?? "");
    setResult(null);
    setOpenerResult(null);
    setError(null);

    window.setTimeout(() => {
      document
        .getElementById("composer")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function handleAnalyze() {
    if (!message.trim()) {
      setError(
        mode === "opener"
          ? "先说说你为什么想找对方。"
          : "先把那条让你卡住的消息贴进来。",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setOpenerResult(null);
    setModelSource(null);

    try {
      if (mode === "opener") {
        const response = await fetch("/api/opener", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: message,
            scene,
            context: context.trim() || undefined,
            memory: memoryEntries.length
              ? formatMemory(memoryEntries)
              : undefined,
            gender,
            contactName: activeContact?.name.trim() || undefined,
          }),
        });
        const payload = (await response.json()) as
          | OpenerResult
          | ApiErrorBody;

        if (!response.ok || "error" in payload) {
          throw new Error(
            "error" in payload ? payload.error : "这次没有想出开场。",
          );
        }

        setOpenerResult(payload);
        remember(
          "opener",
          `想开口：${message.slice(0, 42)}；建议：${payload.options[0]?.content.slice(0, 42) ?? ""}`,
        );
        const source = response.headers.get("X-Judou-Source");
        setModelSource(
          source === "configured" || source === "public" || source === "local"
            ? source
            : null,
        );
      } else {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            scene,
            myWords: myWords.trim() || undefined,
            context: context.trim() || undefined,
            memory: memoryEntries.length
              ? formatMemory(memoryEntries)
              : undefined,
            gender,
            contactName: activeContact?.name.trim() || undefined,
          }),
        });

        const payload = (await response.json()) as
          | AnalyzeResult
          | ApiErrorBody;

        if (!response.ok || isApiError(payload)) {
          throw new Error(
            isApiError(payload)
              ? payload.error
              : "这次没有读出结果，请再试一次。",
          );
        }

        setResult(payload);
        remember(
          "reply",
          `对方说：${message.slice(0, 42)}；读回：${payload.subtext.slice(0, 42)}`,
        );
        const source = response.headers.get("X-Judou-Source");
        setModelSource(
          source === "configured" || source === "public" || source === "local"
            ? source
            : null,
        );
      }

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "服务开小差了，请稍后再试。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
        style={{
          opacity: tintOpacity,
          background:
            "radial-gradient(circle at 18% 2%, rgb(var(--tint-rgb) / 0.72), transparent 42%), radial-gradient(circle at 92% 42%, rgb(var(--tint-rgb) / 0.5), transparent 38%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pb-4 pt-5 sm:px-7 sm:pt-7">
        <a href="#" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-950 text-cream-50 shadow-soft transition-transform duration-300 group-hover:-rotate-6">
            <BrandMark className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-[17px] font-semibold tracking-[0.08em] text-ink-950">
              句读
            </span>
            <span className="block text-[8px] font-semibold tracking-[0.2em] text-ink-400">
              JUDOU
            </span>
          </span>
        </a>

        <a
          href="/widget"
          className="rounded-full border border-ink-950/12 bg-white/80 px-3.5 py-1.5 text-[11px] font-medium text-ink-600 transition-colors hover:border-ink-950/30 hover:text-ink-950"
        >
          返回黄历
        </a>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-7">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="relative px-0 pb-2 pt-9 text-center lg:col-start-1 lg:row-start-1 lg:px-2 lg:pb-8 lg:pt-12 lg:text-left">
          <h1 className="text-balance mx-auto mt-2 max-w-[620px] font-serif text-[34px] font-semibold leading-[1.25] tracking-[-0.035em] text-ink-950 min-[370px]:text-[38px] sm:text-[52px] sm:leading-[1.2] lg:mx-0 lg:text-[58px]">
            {mode === "opener" ? (
              <>
                想找对方，
                <br />
                又不知道怎么开口？
              </>
            ) : (
              <>
                不知道回什么，
                <br />
                就先放进来。
              </>
            )}
          </h1>
        </section>

        <section
          id="composer"
          className="mt-8 scroll-mt-6 rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card sm:mt-10 sm:p-7 lg:sticky lg:top-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto"
        >
          <div className="mb-5 flex items-center justify-between border-b border-ink-950/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ember-50 text-ember-600">
                <SparkIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-ink-400">
                  句读工作台
                </p>
                <p className="mt-0.5 text-[11px] text-ink-600/75">
                  {mode === "opener" ? "先找理由，再想开口" : "先拆意思，再想回法"}
                </p>
              </div>
            </div>
            <span className="hidden text-[9px] font-medium text-ink-400 sm:block">
              场景和背景都可以不填
            </span>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-cream-100 p-1">
            {[
              { value: "reply" as const, label: "回消息" },
              { value: "opener" as const, label: "主动开口" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleModeChange(item.value)}
                className={`rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                  mode === item.value
                    ? "bg-white text-ink-950 shadow-soft"
                    : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <ContactManager
            contacts={contacts}
            activeId={activeId}
            activeContact={activeContact}
            hydrated={hydrated}
            memoryCount={memoryEntries.length}
            defaults={{
              name: "",
              gender: "unknown",
              scene,
              notes: "",
            }}
            onSelect={handleSelectContact}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
          />

          <SceneSelector value={scene} onChange={handleSceneChange} />

          <div className="my-5 h-px bg-gradient-to-r from-transparent via-ink-950/10 to-transparent" />

          <MessageInput
            key={`${activeId ?? "temporary"}-${mode}`}
            mode={mode}
            message={message}
            myWords={myWords}
            context={context}
            gender={gender}
            loading={loading}
            error={error}
            onMessageChange={handleMessageChange}
            onMyWordsChange={handleMyWordsChange}
            onContextChange={handleContextChange}
            onGenderChange={handleGenderChange}
            onAnalyze={handleAnalyze}
            onPickExample={handlePickExample}
          />
        </section>

        <div className="lg:col-start-1 lg:row-start-2">
        {loading ? (
          <div
            role="status"
            className="animate-fade-up mx-auto mt-7 flex max-w-md items-center gap-4 rounded-2xl border border-ink-950/10 bg-white px-5 py-4 shadow-soft"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-50">
              <span className="absolute inset-0 animate-ping rounded-full bg-ember-300/20" />
              <BrandMark className="relative h-5 w-5 animate-soft-pulse text-ember-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-800">
                {mode === "opener" ? "正在想一个不尴尬的开场" : "正在拆这句话"}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-400">
                {mode === "opener"
                  ? "先想清楚来意，再把话说自然"
                  : "先看内心 OS，再猜下一句"}
              </p>
            </div>
          </div>
        ) : null}

        <div
          ref={resultRef}
          className="scroll-mt-5 space-y-9 pt-9 empty:hidden sm:space-y-11 lg:pt-0"
        >
          {openerResult ? (
            <OpenerResultCard result={openerResult} />
          ) : result ? (
            <>
              <ThoughtBubble result={result} />
              <GuidanceCard result={result} />
              <ResultCard
                result={result}
                scene={scene}
                source={modelSource}
                contactName={
                  activeContact
                    ? activeContact.name.trim() || "对象"
                    : undefined
                }
                hasMyWords={Boolean(myWords.trim())}
              />
              <ReadingDetails result={result} />
            </>
          ) : null}
        </div>

        </div>
        </div>
      </main>
    </div>
  );
}
