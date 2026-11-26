import lunar from "lunar-javascript";

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

export interface ChartPillar {
  label: string;
  ganZhi: string;
  shiShen: string;
  nayin: string;
  diShi: string;
}

export interface ChartResult {
  pillars: string;
  dayMaster: string;
  dayMasterElement: string;
  wuXing: Array<{ element: string; count: number }>;
  taiYuan: string;
  mingGong: string;
  /** 一行摘要，给模型和卡片顶部用 */
  summaryLine: string;
  /** 展示用的几行 */
  lines: string[];
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

  const eightChar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
    .getLunar()
    .getEightChar();

  const raw: Array<[string, string, string, string, string, string]> = [
    [
      "年",
      eightChar.getYear(),
      eightChar.getYearShiShenGan(),
      eightChar.getYearNaYin(),
      eightChar.getYearDiShi(),
      "",
    ],
    [
      "月",
      eightChar.getMonth(),
      eightChar.getMonthShiShenGan(),
      eightChar.getMonthNaYin(),
      eightChar.getMonthDiShi(),
      "",
    ],
    [
      "日",
      eightChar.getDay(),
      "日主",
      eightChar.getDayNaYin(),
      eightChar.getDayDiShi(),
      "",
    ],
    [
      "时",
      eightChar.getTime(),
      eightChar.getTimeShiShenGan(),
      eightChar.getTimeNaYin(),
      eightChar.getTimeDiShi(),
      "",
    ],
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

  const strongElement = wuXing[0];
  const weakElement = wuXing[wuXing.length - 1];

  return {
    pillars,
    dayMaster: dayGan,
    dayMasterElement,
    wuXing,
    taiYuan,
    mingGong,
    summaryLine: `四柱 ${pillars}；日主 ${dayGan}${dayMasterElement}；十神 ${shiShen}；五行 ${wuXing
      .map((item) => `${item.element}${item.count}`)
      .join(" ")}`,
    lines: [
      `四柱：${raw.map(([label, ganZhi, shen]) => `${label}${ganZhi}（${shen}）`).join("　")}`,
      `日主：${dayGan}${dayMasterElement}｜胎元 ${taiYuan}｜命宫 ${mingGong}`,
      `五行：${wuXing.map((item) => `${item.element}${item.count}`).join(" ")}（${strongElement.element}偏旺，${weakElement.element}偏弱）`,
      `纳音/地势：${raw.map(([label, , , nayin, diShi]) => `${label}${nayin}·${diShi}`).join("　")}`,
    ],
  };
}
