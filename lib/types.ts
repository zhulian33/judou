export const SCENES = ["flirt", "work", "family", "study", "friend"] as const;
export type Scene = (typeof SCENES)[number];

export type Gender = "unknown" | "female" | "male";

export interface AlmanacData {
  date: string;
  weekday: string;
  lunarDate: string;
  ganzhi: string;
  yi: string[];
  ji: string[];
  chong: string;
  sha: string;
  nayin: string;
  dayOfficer: string;
  dayOfficerMeaning: string;
  xiDirection: string;
  caiDirection: string;
  auspiciousness: string;
  summary: string;
  lifeTips: {
    learning: string;
    communication: string;
    money: string;
  };
  solarTerm?: string;
}

export interface BirthInfo {
  /** YYYY-MM-DD */
  date: string;
  /** 0-23，不填按 12 点算 */
  hour?: number;
  /** 0-59，不填按 0 分算 */
  minute?: number;
  /** 出生城市名，用于真太阳时 */
  place?: string;
  /** 经度（东经为正），优先于 place */
  longitude?: number;
  /** 大运顺逆要用 */
  gender?: "male" | "female";
}

export interface AskRequest {
  question: string;
  scene?: Scene;
  date?: string;
  birth?: BirthInfo;
  /** 对方生辰，填了才做合盘 */
  partnerBirth?: BirthInfo;
  /** self = 只看自己；partner = 看 TA / 合盘 */
  focus?: "self" | "partner";
}

export interface AskChart {
  pillars: string;
  dayMaster: string;
  dayMasterElement: string;
  lines: string[];
  wuXing: Array<{ element: string; count: number }>;
  solarTime?: string;
  daYun?: Array<{ range: string; ganZhi: string; age: string }>;
}

export interface AskResult {
  answer: string;
  basis: string[];
  caution: string;
  /** 有生辰时返回命盘，方便界面显示 */
  chart?: AskChart;
  /** 填了对方生辰时的合盘 */
  partnerChart?: AskChart;
  synastry?: {
    relation: string;
    note: string;
    selfLine: string;
    partnerLine: string;
  };
}

export interface SummaryRequest {
  text: string;
  scene?: Scene;
}

export interface SummaryTranslation {
  core: string;
  points: string[];
  meaning: string;
  temperature?: string;
  advice: string;
  moves?: string[];
  avoid?: string;
  missing?: string;
}

export interface SummaryResult {
  /** 这段话在说谁 */
  subject?: string;
  /** 一句话核心，30 字内 */
  core: string;
  /** 2-4 条关键信息 */
  points: string[];
  /** 真正的问题 */
  meaning: string;
  /** TA 现在的态度 / 温度，一句话 */
  temperature?: string;
  /** 你接下来该做什么（一句话总结） */
  advice: string;
  /** 2-3 条具体做法，不是台词 */
  moves?: string[];
  /** 先别做什么 */
  avoid?: string;
  /** 还缺什么信息 / 哪里不确定 */
  missing?: string;
  /** 原文是英文（或中英混排）时，附一份英文版 */
  en?: SummaryTranslation;
}

export interface SceneOption {
  id: Scene;
  label: string;
  eyebrow: string;
  hint: string;
}

export interface ExampleMessage {
  scene: Scene;
  label: string;
  message: string;
  context?: string;
}
