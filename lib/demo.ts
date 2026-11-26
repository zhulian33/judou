import { getFewShot } from "@/lib/fewshots";
import { buildGuidance } from "@/lib/guidance";
import { looksLikeNarration } from "@/lib/narration";
import { guessSubject } from "@/lib/subject";
import { DEMO_PATTERNS, detectDemoPattern } from "@/lib/demoPatterns";
import type {
  AnalyzeRequest,
  AnalyzeResult,
  ReplyOption,
  Scene,
} from "@/lib/types";

const SCENE_SUBTEXTS: Record<Scene, string> = {
  flirt: "不一定是拒绝，更像在把见面的节奏往后放。",
  work: "像是在催进度，也在把汇报压力往你这边递。",
  family: "重点不一定在事情本身，更多是那股还没放下的情绪。",
  service: "这套说法在客气地把问题退回给你。",
  friend: "嘴上说没事，通常就是有事。",
};

const PARTICLES = [
  "吧",
  "吗",
  "呢",
  "啊",
  "呀",
  "嘛",
  "哦",
  "嗯",
  "啦",
  "呗",
  "哈",
  "咯",
  "喔",
  "诶",
  "哟",
  "哇",
  "嘞",
  "哒",
  "～",
] as const;

function extractParticles(message: string): string[] {
  return Array.from(
    new Set(PARTICLES.filter((particle) => message.includes(particle))),
  );
}

export function buildDemoResult(req: AnalyzeRequest): AnalyzeResult {
  const example = getFewShot(req.scene);
  const base = example.result;
  const pattern = detectDemoPattern(req.message);
  const patternData = pattern === "generic" ? null : DEMO_PATTERNS[pattern];
  const replySource = patternData?.replies ?? base.replies;
  const replies: ReplyOption[] = replySource.map((reply, index) => {
    if (req.scene === "flirt") {
      return {
        ...reply,
        affectionBonus:
          reply.affectionBonus ?? base.replies[index]?.affectionBonus ?? 5,
      };
    }

    return {
      style: reply.style,
      label: reply.label,
      content: reply.content,
      whyItWorks: reply.whyItWorks,
    };
  });

  const narration = looksLikeNarration(req.message);

  if (narration) {
    const narrationGuidance = {
      read: "你在讲她最近变冷这件事，真正卡住的是：你怕是自己给了压力，又不敢问。",
      direction:
        "别再解释「我真没做啥」，也别追问她怎么了。先把频率降下来，隔几天用一件具体、不需要她回应的小事重新出现；她愿意接就接，不接就别再连发。",
      keep: ["先停下，不再追问", "只发一条，不补第二条"],
      avoid: "现在去核对「你是不是生我气了」，等于再要一次情绪回应。",
    };

    return {
      ...base,
      subtext: "你在讲她最近刻意保持距离这件事，重点是你不知道自己做错了什么。",
      emotion: "她的语气在收，你的不安在涨。",
      intent: "她大概率想先退开一点，把节奏拿回自己手里。",
      thoughts: "她可能只是被自己的事占住了，也可能真的被压到了。现在她不想解释，也不想被追问。",
      particles: extractParticles(req.message),
      analysisConfidence: "medium",
      readings: [
        { title: "被压到了", explanation: "你投入的强度超过了她现在的承接能力。", likelihood: "high" },
        { title: "她自己在低处", explanation: "敏感、内耗，遇到事会先关起来自己消化。", likelihood: "medium" },
        { title: "只是忙", explanation: "确实是外部事情占住了，不是对你降温。", likelihood: "low" },
      ],
      missingInfo: "看她会不会自己回来找你。会回来是情绪，一直不回就是真的想退。",
      nextLine: {
        content: "最近有点忙，先这样吧。",
        confidence: "medium",
        reason: "她更可能用短句把话题收住，而不是解释原因。",
      },
      affection:
        req.scene === "flirt"
          ? { score: 38, trend: "cooling", note: "热度在掉，现在唯一加分的是给空间。" }
          : undefined,
      trust:
        req.scene !== "flirt"
          ? { score: 45, trend: "cooling", note: "信任在往下走，先别追问。" }
          : undefined,
      guidance: narrationGuidance,
      subject: { who: "third", label: "你在讲这件事" },
      framing: "narration",
      replies,
    };
  }

  const merged = {
    subtext:
      patternData
        ? patternData.subtext
        : req.message.trim() === example.message
          ? base.subtext
          : SCENE_SUBTEXTS[req.scene],
    emotion: patternData?.emotion ?? base.emotion,
    intent: patternData?.intent ?? base.intent,
    risk: base.risk,
  };

  return {
    ...base,
    subtext: merged.subtext,
    emotion: merged.emotion,
    intent: merged.intent,
    thoughts: patternData?.thoughts ?? base.thoughts,
    particles: extractParticles(req.message),
    analysisConfidence: patternData
      ? patternData.readings[0].likelihood === "high"
        ? "high"
        : "medium"
      : base.analysisConfidence,
    readings: patternData?.readings ?? base.readings,
    missingInfo: patternData?.missingInfo ?? base.missingInfo,
    nextLine: patternData?.nextLine ?? base.nextLine,
    affection:
      req.scene === "flirt"
        ? patternData
          ? {
              score: patternData.score,
              trend: patternData.trend,
              note: patternData.note,
            }
          : base.affection
        : undefined,
    trust:
      req.scene !== "flirt"
        ? patternData
          ? {
              score: patternData.score,
              trend: patternData.trend,
              note: patternData.note,
            }
          : base.trust
        : undefined,
    myIntent: req.myWords
      ? {
          read: `你想说的是「${req.myWords.trim().slice(0, 42)}${req.myWords.trim().length > 42 ? "…" : ""}」。`,
          adjustment:
            "先把感受说清楚，再提一个具体期待，会比解释一堆更容易被听懂。",
        }
      : undefined,
    guidance: {
      ...buildGuidance(req.scene, merged),
      ...(patternData?.guidance ?? {}),
    },
    subject: guessSubject(req.message),
    replies,
  };
}
