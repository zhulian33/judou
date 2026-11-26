import type { Scene } from "@/lib/types";

export interface KnowledgeSource {
  name: string;
  org: string;
  url: string;
  takeaway: string;
}

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    name: "主动倾听",
    org: "HelpGuide · PositivePsychology · MindTools",
    url: "https://www.helpguide.org/relationships/communication/active-listening",
    takeaway:
      "先听内容，也听情绪；用复述、总结和开放式问题确认，而不是急着判断或给方案。",
  },
  {
    name: "Gottman 四骑士",
    org: "The Gottman Institute",
    url: "https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/",
    takeaway:
      "批评、轻蔑、防御和冷处理会让冲突升级；把抱怨收窄到具体行为，更容易被接住。",
  },
  {
    name: "自信表达",
    org: "Centre for Clinical Interventions",
    url: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Assertiveness",
    takeaway:
      "清楚、直接，同时尊重对方。把事实、感受、具体请求和边界分开说。",
  },
  {
    name: "非暴力沟通",
    org: "Center for Nonviolent Communication",
    url: "https://www.cnvc.org/learn-nvc/what-is-nvc",
    takeaway:
      "把观察、感受、需要和请求分开表达，减少指责与防御，但不等于一味讨好。",
  },
  {
    name: "高语境沟通",
    org: "Edward T. Hall 的高低语境理论",
    url: "https://en.wikipedia.org/wiki/High-context_and_low-context_cultures",
    takeaway:
      "中文聊天常依赖关系、语气和共同背景。单条消息能提供线索，但不足以断定完整意图。",
  },
  {
    name: "会话含义",
    org: "Grice 合作原则",
    url: "https://en.wikipedia.org/wiki/Cooperative_principle",
    takeaway:
      "人说话常默认彼此合作；如果字面明显绕开重点，往往需要结合语境理解言外之意。",
  },
  {
    name: "面子与礼貌",
    org: "Brown & Levinson 礼貌理论",
    url: "https://en.wikipedia.org/wiki/Politeness_theory",
    takeaway:
      "请求、拒绝和批评常会顾全面子。语气越软，不一定越真心；要看有没有具体行动。",
  },
  {
    name: "文字媒介的局限",
    org: "Media Richness Theory",
    url: "https://en.wikipedia.org/wiki/Media_richness_theory",
    takeaway:
      "文字缺少语气、表情和即时反馈，单条消息的信息量有限，置信度不应过高。",
  },
  {
    name: "归因偏差",
    org: "Attribution Theory",
    url: "https://en.wikipedia.org/wiki/Attribution_(psychology)",
    takeaway:
      "不要从一次行为直接推断人品或关系结论；先区分情境性原因和重复出现的稳定模式。",
  },
];

const SCENE_KNOWLEDGE: Record<Scene, string[]> = {
  flirt: [
    "看三个信号：对方有没有主动补充信息、有没有提出替代时间、回复是否只维持礼貌最低值。",
    "区分“客气的拒绝”和“真实的忙”：前者不给替代方案，后者常会留下下一次窗口。",
    "不要因为一条晚回就判断喜欢或不喜欢；看一段时间内的投入是否对等。",
    "好感度只是当前对话状态的粗略估计，不等于关系结论，也不要用话术操控。",
  ],
  work: [
    "先拆责任：谁提出、谁决定、谁交付、何时交付、失败时谁承担后果。",
    "把“催”翻译成“需要确定感”；用范围、版本、时间和确认点回复，比表态有效。",
    "拒绝时不要只说不行，给替代方案或边界，例如“今天只能给核心版，完整版明早”。",
    "重要结论尽量留文字记录，避免口头承诺和模糊的“尽快”。",
  ],
  family: [
    "区分抱怨和批评：抱怨针对具体行为，批评针对人格。回应时先落到具体事情。",
    "很多家庭表达把担心说成指责；先接住担心，再划边界，能降低防御。",
    "不要用“你总是”“你从来不”扩大战场；改成一次具体事件和自己的感受。",
    "边界不是顶嘴。可以理解对方，同时明确哪些说法或做法自己不会接受。",
  ],
  service: [
    "识别软钉子：只有抱歉、没有方案、没有工单、没有时限，通常意味着责任被推回。",
    "把诉求变成可执行项：工单号、处理人、回复时间、升级渠道。",
    "保留截图、订单号、时间和客服工号；情绪表达不能替代证据。",
    "如果涉及法律权利或金额争议，建议以平台规则、监管渠道或专业意见为准。",
  ],
  friend: [
    "朋友之间更在意“你有没有站我这边”。先接情绪，再解释，顺序反了容易更僵。",
    "识别撤退信号：短句、没事、算了、你忙吧，可能是在收回期待。",
    "修复关系要给具体行动，不只是“对不起”；说清什么时候、怎么补。",
    "如果对方明确要空间，尊重边界，不要把追问包装成关心。",
  ],
};

const SHARED_RULES = [
  "文本信息天然缺语气、表情和场景，重要判断必须保留不确定性。",
  "至少保留 2 种合理解读，不要把最抓马的猜测当成事实。",
  "引用消息里的具体词句作为证据，不要只给结论。",
  "性别、关系状态、依恋类型都不能从一句话可靠推断；未提供时必须中性表达。",
  "当信息不足时，明确写出还需要观察什么，而不是硬猜。",
];

const CHAT_CUES = [
  ["在吗 / 睡了吗", "通常不是单纯打招呼，可能有请求；先让对方说清来意。"],
  ["晚点再说 / 下次吧 / 改天", "可能是真的忙，也可能是软拒绝；看有没有替代时间。"],
  ["没事 / 算了 / 你忙吧", "常是失望或收回期待，不一定代表真的没事。"],
  ["呵呵 / 随便 / 都行", "可能是冷淡、放弃争论，或不想做决定；结合前文判断。"],
  ["我看看 / 我尽量 / 有空再说", "承诺强度偏低，通常没有明确时间点。"],
  ["吗 / 吧 / 呢", "分别在确认、留余地、追问或转移话题，不能只按字面理解。"],
  ["哦 / 嗯 / 好", "可能只是收到，也可能是降温或结束话题；看长度和后续动作。"],
  ["突然找你 / 好久没聊", "可能想重新建立联系，也可能有事相求；不要一上来就假定动机。"],
];

export function buildKnowledgeBrief(scene: Scene): string {
  return `## 分析框架（来自公开沟通研究与实务框架）
${SHARED_RULES.map((rule) => `- ${rule}`).join("\n")}

## 当前场景的判断重点
${SCENE_KNOWLEDGE[scene].map((rule) => `- ${rule}`).join("\n")}

## 中文聊天线索
${CHAT_CUES.map(([cue, meaning]) => `- 当出现「${cue}」：${meaning}`).join("\n")}

## 可参考的方法
- 主动倾听：内容 + 情绪双通道，先复述/总结，再回应。
- Gottman：避免批评人格、轻蔑、防御和冷处理；把抱怨收窄到具体行为。
- 自信表达：事实、感受、具体请求、边界分开说。
- 高语境沟通：考虑关系背景，但不要用“高语境”当借口过度脑补。`;
}
