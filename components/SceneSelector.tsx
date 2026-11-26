"use client";

import { SceneIcon } from "@/components/Icons";
import { getSceneOption, SCENE_OPTIONS } from "@/lib/scenes";
import type { Scene } from "@/lib/types";

interface SceneSelectorProps {
  value: Scene;
  onChange: (scene: Scene) => void;
}

export function SceneSelector({ value, onChange }: SceneSelectorProps) {
  const current = getSceneOption(value);

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-ember-600">
            01 / 选择语境
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink-950">
            这句话，发生在哪里？
          </h2>
        </div>
        <p className="pb-0.5 text-right text-[11px] leading-4 text-ink-400">
          {current.hint}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="聊天场景"
        className="no-scrollbar -mx-1 mt-3.5 flex gap-1.5 overflow-x-auto px-1 pb-1"
      >
        {SCENE_OPTIONS.map((scene) => {
          const selected = scene.id === value;

          return (
            <button
              key={scene.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(scene.id)}
              className={[
                "group flex min-w-[58px] flex-1 flex-col items-center rounded-xl border px-1.5 py-2.5 transition-all duration-200",
                selected
                  ? "border-ember-500 bg-ember-500 text-white shadow-soft"
                  : "border-ink-950/10 bg-white text-ink-600 hover:-translate-y-0.5 hover:border-ember-300",
              ].join(" ")}
            >
              <SceneIcon
                scene={scene.id}
                className={[
                  "h-[18px] w-[18px]",
                  selected ? "text-white" : "text-ember-600",
                ].join(" ")}
              />
              <span className="mt-1.5 text-[13px] font-semibold">
                {scene.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
