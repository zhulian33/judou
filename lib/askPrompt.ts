import { getAlmanacData } from "@/lib/almanac";
import { buildChart, buildSynastry } from "@/lib/chart";
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
0. 先分清问题类型：
   - 如果问的是「别人的心思 / 隐私 / 事实」（她有没有喜欢的人、她还爱不爱我、她会不会回来、她是不是有别人、她怎么想我）——排盘看不出来。第一句必须直接说「这个排盘看不出」，不要编，然后把话拉回「今天你适不适合做什么、怎么说」。
   - 如果问的是「今天适不适合做某件事」，就正常结合排盘给节奏建议。
   - 如果提供了合盘、问题又是关于你们俩（合不合、怎么相处、谁更累），**不要**说「看不出」。用合盘给的关系说明相处方式：谁更容易累、该怎么调整节奏。仍然不要预测「能不能在一起」「她会不会喜欢你」。
1. 只能使用给你的排盘数据，不要自己编造八字、神煞、星象或吉时。
2. 不做确定性预测（不要说「一定会」「必然」），用「更适合」「不太建议」这种分寸。
3. 不给医疗、投资、法律结论；涉及这些只提醒找专业的人。
4. 回答落在「今天怎么做」上：能做什么、避开什么、什么时候做。
5. 宜忌要翻译成人话：不要直接说「今天宜结婚」或者「挑结婚这类事做」，也不要拿「破土/安葬」去吓人。把宜理解成「适合推进、适合沟通、适合出门」，把忌理解成「别急着定、别硬推」。
5. 只输出 JSON：{"answer": "...", "basis": ["..."], "caution": "..."}。
   answer 两到三句，最多 90 个汉字；basis 是 2-3 条你实际用到的排盘依据；caution 一句提醒。`;

export function buildAskPrompt(req: AskRequest): string {
  const almanac = getAlmanacData(req.date);
  const scene = req.scene ? `\n提问场景：${SCENE_LABEL[req.scene]}` : "";
  const chart = req.birth ? buildChart(req.birth) : null;
  const partnerChart = req.partnerBirth ? buildChart(req.partnerBirth) : null;
  const synastry =
    chart && partnerChart ? buildSynastry(chart, partnerChart) : null;
  const partnerBlock = synastry
    ? `\n\n## 合盘（两个人，只讲相处方式）\n${synastry.relation}\n${synastry.note}\n${synastry.selfLine}\n${synastry.partnerLine}\n回答涉及两人时，只能引用这个关系，不要预测「能不能在一起」。`
    : "";
  const chartBlock = chart
    ? `\n\n## 用户命盘（本机按真太阳时排，仅作民俗参考）\n${chart.summaryLine}\n日主为 ${chart.dayMaster}${chart.dayMasterElement}。\n可以说「按传统说法，${chart.dayMaster}日主的人更吃哪一套沟通方式」，可以提到五行偏旺偏弱对应的做事节奏；不要断言性格、健康或命运，也不要预测具体事件。`
    : "";

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
今日总述：${almanac.summary}${chartBlock}${partnerBlock}

## 用户的问题${scene}
${req.question.trim()}

请按系统要求只输出 JSON。`;
}

