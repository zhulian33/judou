import { getAlmanacData } from "@/lib/almanac";
import type { AskRequest, Scene } from "@/lib/types";

const SCENE_LABEL: Record<Scene, string> = {
  flirt: "暧昧",
  work: "职场",
  family: "家庭",
  service: "客服",
  friend: "朋友",
};

export const ASK_SYSTEM_PROMPT = `你是「句读」里的黄历顾问。
用户会问一个跟今天有关的具体问题，你要结合下面给出的「今日排盘」回答。
说话像身边那个靠谱的朋友：短句，具体，不装神弄鬼。

硬性要求：
1. 只能使用给你的排盘数据，不要自己编造八字、神煞、星象或吉时。
2. 不做确定性预测（不要说「一定会」「必然」），用「更适合」「不太建议」这种分寸。
3. 不给医疗、投资、法律结论；涉及这些只提醒找专业的人。
4. 回答落在「今天怎么做」上：能做什么、避开什么、什么时候做。
5. 只输出 JSON：{"answer": "...", "basis": ["..."], "caution": "..."}。
   answer 两到三句，最多 90 个汉字；basis 是 2-3 条你实际用到的排盘依据；caution 一句提醒。`;

export function buildAskPrompt(req: AskRequest): string {
  const almanac = getAlmanacData(req.date);
  const scene = req.scene ? `\n提问场景：${SCENE_LABEL[req.scene]}` : "";

  return `## 今日排盘（系统实时计算，只能引用这些）
日期：${almanac.date} ${almanac.weekday}
农历：${almanac.lunarDate}
日值：${almanac.dayOfficer}（${almanac.dayOfficerMeaning}）
宜：${almanac.yi.join("、")}
忌：${almanac.ji.join("、")}
生肖相冲：${almanac.chong}
方位：${almanac.sha}
今日五行：${almanac.nayin}
吉位：喜神${almanac.xiDirection}，财神${almanac.caiDirection}
今日总述：${almanac.summary}

## 用户的问题${scene}
${req.question.trim()}

请按系统要求只输出 JSON。`;
}

