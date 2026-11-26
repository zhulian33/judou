import type {
  AffectionTrend,
  NextLinePrediction,
  ReadingHypothesis,
  ReplyOption,
} from "@/lib/types";

export type DemoPattern =
  | "sharing"
  | "venting"
  | "cutoff"
  | "delay"
  | "withdrawal"
  | "urgency"
  | "comparison"
  | "service"
  | "question"
  | "warm"
  | "generic";

export interface DemoPatternData {
  subtext: string;
  guidance?: { direction: string; keep: string[] };
  emotion: string;
  intent: string;
  thoughts: string;
  nextLine: NextLinePrediction;
  readings: ReadingHypothesis[];
  missingInfo: string;
  replies: ReplyOption[];
  score: number;
  trend: AffectionTrend;
  note: string;
}

export const DEMO_PATTERNS: Record<Exclude<DemoPattern, "generic">, DemoPatternData> = {
  sharing: {
    subtext: "TA 在跟你讲别人的事，重点是想有人听，不是在说你们俩。",
    guidance: {
      direction:
        "先顺着 TA 的情绪接一句，再问一个细节让 TA 说下去。别急着评价那个人，也别把话题拐回你们的关系。",
      keep: ["先听，不急着站队", "只问细节，不做评判"],
    },
    emotion: "情绪还不小，说的时候带着点代入。",
    intent: "想找人说说这件事，顺便确认自己的判断。",
    thoughts: "这事憋着难受，先跟 TA 讲讲，看 TA 怎么想。",
    nextLine: {
      content: "你说她是不是也有点过分？",
      confidence: "medium",
      reason: "TA 讲完细节后，通常会把判断权递给你，等一个回应。",
    },
    readings: [
      { title: "想被听见", explanation: "重点是把情绪说出来，不一定需要建议。", likelihood: "high" },
      { title: "求认同", explanation: "想确认自己的判断是不是站得住。", likelihood: "medium" },
      { title: "单纯分享", explanation: "只是刚好有话想说，没有别的意图。", likelihood: "low" },
    ],
    missingInfo: "看 TA 说完后是等你评价，还是自己就把话收住了。",
    replies: [
      { style: "gentle", label: "接住", content: "听起来你也被折腾得挺累的，先说说后来呢？" },
      { style: "humor", label: "轻一点", content: "这剧情有点上头，你接着说，我听着。" },
      { style: "deadpan", label: "冷一句", content: "行，这事确实够呛。然后呢？" },
      { style: "straight", label: "问清楚", content: "你现在是想吐槽一下，还是想让我一起想办法？" },
    ],
    score: 55,
    trend: "steady",
    note: "这时候接住情绪比给建议有用，别急着评价第三方。",
  },
  venting: {
    subtext: "TA 在倒自己的苦水，想被理解，不是想被教育。",
    guidance: {
      direction:
        "先接一句情绪，别急着分析谁对谁错，也别马上给方案。等 TA 把话说完，再问一句「你想让我一起想办法，还是先听你说」。",
      keep: ["先接情绪，后给建议", "不评价 TA 的处境"],
    },
    emotion: "累、烦躁，情绪是往外倒的。",
    intent: "把这一天的憋屈说出来，找个人站在 TA 这边。",
    thoughts: "今天真的够了，先找个人说两句，不然憋得难受。",
    nextLine: {
      content: "算了，说出来好受点。",
      confidence: "medium",
      reason: "TA 说完之后多半会自己收一下，不会真的要求你解决。",
    },
    readings: [
      { title: "想被理解", explanation: "重点在情绪，不在事情本身。", likelihood: "high" },
      { title: "想找办法", explanation: "吐槽完可能会问你怎么处理。", likelihood: "medium" },
      { title: "只是想说说", explanation: "说完就过去了，不需要回应太多。", likelihood: "low" },
    ],
    missingInfo: "看 TA 说完是停下来，还是继续追问你的看法。",
    replies: [
      { style: "gentle", label: "接住", content: "今天这是真憋屈，换我也受不了。" },
      { style: "humor", label: "轻一点", content: "这破事确实该骂，你先骂，我垫后。" },
      { style: "deadpan", label: "冷一句", content: "行，今天这口气先记着。" },
      { style: "straight", label: "问一句", content: "你想让我听着，还是一起想想怎么办？" },
    ],
    score: 58,
    trend: "steady",
    note: "先站 TA 这边，别急着讲道理。",
  },
  cutoff: {
    subtext: "TA 不想再聊了，这句话是在收场。",
    emotion: "收着、有点烦，也不想再解释。",
    intent: "结束现在这段对话，别再追问下去。",
    thoughts: "算了，先停吧。再说下去只会更烦。",
    nextLine: {
      content: "先这样吧。",
      confidence: "medium",
      reason: "TA 会用更短的一句把话题收掉，而不是继续解释原因。",
    },
    readings: [
      { title: "嫌烦了", explanation: "被追问或聊累了，只想马上停下来。", likelihood: "high" },
      { title: "在降温", explanation: "还没有彻底翻脸，但想把距离重新拉开。", likelihood: "medium" },
      { title: "没力气", explanation: "状态不好，不想解释，也不想被安慰。", likelihood: "low" },
    ],
    missingInfo: "看 TA 之后会不会自己回来找你。会回来是情绪，一直不回是真的想退。",
    replies: [
      { style: "gentle", label: "收住", content: "行，那先不聊了。你忙你的，我不打扰。" },
      { style: "humor", label: "轻收", content: "收到，我先退场。下次想聊了喊我。" },
      { style: "deadpan", label: "冷收", content: "好。那就到这。" },
      { style: "straight", label: "留一句", content: "好，我不追问。等你愿意说的时候再说。" },
    ],
    score: 32,
    trend: "cooling",
    note: "热度在掉。现在唯一能加分的是给空间，不是解释。",
  },
  delay: {
    subtext: "对方在把节奏往后放，但还没把门关死。",
    emotion: "语气客气，热乎劲儿在退。",
    intent: "先拉开一点距离，看你会不会追着问。",
    thoughts: "TA 到底是在忙，还是不想继续？先别把话说死，看 TA 会不会追问。",
    nextLine: {
      content: "嗯嗯，等我忙完这阵再说吧。",
      confidence: "medium",
      reason: "对方会保留余地，但不一定马上给具体时间。",
    },
    readings: [
      { title: "在降速", explanation: "愿意保持礼貌，但暂时不想推进见面。", likelihood: "high" },
      { title: "确实忙", explanation: "最近有事，只是懒得解释具体安排。", likelihood: "medium" },
      { title: "想收尾", explanation: "不想直接拒绝，所以用忙把对话慢慢放下。", likelihood: "low" },
    ],
    missingInfo: "看对方之后会不会主动给替代时间。愿意给具体时间，多是忙；一直不给，才更像在收尾。",
    replies: [
      { style: "gentle", label: "留余地", content: "好，你先忙。等你空下来再约。" },
      { style: "humor", label: "轻一点", content: "行，我先把这句话存着。你忙完记得来取。" },
      { style: "deadpan", label: "冷一句", content: "行。我先把位置留着，你忙完想起来再说。" },
      { style: "straight", label: "说清楚", content: "好，那你忙完告诉我，我们再定时间。" },
    ],
    score: 40,
    trend: "cooling",
    note: "热度在往下走，但还没到底。现在回得轻一点，比追问更容易把局面拉回来。",
  },
  withdrawal: {
    subtext: "嘴上说没事，心里多半已经记下一笔。",
    emotion: "失望在往上冒，但还没说破。",
    intent: "等你主动补位，或者确认你是不是真的在意。",
    thoughts: "算了，说多了也没用。就看 TA 会不会主动补一句。",
    nextLine: {
      content: "算了，没事。",
      confidence: "high",
      reason: "对方不一定会继续解释，但会用更短的话把失望收回去。",
    },
    readings: [
      { title: "等你补救", explanation: "还愿意给你机会，想看你会不会主动行动。", likelihood: "high" },
      { title: "想静一静", explanation: "对方可能真的想自己消化，不想被追着解释。", likelihood: "medium" },
      { title: "收回期待", explanation: "开始降低对你的期待，不准备继续争这件事。", likelihood: "low" },
    ],
    missingInfo: "看对方接不接受具体补偿。如果明确拒绝，就先尊重空间，不要连续追问。",
    replies: [
      { style: "gentle", label: "先补救", content: "我知道你有点失望。是我没安排好，今晚我去找你。" },
      { style: "humor", label: "认个错", content: "别自己去，带上我。我负责拎包和认错。" },
      { style: "deadpan", label: "记一笔", content: "知道了。我给自己记一笔，下次你也别想跑。" },
      { style: "straight", label: "直接补", content: "我听出来你不高兴了。是我爽约，我补：今晚我请你吃饭。" },
    ],
    score: 34,
    trend: "cooling",
    note: "对方还在意，但这句话已经在扣分。先给具体行动，不要只解释。",
  },
  urgency: {
    subtext: "对方在把时间压力往你这边递。",
    emotion: "语气急，但还没到翻脸。",
    intent: "想拿到一个能交差的明确承诺。",
    thoughts: "明天汇报不能出事，先把这个需求要到手，哪怕只是核心版。",
    nextLine: {
      content: "主要是明天上午要看，你尽量吧。",
      confidence: "high",
      reason: "对方还会再强调一次紧迫性，试探能不能拿到更硬的承诺。",
    },
    readings: [
      { title: "怕交不了差", explanation: "主要压力来自截止时间，需要你给一个明确承诺。", likelihood: "high" },
      { title: "流程太乱", explanation: "需求可能本来就没排好，对方只是临时来救火。", likelihood: "medium" },
      { title: "试探底线", explanation: "对方在看你会不会无条件接下一个过急的时间点。", likelihood: "low" },
    ],
    missingInfo: "确认真正的截止时间、需求范围，以及能不能拆成第一版和完整版。",
    replies: [
      { style: "gentle", label: "拆版本", content: "今天先给你能用的核心部分，明天上午再补完整版，可以吗？" },
      { style: "humor", label: "先救急", content: "今天给能看的，明天给能上台的。你先救急还是先完美？" },
      { style: "deadpan", label: "干巴巴", content: "可以。今天先交半成品，明天补完整版。你先用着。" },
      { style: "straight", label: "给时点", content: "今天 18:00 前给第一版，完整版明天 10:00 前到。" },
    ],
    score: 56,
    trend: "steady",
    note: "合作基础还在，但临时加塞已经消耗了一点信任。把范围说清楚，比硬撑更加分。",
  },
  comparison: {
    subtext: "对方把担心说成了比较。",
    emotion: "担心和火气混在一起。",
    intent: "想让你快点稳定下来，但用了最刺耳的方式。",
    thoughts: "说这么重，TA 会不会又不高兴？但我也是真的着急。",
    nextLine: {
      content: "我这么说还不是为了你好。",
      confidence: "high",
      reason: "对方大概率会把担心再解释一遍，但语气未必会软。",
    },
    readings: [
      { title: "担心你", explanation: "真正想表达的是焦虑，不是真的在夸别人。", likelihood: "high" },
      { title: "投射焦虑", explanation: "对方把自己的不安放到你身上，未必意识到说重了。", likelihood: "medium" },
      { title: "习惯控制", explanation: "对方习惯用比较推动你，不一定只是这一次着急。", likelihood: "low" },
    ],
    missingInfo: "看对方接下来是继续比较，还是愿意听你把具体计划和难处说完。",
    replies: [
      { style: "gentle", label: "接住", content: "我知道你担心我，但这样比较我听着难受，咱们换个说法。" },
      { style: "humor", label: "岔开", content: "别人家孩子那么好，你认个干儿子吧，我负责做饭。" },
      { style: "deadpan", label: "冷接", content: "行，我这就去别人家排队，看还收不收。" },
      { style: "straight", label: "边界", content: "你担心我可以直接说，别拿别人跟我比。" },
    ],
    score: 45,
    trend: "steady",
    note: "关系底子还在，但这次比较让你不舒服。先接住担心，再守住边界。",
  },
  service: {
    subtext: "听起来是抱歉，其实在把问题退回来。",
    emotion: "礼貌很足，责任很轻。",
    intent: "先结束对话，避免升级和赔付。",
    thoughts: "先把标准话术说完，别留下赔付承诺，实在不行再转上级。",
    nextLine: {
      content: "亲，这个确实不在我们的服务范围呢～",
      confidence: "high",
      reason: "对方会用更标准的话术再挡一次，试探你会不会算了。",
    },
    readings: [
      { title: "权限不够", explanation: "一线客服可能确实没有处理权限，只能先挡回去。", likelihood: "high" },
      { title: "控制成本", explanation: "对方在尽量避免赔付或升级，先给标准话术。", likelihood: "medium" },
      { title: "怕担责任", explanation: "客服个人不想留下承诺，宁愿把问题推回给你。", likelihood: "medium" },
    ],
    missingInfo: "确认订单和问题类型，并问清是否有工单、处理人和升级渠道。",
    replies: [
      { style: "gentle", label: "按流程", content: "理解你们有流程。麻烦帮我登记工单，并告诉我下一步谁联系我。" },
      { style: "humor", label: "要凭据", content: "好，那我也再想想办法：工单号先给我一下。" },
      { style: "deadpan", label: "冷处理", content: "好的，我也再想想办法。工单号先给我，我好知道该想哪个。" },
      { style: "straight", label: "升级", content: "请给工单号、处理时限和升级渠道。处理不了就转上级。" },
    ],
    score: 30,
    trend: "cooling",
    note: "你对这套说辞的信任已经下降。先要可核对的工单和时限，别再反复解释。",
  },
  question: {
    subtext: "对方在要一个明确回应，但还留了余地。",
    emotion: "语气平稳，带一点试探。",
    intent: "想确认你的态度，再看下一步怎么走。",
    thoughts: "TA 会怎么答？先别把自己放太低，看 TA 认不认真。",
    nextLine: {
      content: "所以你怎么想？",
      confidence: "medium",
      reason: "如果你继续绕开重点，对方大概率会再问一次。",
    },
    readings: [
      { title: "在试探", explanation: "对方想确认你是否愿意认真回应。", likelihood: "high" },
      { title: "真的在问", explanation: "只是需要一个答案，没有太多隐含意思。", likelihood: "medium" },
      { title: "给最后一次机会", explanation: "如果这次没答清楚，对方可能会往后退。", likelihood: "low" },
    ],
    missingInfo: "看对方收到明确回答后，是继续追问，还是开始给具体安排。",
    replies: [
      { style: "gentle", label: "认真回", content: "我想一下再认真回你，不想敷衍你。" },
      { style: "humor", label: "别催", content: "让我组织一下语言，别急，我在。" },
      { style: "deadpan", label: "冷回应", content: "行。你问，我听着。" },
      { style: "straight", label: "给时限", content: "给我十分钟，我整理好就认真回你。" },
    ],
    score: 58,
    trend: "steady",
    note: "现在不适合继续绕。给一个明确态度，再看对方怎么接。",
  },
  warm: {
    subtext: "对方在主动递近，情绪是往上走的。",
    emotion: "语气放松，带一点亲近。",
    intent: "想拉近距离，看看你会不会接住。",
    thoughts: "今天心情不错，想找 TA 聊两句。看 TA 会不会接住。",
    nextLine: {
      content: "那你呢？",
      confidence: "medium",
      reason: "对方大概率会继续把话题递回给你。",
    },
    readings: [
      { title: "在靠近", explanation: "对方主动分享或关心，关系温度在上升。", likelihood: "high" },
      { title: "心情不错", explanation: "只是当下状态好，想找个人聊两句。", likelihood: "medium" },
      { title: "等你回应", explanation: "对方在看你是否愿意给出同等热度。", likelihood: "medium" },
    ],
    missingInfo: "看对方接下来会不会继续主动找你，还是只停在这一次。",
    replies: [
      { style: "gentle", label: "接住", content: "我看到啦，今天心情也被你带好了。" },
      { style: "humor", label: "顺着聊", content: "你这么一说，我今天的坏心情先下班了。" },
      { style: "deadpan", label: "冷接住", content: "收到。今天的好心情算你一半。" },
      { style: "straight", label: "往前一步", content: "我也挺开心的。晚点我们聊聊？" },
    ],
    score: 72,
    trend: "warming",
    note: "现在可以接住一点热度，但不用一下子把话说过满。",
  },
};

