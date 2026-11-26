import lunar from "lunar-javascript";

import type { AlmanacData } from "@/lib/types";

const { Solar } = lunar;

export function getShanghaiDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function formatChong(desc: string): string {
  const match = desc.match(/^\((.+)\)(.+)$/);
  return match ? `冲${match[2]}` : `冲${desc}`;
}

const DAY_OFFICER_MEANINGS: Record<string, string> = {
  建日: "适合开始新事",
  除日: "适合清理旧事",
  满日: "适合收尾和庆祝",
  平日: "适合常规事务",
  定日: "适合定计划",
  执日: "适合推进执行",
  破日: "不宜大动作",
  危日: "多留意风险",
  成日: "适合把事情做完",
  收日: "适合收账和整理",
  开日: "适合开启新事",
  闭日: "适合休息和收尾",
};

const OFFICER_SUMMARIES: Record<string, string> = {
  建日: "今天适合开个头，但别一次铺太大的摊子。",
  除日: "今天适合清理旧事，把拖着的尾巴收一收。",
  满日: "今天适合收尾和庆祝，别急着追下一个目标。",
  平日: "今天按常规节奏走，稳一点比求快更好。",
  定日: "今天适合把模糊的事定下来，先做一件具体的小事。",
  执日: "今天适合推进已经想清楚的事，不适合反复改方向。",
  破日: "今天不适合硬推大动作，先保住节奏。",
  危日: "今天多留意风险，重要决定最好多核对一遍。",
  成日: "今天适合把事情做完，收尾会比开新坑更顺。",
  收日: "今天适合整理、对账和收尾，不适合冲动消费。",
  开日: "今天适合开始一件新事，先迈出最小的一步。",
  闭日: "今天适合休息、复盘和整理，不必勉强社交。",
};

const PLAIN_TERMS: Record<string, string> = {
  嫁娶: "结婚",
  纳采: "订婚",
  订盟: "定亲",
  祭祀: "祭拜",
  斋醮: "祈福",
  开光: "新物启用",
  安香: "安放香火",
  出火: "迁移炉火",
  出行: "出门",
  拆卸: "拆改",
  动土: "开工动土",
  祈福: "祈福",
  进人口: "添丁或招人",
  纳财: "收钱",
  交易: "买卖",
  立券: "签合同",
  移徙: "搬家",
  安床: "安床",
  修造: "装修",
  安葬: "下葬",
  除服: "办完丧事",
  成服: "守丧",
  置产: "买房",
  掘井: "挖井",
  词讼: "打官司",
  栽种: "种植",
};

function plainTerms(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => PLAIN_TERMS[item] ?? item)));
}

export function getAlmanacData(dateValue?: string): AlmanacData {
  const date = isValidDateString(dateValue ?? "") ? dateValue! : getShanghaiDate();
  const [year, month, day] = date.split("-").map(Number);
  const solar = Solar.fromYmd(year, month, day);
  const lunarDay = solar.getLunar();
  const solarTerm = lunarDay.getJieQi();
  const yi = plainTerms(lunarDay.getDayYi());
  const ji = plainTerms(lunarDay.getDayJi());
  const dayOfficer = `${lunarDay.getZhiXing()}日`;
  const hasYi = (word: string) => yi.some((item) => item.includes(word));
  const hasJi = (word: string) => ji.some((item) => item.includes(word));

  const learning =
    hasYi("签合同") || hasYi("收钱")
      ? "适合学一个能马上用上的小技能，先花 25 分钟开个头。"
      : dayOfficer === "定日"
        ? "适合把学习计划定下来，先选一个具体主题，不贪多。"
        : hasJi("打官司")
          ? "适合复习和整理，不建议今天硬开新坑。"
          : "适合补基础，学完一个小点就停下来。";

  const communication = hasJi("打官司")
    ? "少争对错。重要沟通尽量留文字记录，别在气头上回。"
    : hasYi("结婚") ||
        hasYi("订婚") ||
        hasYi("签合同") ||
        hasYi("出门")
      ? "适合约人把话说清楚，先说结论，再说原因。"
      : "先听对方把话说完，再表达自己的需要。";

  const money = hasJi("买房")
    ? "别急着做大额决定，先核对预算和合同。"
    : hasYi("收钱") || hasYi("买卖")
      ? "适合对账、收款和确认合同细节。"
      : "适合整理固定支出，不适合冲动消费。";
  const summary = `${OFFICER_SUMMARIES[dayOfficer] ?? "今天按自己的节奏来，先做最重要的一件事。"}${
    hasJi("打官司")
      ? "沟通上少争输赢，重要的事留个记录。"
      : "把最重要的一件事先做完，别同时开太多。"
  }`;

  return {
    date,
    weekday: `周${solar.getWeekInChinese()}`,
    lunarDate: `${lunarDay.getMonthInChinese()}月${lunarDay.getDayInChinese()}`,
    ganzhi: `${lunarDay.getYearInGanZhi()}年 ${lunarDay.getMonthInGanZhi()}月 ${lunarDay.getDayInGanZhi()}日`,
    yi: yi.slice(0, 8),
    ji: ji.slice(0, 6),
    chong: formatChong(lunarDay.getDayChongDesc()),
    sha: `少去${lunarDay.getDaySha()}边`,
    nayin: lunarDay.getDayNaYin(),
    dayOfficer,
    dayOfficerMeaning:
      DAY_OFFICER_MEANINGS[`${lunarDay.getZhiXing()}日`] ?? "平常心处理",
    xiDirection: lunarDay.getDayPositionXiDesc(),
    caiDirection: lunarDay.getDayPositionCaiDesc(),
    auspiciousness: `${lunarDay.getDayTianShen()} · ${lunarDay.getDayTianShenType()}日`,
    summary,
    lifeTips: {
      learning,
      communication,
      money,
    },
    ...(solarTerm ? { solarTerm } : {}),
  };
}
