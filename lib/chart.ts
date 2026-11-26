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
