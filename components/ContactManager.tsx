"use client";

import { useEffect, useState } from "react";

import { SceneIcon } from "@/components/Icons";
import { getContactLabel, type Contact, type ContactDraft } from "@/lib/contacts";
import { SCENE_OPTIONS } from "@/lib/scenes";
import type { Gender } from "@/lib/types";

interface ContactManagerProps {
  contacts: Contact[];
  activeId: string | null;
  activeContact: Contact | null;
  hydrated: boolean;
  memoryCount?: number;
  defaults: ContactDraft;
  onSelect: (id: string | null) => void;
  onSave: (draft: ContactDraft, existingId?: string) => void;
  onDelete: (id: string) => void;
}

const GENDER_OPTIONS: Array<{ value: Gender; label: string }> = [
  { value: "unknown", label: "不填" },
  { value: "female", label: "女性" },
  { value: "male", label: "男性" },
];

export function ContactManager({
  contacts,
  activeId,
  activeContact,
  hydrated,
  memoryCount = 0,
  defaults,
  onSelect,
  onSave,
  onDelete,
}: ContactManagerProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<ContactDraft>(defaults);

  useEffect(() => {
    if (!editorOpen) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [editorOpen]);

  function openNew() {
    setEditingId(undefined);
    setDraft({ ...defaults });
    setEditorOpen(true);
  }

  function openEdit() {
    if (!activeContact) {
      return;
    }
    setEditingId(activeContact.id);
    setDraft({
      name: activeContact.name,
      gender: activeContact.gender,
      scene: activeContact.scene,
      notes: activeContact.notes,
    });
    setEditorOpen(true);
  }

  function saveDraft() {
    onSave(draft, editingId);
    setEditorOpen(false);
  }

  return (
    <section aria-labelledby="contact-title" className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            id="contact-title"
            className="text-[10px] font-semibold tracking-[0.16em] text-ink-400"
          >
            对话对象
          </span>
          <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[8px] font-medium text-ink-400">
            本机保存
          </span>
        </div>
        <div className="flex items-center gap-1">
          {activeContact ? (
            <button
              type="button"
              onClick={openEdit}
              className="rounded-full px-2 py-1 text-[10px] font-medium text-ember-600 transition-colors hover:bg-ember-50"
            >
              编辑
            </button>
          ) : null}
          <button
            type="button"
            onClick={openNew}
            className="rounded-full border border-ink-950/10 bg-white px-2.5 py-1 text-[10px] font-medium text-ink-600 transition-colors hover:border-ember-300 hover:text-ember-700"
          >
            + 新建对象
          </button>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={activeId === null}
          className={[
            "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
            activeId === null
              ? "border-ink-950 bg-ink-950 text-cream-50"
              : "border-ink-950/10 bg-white text-ink-600 hover:border-ember-300",
          ].join(" ")}
        >
          临时对话
        </button>
        {contacts.map((contact) => {
          const active = contact.id === activeId;
          return (
            <button
              key={contact.id}
              type="button"
              onClick={() => onSelect(contact.id)}
              aria-pressed={active}
              className={[
                "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-ember-500 bg-ember-50 text-ember-700"
                  : "border-ink-950/10 bg-white text-ink-600 hover:border-ember-300",
              ].join(" ")}
            >
              <SceneIcon
                scene={contact.scene}
                className={[
                  "h-3.5 w-3.5",
                  active ? "text-ember-600" : "text-ink-400",
                ].join(" ")}
              />
              {getContactLabel(contact)}
            </button>
          );
        })}
        {!hydrated ? (
          <span className="shrink-0 px-2 py-1.5 text-[10px] text-ink-400">
            读取中…
          </span>
        ) : null}
      </div>

      {activeContact ? (
        <p className="mt-0.5 text-[9px] leading-4 text-ink-400">
          已带上{activeContact.name ? `「${activeContact.name}」` : "这个对象"}
          的性别、场景和备注，后续可直接切换。
          {memoryCount > 0 ? ` 已有 ${memoryCount} 条历史记忆。` : ""}
        </p>
      ) : null}

      {editorOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/25 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-editor-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditorOpen(false);
            }
          }}
        >
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl border border-ink-950/10 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-ember-600">
                  对象资料
                </p>
                <h2
                  id="contact-editor-title"
                  className="mt-1 text-xl font-semibold text-ink-950"
                >
                  {editingId ? "编辑对象" : "新建对象"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-full px-2 py-1 text-[11px] text-ink-400 hover:bg-cream-100"
              >
                取消
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium text-ink-600">
                  对象名称
                </span>
                <input
                  autoFocus
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  maxLength={40}
                  placeholder="例如：小林 / 周经理 / 妈妈"
                  className="h-11 w-full rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 text-[16px] text-ink-800 outline-none focus:border-ember-300 focus:bg-white"
                />
              </label>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-ink-600">
                  关系场景
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {SCENE_OPTIONS.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          scene: scene.id,
                        }))
                      }
                      className={[
                        "rounded-lg border px-1 py-2 text-[11px] font-medium transition-colors",
                        draft.scene === scene.id
                          ? "border-ember-500 bg-ember-50 text-ember-700"
                          : "border-ink-950/10 text-ink-500 hover:border-ember-300",
                      ].join(" ")}
                    >
                      {scene.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium text-ink-600">
                  对方性别
                </p>
                <div className="flex gap-1.5">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          gender: option.value,
                        }))
                      }
                      className={[
                        "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                        draft.gender === option.value
                          ? "border-ember-500 bg-ember-50 text-ember-700"
                          : "border-ink-950/10 text-ink-500 hover:border-ember-300",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[9px] text-ink-400">
                  不确定就不填，句读会全程使用「对方 / TA」，不会猜性别。
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium text-ink-600">
                  备注
                </span>
                <textarea
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="例如：认识两周 / 最近在忙项目 / 不喜欢被催"
                  className="block w-full resize-none rounded-xl border border-ink-950/10 bg-cream-50 px-3.5 py-3 text-[16px] leading-6 text-ink-800 outline-none focus:border-ember-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(editingId);
                    setEditorOpen(false);
                  }}
                  className="rounded-xl px-3 py-2.5 text-[11px] font-medium text-gold-700 hover:bg-gold-300/10"
                >
                  删除
                </button>
              ) : null}
              <button
                type="button"
                onClick={saveDraft}
                className="ml-auto flex-1 rounded-xl bg-ink-950 px-4 py-3 text-sm font-semibold text-cream-50 hover:bg-ember-700 sm:flex-none sm:px-7"
              >
                保存对象
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