export function detectDemoPattern(message: string): DemoPattern {
  if (/我(?:的)?(?:朋友|同事|闺蜜|兄弟|姐妹|室友|同学|对象|前任)/.test(message)) {
    return "sharing";
  }
  if (/被骂|好累|加班|烦死|委屈|撑不住|扛不住|崩溃/.test(message)) {
    return "venting";
  }
  if (/别聊了|不聊了|别说了|不说了|到此为止|没什么好说的/.test(message)) {
    return "cutoff";
  }
  if (/处理不了|想想办法|亲[，,]|无法处理|不在.*范围|请您/.test(message)) {
    return "service";
  }
  if (/别人家|看看你|争气|对比|比较/.test(message)) {
    return "comparison";
  }
  if (/汇报|截止|尽快|交付|上线|工单|排期|需求变更/.test(message)) {
    return "urgency";
  }
  if (/没事|算了|你忙|自己去|不用|随便|呵呵/.test(message)) {
    return "withdrawal";
  }
  if (/忙|晚点|再说|改天|下次|有空|没空/.test(message)) {
    return "delay";
  }
  if (/[?？]/.test(message)) {
    return "question";
  }
  if (/喜欢|想你|在意|开心|晚安|想见|抱抱/.test(message)) {
    return "warm";
  }
  return "generic";
}
