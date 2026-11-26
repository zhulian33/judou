import { getFewShot } from "@/lib/fewshots";
import { buildGuidance } from "@/lib/guidance";
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
