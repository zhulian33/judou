declare module "lunar-javascript" {
  interface LunarDay {
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getYearShengXiao(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayNaYin(): string;
    getZhiXing(): string;
    getDayPositionXiDesc(): string;
    getDayPositionCaiDesc(): string;
    getDayTianShen(): string;
    getDayTianShenType(): string;
    getJieQi(): string;
  }

  interface SolarDate {
    getLunar(): LunarDay;
    getWeekInChinese(): string;
  }

  interface EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getTaiYuan(): string;
    getMingGong(): string;
  }

  interface LunarDay {
    getEightChar(): EightChar;
  }

  const lunar: {
    Solar: {
      fromYmd(year: number, month: number, day: number): SolarDate;
      fromYmdHms(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
      ): SolarDate;
    };
  };

  export default lunar;
}
