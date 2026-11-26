import type { SubjectInsight } from "@/lib/types";

export const SUBJECT_LABEL: Record<SubjectInsight["who"], string> = {
  me: "TA 在说你",
  self: "TA 在说 TA 自己",
  third: "TA 在说别人",
};

/** 模型没给 subject 时，按关键词粗判这句话在说谁。 */
export function guessSubject(message: string): SubjectInsight {
  const who: SubjectInsight["who"] =
    /我(?:的)?(?:朋友|同事|闺蜜|兄弟|姐妹|室友|同学|对象|前任|表姐|表哥|家人)|我(?:妈|爸|哥|姐|弟|妹)/.test(
      message,
    )
      ? "third"
      : /你|咱|我们/.test(message)
        ? "me"
        : "self";

  return { who, label: SUBJECT_LABEL[who] };
}
