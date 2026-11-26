import lunar from "lunar-javascript";

import { DEFAULT_LONGITUDE, findPlaceLongitude } from "@/lib/places";
import type { BirthInfo } from "@/lib/types";

const { Solar } = lunar;

const GAN_WUXING: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

const ZHI_WUXING: Record<string, string> = {
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  辰: "土",
  戌: "土",
  丑: "土",
  未: "土",
  申: "金",
  酉: "金",
  亥: "水",
  子: "水",
};

export interface ChartResult {
  pillars: string;
  dayMaster: string;
  dayMasterElement: string;
  wuXing: Array<{ element: string; count: number }>;
  taiYuan: string;
  mingGong: string;
  solarTime: string;
  daYun: Array<{ range: string; ganZhi: string; age: string }>;
  summaryLine: string;
  lines: string[];
}

/** 均时差（分钟）——真太阳时相对平太阳时的偏差，年积日的近似公式。 */
function equationOfTime(dayOfYear: number): number {
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86_400_000) + 1;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** 用本机算法排四柱，不联网、不编造。只有用户填了生日才算。 */
export function buildChart(birth: BirthInfo): ChartResult | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth.date.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) {
    return null;
  }

  const hour =
    typeof birth.hour === "number" && birth.hour >= 0 && birth.hour <= 23
      ? birth.hour
      : 12;
  const minute =
    typeof birth.minute === "number" && birth.minute >= 0 && birth.minute <= 59
      ? birth.minute
      : 0;

  const longitude =
    typeof birth.longitude === "number"
      ? birth.longitude
      : findPlaceLongitude(birth.place) ?? DEFAULT_LONGITUDE;

  // 真太阳时 = 北京时间 + (经度 - 120) × 4 分钟 + 均时差
  const offsetMinutes = (longitude - 120) * 4 + equationOfTime(dayOfYear(year, month, day));
  const base = Date.UTC(year, month - 1, day, hour, minute);
  const corrected = new Date(base + Math.round(offsetMinutes) * 60_000);

  const eightChar = Solar.fromYmdHms(
    corrected.getUTCFullYear(),
    corrected.getUTCMonth() + 1,
    corrected.getUTCDate(),
    corrected.getUTCHours(),
    corrected.getUTCMinutes(),
    0,
  )
    .getLunar()
    .getEightChar();

  const raw: Array<[string, string, string, string, string]> = [
    ["年", eightChar.getYear(), eightChar.getYearShiShenGan(), eightChar.getYearNaYin(), eightChar.getYearDiShi()],
    ["月", eightChar.getMonth(), eightChar.getMonthShiShenGan(), eightChar.getMonthNaYin(), eightChar.getMonthDiShi()],
    ["日", eightChar.getDay(), "日主", eightChar.getDayNaYin(), eightChar.getDayDiShi()],
    ["时", eightChar.getTime(), eightChar.getTimeShiShenGan(), eightChar.getTimeNaYin(), eightChar.getTimeDiShi()],
  ];

  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const [, ganZhi] of raw) {
    const [gan, zhi] = [ganZhi[0], ganZhi[1]];
    if (GAN_WUXING[gan]) counts[GAN_WUXING[gan]] += 1;
    if (ZHI_WUXING[zhi]) counts[ZHI_WUXING[zhi]] += 1;
  }

  const wuXing = Object.entries(counts)
    .map(([element, count]) => ({ element, count }))
    .sort((a, b) => b.count - a.count);

  const dayGan = eightChar.getDayGan();
  const dayMasterElement = GAN_WUXING[dayGan] ?? "";
  const pillars = raw.map(([, ganZhi]) => ganZhi).join(" ");
  const shiShen = raw.map(([, , shen]) => shen).join(" / ");
  const taiYuan = eightChar.getTaiYuan();
  const mingGong = eightChar.getMingGong();

  const daYun: ChartResult["daYun"] = [];
  try {
    const yun = eightChar.getYun(birth.gender === "female" ? 0 : 1);
    const list = yun.getDaYun();
    for (const item of list.slice(1, 6)) {
      const ganZhi = item.getGanZhi();
      if (!ganZhi) continue;
      daYun.push({
        range: `${item.getStartYear()}-${item.getEndYear()}`,
        ganZhi,
        age: `${item.getStartAge()}-${item.getEndAge()} 岁`,
      });
    }
  } catch {
    // 缺性别时算不了大运，跳过即可
  }

  const strongElement = wuXing[0];
  const weakElement = wuXing[wuXing.length - 1];
  const placeLabel = birth.place ? birth.place : "未填城市";
  const solarClock = `${pad(corrected.getUTCHours())}:${pad(corrected.getUTCMinutes())}`;
  const delta = Math.round(offsetMinutes);

  const lines = [
    `真太阳时 ${solarClock}（${placeLabel} ${longitude.toFixed(2)}°E，比北京时间 ${delta >= 0 ? "+" : ""}${delta} 分钟）`,
    `四柱：${raw.map(([label, ganZhi, shen]) => `${label}${ganZhi}（${shen}）`).join("　")}`,
    `日主 ${dayGan}${dayMasterElement}｜胎元 ${taiYuan}｜命宫 ${mingGong}`,
    `五行：${wuXing.map((item) => `${item.element}${item.count}`).join(" ")}（${strongElement.element}偏旺，${weakElement.element}偏弱）`,
    daYun.length > 0
      ? `大运：${daYun.map((item) => `${item.ganZhi}（${item.age}）`).join(" → ")}`
      : "大运：填了性别才能排顺逆",
  ];

  return {
    pillars,
    dayMaster: dayGan,
    dayMasterElement,
    wuXing,
    taiYuan,
    mingGong,
    solarTime: `${solarClock}（修正 ${delta >= 0 ? "+" : ""}${delta} 分钟）`,
    daYun,
    summaryLine: `真太阳时 ${solarClock}；四柱 ${pillars}；日主 ${dayGan}${dayMasterElement}；十神 ${shiShen}；五行 ${wuXing
      .map((item) => `${item.element}${item.count}`)
      .join(" ")}${daYun.length > 0 ? `；大运 ${daYun.map((item) => item.ganZhi).join("、")}` : ""}`,
    lines,
  };
}

const SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

export interface SynastryResult {
  relation: string;
  note: string;
  selfLine: string;
  partnerLine: string;
}

/** 合盘：只看两个盘的日主五行关系和互补，不预测关系走向。 */
export function buildSynastry(
  self: ChartResult,
  partner: ChartResult,
): SynastryResult {
  const a = self.dayMasterElement;
  const b = partner.dayMasterElement;

  let relation: string;
  let note: string;

  if (!a || !b) {
    relation = "五行信息不足";
    note = "有一方的日主五行没算出来，先按普通相处建议来。";
  } else if (a === b) {
    relation = `同气（都是${a}）`;
    note = "同频，很容易聊到一块，也容易同时卡在同一个点上。谁先停下来，谁就能把节奏带出去。";
  } else if (SHENG[a] === b) {
    relation = `${a}生${b}：你在托 TA`;
    note = "你天然是付出的一方，容易累；TA 未必是不领情，只是习惯被接住。记得留一半力气给自己。";
  } else if (SHENG[b] === a) {
    relation = `${b}生${a}：TA 在托你`;
    note = "TA 在能量上更照顾你，你更容易放松。别把这当成理所当然，偶尔主动一次会更稳。";
  } else if (KE[a] === b) {
    relation = `${a}克${b}：你容易压到 TA`;
    note = "你的推进方式对 TA 来说偏重。把节奏放慢，多问一句「这样行吗」，比直接给方案有效。";
  } else if (KE[b] === a) {
    relation = `${b}克${a}：TA 容易压到你`;
    note = "TA 的节奏会压到你，容易让你自我怀疑。先分清哪些是 TA 的事，不用全接过来。";
  } else {
    relation = `${a} 与 ${b} 无明显生克`;
    note = "两边节奏不太一样，说清楚期待比互相猜更省事。";
  }

  const selfWeak = self.wuXing[self.wuXing.length - 1];
  const partnerStrong = partner.wuXing[0];
  const partnerWeak = partner.wuXing[partner.wuXing.length - 1];
  const selfStrong = self.wuXing[0];

  const complement =
    selfWeak.element === partnerStrong.element
      ? `你缺的${selfWeak.element}，正好是 TA 旺的，TA 能补你这一块。`
      : selfStrong.element === partnerWeak.element
        ? `TA 缺的${partnerWeak.element}，正好是你多的，你能补 TA 这一块。`
        : "";

  return {
    relation,
    note: complement ? `${note}${complement}` : note,
    selfLine: `你：${self.dayMaster}${self.dayMasterElement}｜${self.wuXing.map((w) => w.element + w.count).join(" ")}`,
    partnerLine: `TA：${partner.dayMaster}${partner.dayMasterElement}｜${partner.wuXing.map((w) => w.element + w.count).join(" ")}`,
  };
}
