export const SCENES = ["flirt", "work", "family", "service", "friend"] as const;
export type Scene = (typeof SCENES)[number];

export const REPLY_STYLES = ["gentle", "humor", "deadpan", "straight"] as const;
export type ReplyStyle = (typeof REPLY_STYLES)[number];

export type Confidence = "high" | "medium" | "low";
export type AffectionTrend = "warming" | "steady" | "cooling";
export type Gender = "unknown" | "female" | "male";

export interface AnalyzeRequest {
  message: string;
  scene: Scene;
  myWords?: string;
  context?: string;
  memory?: string;
  gender?: Gender;
  contactName?: string;
}

export interface ReplyOption {
  style: ReplyStyle;
  label: string;
  content: string;
  affectionBonus?: number;
  whyItWorks?: string;
}

export interface NextLinePrediction {
  content: string;
  confidence: Confidence;
  reason: string;
}

export interface AffectionInsight {
  score: number;
  trend: AffectionTrend;
  note: string;
}

export interface ReadingHypothesis {
  title: string;
  explanation: string;
  likelihood: Confidence;
}

export interface SubjectInsight {
  /** me = 在说你；self = 在说 TA 自己；third = 在说第三方 */
  who: "me" | "self" | "third";
  /** 人话标签，如「TA 在说别人」 */
  label: string;
}

export interface GuidanceInsight {
  read: string;
  direction: string;
  keep: string[];
  avoid: string;
}

export interface MyIntentInsight {
  read: string;
  adjustment: string;
}

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

export interface AnalyzeResult {
  subtext: string;
  emotion: string;
  intent: string;
  risk: string;
  thoughts: string;
  particles: string[];
  analysisConfidence: Confidence;
  readings: ReadingHypothesis[];
  missingInfo: string;
  myIntent?: MyIntentInsight;
  nextLine: NextLinePrediction;
  affection?: AffectionInsight;
  trust?: AffectionInsight;
  guidance?: GuidanceInsight;
  subject?: SubjectInsight;
  /** received = 对方发来的消息；narration = 用户自己在讲一整件事 */
  framing?: "received" | "narration";
  replies: ReplyOption[];
}

export interface ApiErrorBody {
  error: string;
}

export interface OpenerOption {
  style: "gentle" | "humor" | "straight";
  label: string;
  content: string;
  whyItWorks: string;
}

export interface OpenerResult {
  read: string;
  options: OpenerOption[];
  avoid: string;
  timing?: string;
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
}

export interface SummaryRequest {
  text: string;
  scene?: Scene;
}

export interface SummaryResult {
  /** 这段话在说谁 */
  subject?: string;
  /** 一句话核心，30 字内 */
  core: string;
  /** 2-4 条关键信息 */
  points: string[];
  /** 对方真正想说的 */
  meaning: string;
  /** 你接下来该做什么 */
  advice: string;
  /** 还缺什么信息 / 哪里不确定 */
  missing?: string;
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
