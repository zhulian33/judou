import lunar from "lunar-javascript";

import type { BirthInfo } from "@/lib/types";

const { Solar } = lunar;

export interface ChartResult {
  pillars: string;
  dayMaster: string;
  dayZhi: string;
  nayin: string;
  summaryLine: string;
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

  const hour = typeof birth.hour === "number" && birth.hour >= 0 && birth.hour <= 23
    ? birth.hour
    : 12;

  const eightChar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
    .getLunar()
    .getEightChar();

  const pillars = [
    eightChar.getYear(),
    eightChar.getMonth(),
    eightChar.getDay(),
    eightChar.getTime(),
  ].join(" ");

  return {
    pillars,
    dayMaster: eightChar.getDayGan(),
    dayZhi: eightChar.getDayZhi(),
    nayin: eightChar.getDayNaYin(),
    summaryLine: `四柱 ${pillars}，日主 ${eightChar.getDayGan()}，日支 ${eightChar.getDayZhi()}（${eightChar.getDayNaYin()}）`,
  };
}
