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

  const lunar: {
    Solar: {
      fromYmd(year: number, month: number, day: number): SolarDate;
    };
  };

  export default lunar;
}
