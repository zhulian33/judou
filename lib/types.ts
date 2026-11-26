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

export interface AskRequest {
  question: string;
  scene?: Scene;
  date?: string;
}

export interface AskResult {
  answer: string;
  basis: string[];
  caution: string;
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
