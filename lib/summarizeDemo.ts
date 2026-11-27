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

  const subject = /朋友|同事|领导|家人|室友|同学/.test(text)
    ? "在说别人"
    : /你|咱|我们/.test(text)
      ? "在说你自己"
      : "在说 TA 自己";

  const cooling = /冷|距离|疏远/.test(text);
  const pressured = /压力|压到|有负担/.test(text);

  return {
    subject,
    core,
    points: points.length > 0 ? points : ["原文比较短，直接看原话更快。"],
    meaning:
      hints.length > 0
        ? `${hints.slice(0, 2).join("；")}。这是这段里真正卡住的地方。`
        : "TA 在讲自己的感受，没有明确的诉求，更像是想被听见。",
    temperature: cooling
      ? "像是在往后退，但不是翻脸——更像是接不住现在的强度。"
      : "情绪还在，但没到摊牌的程度。",
    advice: pressured
      ? "先把强度降下来：少解释、别追问，用一件具体的小事重新出现。"
      : "先接住情绪，别急着讲道理；等对方缓下来再谈具体的事。",
    moves: pressured
      ? ["隔两天发一条不需要回应的小事", "只发一条，不补第二条", "把「你怎么了」换成「我在」"]
      : ["先回一句接住情绪的短句", "把想说的压成三句以内", "留一个不用马上回答的问题"],
    avoid: "现在去核对「你是不是生我气了」，等于再要一次情绪回应。",
    missing: "还不确定 TA 是嫌烦、在忙，还是被别的事影响——需要看 TA 接下来会不会主动。",
  };
}

