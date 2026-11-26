import type { GuidanceInsight, Scene } from "@/lib/types";

const SCENE_HINT: Record<Scene, { move: string; keep: string[] }> = {
  flirt: {
    move: "给彼此留点余地，别把话说死，也别一次把情绪全倒出来。",
    keep: ["先接住情绪，再表达自己", "让 TA 有台阶，也让自己有退路"],
  },
  work: {
    move: "先把结论和时间点说清楚，再解释原因，别在语气上纠缠。",
    keep: ["先给结论再解释", "把该谁做、什么时候做完说清楚"],
  },
  family: {
    move: "先接情绪，等对方缓下来再谈这一件事，别翻旧账。",
    keep: ["先接情绪，后谈事情", "只说这一件事"],
  },
  service: {
    move: "先把能不能办、多久办完说清楚，别过度承诺。",
    keep: ["先给可执行的答复", "做不到的部分要提前说"],
  },
  friend: {
    move: "把感受直接说出来，别绕，也别让对方猜。",
    keep: ["说感受，不判断人", "一次只聊一件事"],
  },
};

export interface GuidanceSource {
  subtext: string;
  emotion: string;
  intent: string;
  risk: string;
}

/** 没有模型 guidance 时，用分析结果 + 场景提示拼一段方向。 */
export function buildGuidance(
  scene: Scene,
  source: GuidanceSource,
): GuidanceInsight {
  const hint = SCENE_HINT[scene] ?? SCENE_HINT.friend;
  const direction = source.intent
    ? `TA 这次的落点是：${source.intent} 顺着这一点回应就够了，不用把别的话题一起翻出来。${hint.move}`
    : hint.move;

  return {
    read: `${source.subtext}${source.emotion ? `（${source.emotion}）` : ""}`,
    direction,
    keep: hint.keep,
    avoid: source.risk,
  };
}
