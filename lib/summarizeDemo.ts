import type { SummaryRequest, SummaryResult } from "@/lib/types";

const EMOTION_HINTS: Array<[RegExp, string]> = [
  [/冷|距离|疏远|客套/, "TA 在刻意拉开距离，关系温度在降"],
  [/压力|压到|有负担|喘不过气/, "TA 觉得被压到了，需要一点空间"],
  [/忙|没空|顾不上/, "TA 最近确实被自己的事占住了"],
  [/敏感|内耗|想太多/, "TA 情绪比较细，容易自己消化成消耗"],
  [/没做啥|不小心|手贱/, "你在为一件小事自责，但这件事没那么严重"],
  [/朋友|还是朋友/, "你想把关系维持在朋友这一档"],
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/[。！？!?；;\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

/** 没有模型时，用句子切分 + 关键词兜一个能看的结果。 */
export function buildSummaryDemo(req: SummaryRequest): SummaryResult {
  const text = req.text.trim();
  const sentences = splitSentences(text);
  const hints = EMOTION_HINTS.filter(([pattern]) => pattern.test(text)).map(
    ([, hint]) => hint,
  );

  const coreSource = hints[0] ?? sentences[0] ?? "这段内容信息比较散。";
  const core =
    coreSource.length > 30 ? `${coreSource.slice(0, 28)}…` : coreSource;

  const points = sentences
    .filter((item) => !/^(我|嗯|然后|就是)$/.test(item))
    .slice(0, 4)
    .map((item) => (item.length > 24 ? `${item.slice(0, 22)}…` : item));

  return {
    core,
    points: points.length > 0 ? points : ["原文比较短，直接看原话更快。"],
    meaning:
      hints.length > 0
        ? `${hints.slice(0, 2).join("；")}。这是这段里真正卡住的地方。`
        : "TA 在讲自己的感受，没有明确的诉求，更像是想被听见。",
    advice:
      "先回一句接住情绪的话，别急着解释自己；等 TA 情绪落下来，再问一句具体的。",
  };
}

