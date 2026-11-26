import type { AnalyzeResult, Scene } from "@/lib/types";

export interface FewShotExample {
  scene: Scene;
  sceneLabel: string;
  message: string;
  myWords?: string;
  context?: string;
  result: AnalyzeResult;
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  {
    scene: "flirt",
    sceneLabel: "暧昧",
    message: "我们还是别聊了。",
    context: "前面聊了半小时，你连着问了三遍对方在干嘛。",
    result: {
      subtext: "TA 已经不耐烦了，想把这场对话关掉。",
      emotion: "语气是收口的，带着点累和距离感。",
      intent: "结束现在这段对话，不想再被追问。",
      risk: "这时候再解释、再追问、再发长段，只会让 TA 更想退开。",
      thoughts: "又来一条。算了，先停吧，我现在真不想回。",
      particles: [],
      analysisConfidence: "high",
      readings: [
        {
          title: "嫌烦了",
          explanation: "连着被追问，TA 的情绪已经到顶，只想先停下来。",
          likelihood: "high",
        },
        {
          title: "在降温",
          explanation: "不是彻底翻脸，但想用「别聊了」把距离重新拉开一点。",
          likelihood: "medium",
        },
        {
          title: "暂时没力气",
          explanation: "TA 这会儿状态不好，不想解释，也不想被安慰。",
          likelihood: "low",
        },
      ],
      missingInfo: "看 TA 之后会不会自己回来找你。会回来，是情绪；一直不回，是真的想退。",
      nextLine: {
        content: "先这样吧。",
        confidence: "medium",
        reason: "TA 会用一个更短的句子把话题彻底收掉，而不是再解释原因。",
      },
      guidance: {
        read: "TA 现在是在收场，不是欲擒故纵。情绪已经过头了。",
        direction:
          "这一轮先停手。别解释、别追问、别发长段，隔一天再按一件具体的小事重新开口；TA 愿意接就接，不接就别再连发。",
        keep: ["先停下，不再追问", "只发一条，不补第二条"],
        avoid: "现在追问「我怎么了」，等于把 TA 的耐心再压一次。",
      },
      affection: {
        score: 32,
        trend: "cooling",
        note: "热度在掉。现在唯一能加分的动作是给空间，不是解释。",
      },
      replies: [
        {
          style: "gentle",
          label: "收住",
          content: "行，那先不聊了。你忙你的，我不打扰。",
          whyItWorks: "顺着 TA 的决定收住，不再加压。",
          affectionBonus: 8,
        },
        {
          style: "humor",
          label: "轻收",
          content: "收到，我先退场。下次想聊了喊我。",
          whyItWorks: "把结束说得轻松一点，不追问，也不卑微。",
          affectionBonus: 6,
        },
        {
          style: "deadpan",
          label: "冷收",
          content: "好。那就到这。",
          whyItWorks: "短，态度清楚，不拉扯。",
          affectionBonus: 4,
        },
        {
          style: "straight",
          label: "留一句",
          content: "好，我不追问。等你愿意说的时候再说。",
          whyItWorks: "表明边界，也把主动权交回去。",
          affectionBonus: 7,
        },
      ],
    },
  },
  {
    scene: "flirt",
    sceneLabel: "暧昧",
    message: "我最近有点忙，晚点再说吧。",
    myWords: "我想说我没生气，但希望对方别一直用忙来敷衍。",
    context: "连续聊了两周，昨天还约了周末见面。",
    result: {
      subtext: "对方在把见面的节奏往后放，但还没把门关死。",
      emotion: "语气还客气，但热乎劲儿下去了。",
      intent: "先拉开一点距离，看你会不会追着问。",
      risk: "这会儿连发几条只会显得你更急。回一句轻的，把选择权递回去。",
      thoughts:
        "TA 会不会觉得我在敷衍？算了，先这么说，别把话说死，看 TA 会不会追问。",
      particles: ["吧"],
      analysisConfidence: "medium",
      readings: [
        {
          title: "在降速",
          explanation: "对方愿意保持礼貌，但暂时不想推进见面。",
          likelihood: "high",
        },
        {
          title: "真的忙",
          explanation: "最近确实有事情，只是懒得解释具体安排。",
          likelihood: "medium",
        },
        {
          title: "想收尾",
          explanation: "不想直接拒绝，所以用忙把对话慢慢放下。",
          likelihood: "low",
        },
      ],
      missingInfo:
        "看对方之后会不会主动给替代时间。愿意给具体时间，多是忙；一直不给，才更像在收尾。",
      myIntent: {
        read: "你想表达的是：我能理解你忙，但希望得到一点明确回应。",
        adjustment:
          "直接说「别敷衍」容易让对方防御，改成说具体感受和期待，更容易被接住。",
      },
      nextLine: {
        content: "嗯嗯，等我忙完这阵再说吧。",
        confidence: "medium",
        reason: "对方会保留余地，但不一定马上给具体时间。",
      },
      affection: {
        score: 42,
        trend: "cooling",
        note: "热度在往下走，但还没到底。现在回得轻一点，比追问更容易把局面拉回来。",
      },
      replies: [
        {
          style: "gentle",
          label: "留余地",
          content: "好，你先忙。等你空下来再约。",
          affectionBonus: 5,
          whyItWorks: "不追问，给对方退路。",
        },
        {
          style: "humor",
          label: "轻一点",
          content: "行，我先把这句话存着。你忙完记得来取。",
          affectionBonus: 9,
          whyItWorks: "有记忆点，但没有压迫感。",
        },
        {
          style: "deadpan",
          label: "冷一句",
          content: "行，我先把位置留着。你忙完想起来再说。",
          whyItWorks: "不追问，也不装作完全没在意。",
          affectionBonus: 7,
        },
        {
          style: "straight",
          label: "说清楚",
          content: "好，那你忙完告诉我，我们再定时间。",
          affectionBonus: 6,
          whyItWorks: "把球递回去，不委屈自己。",
        },
      ],
    },
  },
  {
    scene: "work",
    sceneLabel: "职场",
    message: "这个需求今天能给我吗？我明天要汇报。",
    myWords: "我想拒绝今天交，但不想把关系弄僵。",
    context: "对方是跨部门同事，需求是今天上午才发过来的。",
    result: {
      subtext: "对方怕明天汇报掉链子，想把这份确定感先要到你这里。",
      emotion: "语气有点急，但还没到翻脸。",
      intent: "拿到一个能对领导交代的明确承诺。",
      risk: "只回「尽量」大概率会被当成答应。范围和时间最好一次说清。",
      thoughts:
        "明天汇报不能出事，先把需求要到手，哪怕只是核心版。",
      particles: ["吗"],
      analysisConfidence: "high",
      readings: [
        {
          title: "怕交不了差",
          explanation: "对方的主要压力来自明天的汇报，需要你给一个明确承诺。",
          likelihood: "high",
        },
        {
          title: "流程太乱",
          explanation: "需求可能本来就没有排期，对方只是临时来救火。",
          likelihood: "medium",
        },
        {
          title: "试探底线",
          explanation: "对方在看你是否会无条件接下一个过急的时间点。",
          likelihood: "low",
        },
      ],
      missingInfo:
        "确认需求是谁定的、汇报具体几点、能否拆成核心版和完整版。",
      trust: {
        score: 58,
        trend: "steady",
        note: "合作基础还在，但临时加塞已经消耗了一点信任。把范围说清楚，比硬撑更加分。",
      },
      myIntent: {
        read: "你想表达的是：今天全量交付不现实，但愿意先帮你解决汇报。",
        adjustment:
          "如果只说「做不完」，容易被听成不配合。把能交付的范围和时点一起说。",
      },
      nextLine: {
        content: "主要是领导明天上午要看，你尽量吧。",
        confidence: "high",
        reason: "对方还会再强调一次紧迫性，试探能不能拿到更硬的承诺。",
      },
      replies: [
        {
          style: "gentle",
          label: "协作版",
          content:
            "今天先给你一版能用的核心部分，明天上午再补完整版，可以吗？",
          whyItWorks: "先解决对方的汇报焦虑，也保住你的交付节奏。",
        },
        {
          style: "humor",
          label: "缓冲版",
          content:
            "今天能给你能看的版本，明天给你能上台的版本。你要先救急还是先完美？",
          whyItWorks: "把选择说清楚，比含糊答应安全。",
        },
        {
          style: "deadpan",
          label: "干巴巴",
          content: "可以。今天先给你半成品，明天再补完整版。你先用着。",
          whyItWorks: "没抱怨，但把边界说清了。",
        },
        {
          style: "straight",
          label: "直球版",
          content:
            "今天 18:00 前给你第一版，完整版明天 10:00 前到。这个时间你能汇报吗？",
          whyItWorks: "时间、范围、确认点都给到了。",
        },
      ],
    },
  },
  {
    scene: "family",
    sceneLabel: "家庭",
    message: "你看看别人家的孩子，再看看你。",
    result: {
      subtext: "对方真正着急的是你的状态，只是话说成了比较。",
      emotion: "担心和火气混在一起。",
      intent: "让你快点稳定下来，但用了最不中听的方式。",
      risk: "如果马上顶回去，话会越说越重。先接住对方的担心，再谈自己的感受。",
      thoughts:
        "说这么重，TA 会不会又不高兴？但我也是真的着急。",
      particles: [],
      analysisConfidence: "medium",
      readings: [
        {
          title: "担心你",
          explanation: "对方真正想表达的是焦虑，只是用了比较这种伤人的方式。",
          likelihood: "high",
        },
        {
          title: "投射焦虑",
          explanation: "对方把自己的不安放到你身上，话说重了也未必意识到。",
          likelihood: "medium",
        },
        {
          title: "习惯控制",
          explanation: "对方习惯用比较推动你，不一定只是这一次着急。",
          likelihood: "low",
        },
      ],
      missingInfo:
        "看对方接下来是继续比较，还是愿意听你把具体计划和难处说完。",
      trust: {
        score: 62,
        trend: "steady",
        note: "关系底子还在，但这次比较让你不太舒服。先接住担心，再守边界。",
      },
      nextLine: {
        content: "我这么说还不是为了你好。",
        confidence: "high",
        reason: "对方大概率会把担心再解释一遍，但语气未必会软。",
      },
      replies: [
        {
          style: "gentle",
          label: "接住版",
          content:
            "我知道你担心我。但拿别人家孩子比较，我听着挺难受的，咱们换个说法聊。",
          whyItWorks: "先承认关心，再把不舒服说清楚。",
        },
        {
          style: "humor",
          label: "缓和版",
          content:
            "别人家孩子那么好，你认个干儿子吧，我负责给你做饭。",
          whyItWorks: "把火气岔开一点，但不否定对方的担心。",
        },
        {
          style: "deadpan",
          label: "冷接",
          content: "行，我这就去别人家排队，看还收不收。",
          whyItWorks: "把比较顶回去，但没有正面吵。",
        },
        {
          style: "straight",
          label: "边界版",
          content:
            "你担心我可以直接说，别拿别人跟我比。我也想听你觉得我该怎么做。",
          whyItWorks: "不顶撞，但把边界和沟通方式讲明白。",
        },
      ],
    },
  },
  {
    scene: "service",
    sceneLabel: "客服",
    message: "亲，这个问题我们这边处理不了哦，您再想想办法呢～",
    result: {
      subtext: "听起来是抱歉，其实是在把问题原样退给你。",
      emotion: "礼貌很足，责任很轻。",
      intent: "结束对话，避免升级到人工、赔付或投诉。",
      risk: "继续解释容易被绕圈。直接要工单号、处理人和时限。",
      thoughts:
        "先把标准话术说完，别留下赔付承诺，实在不行再转上级。",
      particles: ["哦", "呢"],
      analysisConfidence: "high",
      readings: [
        {
          title: "权限不够",
          explanation: "一线客服可能确实没有处理权限，只能先把你挡回去。",
          likelihood: "high",
        },
        {
          title: "控制成本",
          explanation: "公司在尽量避免赔付或升级，所以先给标准话术。",
          likelihood: "medium",
        },
        {
          title: "怕担责任",
          explanation: "客服个人不想留下承诺，宁愿把问题推回给你。",
          likelihood: "medium",
        },
      ],
      missingInfo:
        "确认订单和问题类型，并问清是否有工单、处理人和升级渠道。",
      trust: {
        score: 35,
        trend: "cooling",
        note: "你对这套说辞的信任已经下降。先要可核对的工单和时限，别再反复解释。",
      },
      nextLine: {
        content: "亲，这个确实不在我们的服务范围呢～",
        confidence: "high",
        reason: "对方会用更标准的话术再挡一次，试探你会不会算了。",
      },
      replies: [
        {
          style: "gentle",
          label: "按流程版",
          content:
            "理解你们有流程。麻烦帮我登记工单，也告诉我下一步谁联系我、什么时候联系。",
          whyItWorks: "不吵架，但把责任落回流程里。",
        },
        {
          style: "humor",
          label: "复读版",
          content: "好，那我也再想想办法：工单号先给我一下，我好找它。",
          whyItWorks: "轻轻把球推回去，重点还是要凭据。",
        },
        {
          style: "deadpan",
          label: "冷处理",
          content: "好的，我也再想想办法。工单号先给我，我好知道该想哪个。",
          whyItWorks: "语气平，诉求没丢。",
        },
        {
          style: "straight",
          label: "直球版",
          content:
            "请给我工单号、处理时限和升级渠道。处理不了就帮我转上级。",
          whyItWorks: "诉求明确，方便后面留痕。",
        },
      ],
    },
  },
  {
    scene: "friend",
    sceneLabel: "朋友",
    message: "没事，你忙你的，我自己去就行。",
    context: "本来约好一起去看展，我临时说要加班。",
    result: {
      subtext: "对方不是在报备行程，是在等你挽留一下。",
      emotion: "失望在往上冒，还没说破。",
      intent: "给你最后一次主动补位的机会。",
      risk: "只回「好的」很伤人，对方后面可能就不说了。先接情绪，再给安排。",
      thoughts:
        "算了，说多了也没用。就看 TA 会不会主动补一句。",
      particles: [],
      analysisConfidence: "medium",
      readings: [
        {
          title: "等你补救",
          explanation: "对方失望但还愿意给机会，想看你有没有主动行动。",
          likelihood: "high",
        },
        {
          title: "想静一静",
          explanation: "对方可能真的想自己消化一下，不希望被追着解释。",
          likelihood: "medium",
        },
        {
          title: "收回期待",
          explanation: "对方开始降低对你的期待，不准备继续争这件事。",
          likelihood: "low",
        },
      ],
      missingInfo:
        "看对方是否接受具体补偿。如果明确拒绝，就先尊重空间，不要连续追问。",
      trust: {
        score: 48,
        trend: "cooling",
        note: "对方还在意这段关系，但这句「没事」已经是在扣分。先把行动补上。",
      },
      nextLine: {
        content: "算了，没事。",
        confidence: "high",
        reason: "对方不会马上把失望说透，但会用更短的话结束对话。",
      },
      replies: [
        {
          style: "gentle",
          label: "补救版",
          content: "我知道你有点失望。是我临时变卦，今晚我去找你，咱们补上。",
          whyItWorks: "先把责任接住，再给具体行动。",
        },
        {
          style: "humor",
          label: "认错版",
          content: "别自己去，带上我。我负责拎包和认错，你负责别生气。",
          whyItWorks: "有点服软，也把见面重新约回来。",
        },
        {
          style: "deadpan",
          label: "记一笔",
          content: "知道了。我给自己记一笔，下次你也别想跑。",
          whyItWorks: "不闹，但把在意说出来了。",
        },
        {
          style: "straight",
          label: "直球版",
          content: "我听出来你不高兴了。是我爽约，我补：今晚我请你吃饭。",
          whyItWorks: "不绕弯，承认问题并给补偿。",
        },
      ],
    },
  },
];

export function getFewShot(scene: Scene): FewShotExample {
  return (
    FEW_SHOT_EXAMPLES.find((example) => example.scene === scene) ??
    FEW_SHOT_EXAMPLES[0]
  );
}
