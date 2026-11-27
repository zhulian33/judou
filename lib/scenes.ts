import type { Scene, SceneOption } from "@/lib/types";

export const SCENE_OPTIONS: SceneOption[] = [
  {
    id: "flirt",
    label: "暧昧",
    eyebrow: "FLIRT",
    hint: "看分寸，也留住体面",
  },
  {
    id: "work",
    label: "职场",
    eyebrow: "WORK",
    hint: "对齐责任和交付",
  },
  {
    id: "family",
    label: "家庭",
    eyebrow: "FAMILY",
    hint: "接住关心，划清边界",
  },
  {
    id: "study",
    label: "学习",
    eyebrow: "STUDY",
    hint: "把知识和作业讲清楚",
  },
  {
    id: "friend",
    label: "朋友",
    eyebrow: "FRIEND",
    hint: "把情绪的账说开",
  },
];

export function isScene(value: unknown): value is Scene {
  return (
    typeof value === "string" &&
    SCENE_OPTIONS.some((scene) => scene.id === value)
  );
}

export function getSceneOption(scene: Scene): SceneOption {
  return SCENE_OPTIONS.find((item) => item.id === scene) ?? SCENE_OPTIONS[0];
}
