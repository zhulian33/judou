import { getAlmanacData } from "@/lib/almanac";
import { buildChart, type ChartResult } from "@/lib/chart";
import type { AskRequest, AskResult } from "@/lib/types";

type Topic = "meet" | "talk" | "work" | "money" | "rest" | "unknowable" | "general";

const MEET_WORDS = /约|见面|出去|吃饭|咖啡|看电影|见面聊/;
const TALK_WORDS = /说开|表白|道歉|解释|沟通|告白|和好|摊牌|开口/;
const WORK_WORDS = /工作|汇报|辞职|面试|开会|签|合同|项目|客户/;
const MONEY_WORDS = /钱|买|花|投资|消费|剁手|预算/;

/** 别人心里怎么想、有没有别人——这些排盘根本算不出来，必须直说。 */
const UNKNOWABLE_WORDS =
  /(她|他|TA|对方|人家).*(喜欢|爱|想不想|会不会|还回|回来|复合|心动|有没有人)|有没有喜欢的人|喜不喜欢我|还爱不爱|会不会回来|能复合吗/;

function pickTopic(question: string): Topic {
  if (UNKNOWABLE_WORDS.test(question)) return "unknowable";
  if (MONEY_WORDS.test(question)) return "money";
  if (WORK_WORDS.test(question)) return "work";
  if (TALK_WORDS.test(question)) return "talk";
  if (MEET_WORDS.test(question)) return "meet";
  if (/累|休息|熬夜|睡|躺/.test(question)) return "rest";
  return "general";
}

const hasAny = (list: string[], words: RegExp) => list.some((item) => words.test(item));

function chartNote(chart: ChartResult | null): string {
  if (!chart) return "";
  const strong = chart.wuXing[0];
  const weak = chart.wuXing[chart.wuXing.length - 1];
  return `你的盘是${chart.dayMaster}${chart.dayMasterElement}日主，${strong.element}偏旺、${weak.element}偏弱——今天别硬顶，顺着来更省力。`;
}

/** 没有模型时，用今天的真实黄历 + 命盘拼一个不玄乎的回答。 */
export function buildAskDemo(req: AskRequest): AskResult {
  const almanac = getAlmanacData(req.date);
  const chart = req.birth ? buildChart(req.birth) : null;
  const topic = pickTopic(req.question);
  const yiHit = hasAny(almanac.yi, /聚会|出行|会友|宴请|纳采|订婚|结婚|交易|开市/);
  const jiHit = hasAny(almanac.ji, /破土|安葬|开市|动土/);

  const basis = [
    `今日日值：${almanac.dayOfficer}（${almanac.dayOfficerMeaning}）`,
    `今日宜：${almanac.yi.slice(0, 3).join("、")}`,
    chart ? `命盘：${chart.pillars}（日主${chart.dayMaster}）` : `冲${almanac.chong.replace(/^冲/, "")}，${almanac.sha}`,
  ];

  let answer: string;

  if (topic === "unknowable") {
    answer =
      "排盘看不出别人心里有没有人，也算不出她在想什么——这块我给不了答案，谁给你答案都是编的。" +
      `能看的是「今天你适不适合动」：今天是${almanac.dayOfficer}，${almanac.dayOfficerMeaning}，` +
      (yiHit
        ? "适合把该做的往前推一点。真想联系，就说一件具体的小事，别一开口就要答案。"
        : "不太适合逼进度。先把频率降下来，把话放轻，比现在追问更稳。");
  } else {
    switch (topic) {
      case "meet":
        answer = yiHit
          ? "今天适合见人、约人。想约就把时间说具体，别只问「有空吗」。"
          : "今天更适合先把邀约说出口、把时间定下来，见面放到另一天更顺。先问一句「周末哪顿方便」。";
        break;
      case "talk":
        answer = yiHit
          ? "今天适合把话说开：先讲你的感受，再给对方留回应的空间，别一次把三个月的事都翻出来。"
          : "今天不太适合硬碰硬。想谈的事先写成三句话，等对方状态松一点再开口。";
        break;
      case "work":
        answer = yiHit
          ? "今天适合推进要签字、要定下来的事。先给结论和时间点，再补原因。"
          : "今天适合整理和准备，不适合仓促对外承诺。材料备齐，明天再谈更稳。";
        break;
      case "money":
        answer = "今天别冲动花钱。想买的先放一天，明天还想要再买。";
        break;
      case "rest":
        answer = `今天就按「${almanac.dayOfficerMeaning}」的节奏来：${almanac.summary}`;
        break;
      default:
        answer = `${almanac.summary} 要给个方向的话：今天适合把已经开始的事往前推一点，不适合开新坑。`;
    }
  }

  const note = chartNote(chart);

  return {
    answer: note ? `${answer}${note}` : answer,
    basis,
    caution: jiHit
      ? `今天${almanac.sha}，重要的谈话或见面换个方向、换个时间会更顺。`
      : "黄历只是民俗参考，真正决定结果的还是你怎么说、什么时候说。",
  };
}
