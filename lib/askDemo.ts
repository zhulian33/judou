import { getAlmanacData } from "@/lib/almanac";
import type { AskRequest, AskResult } from "@/lib/types";

type Topic = "meet" | "talk" | "work" | "money" | "rest" | "general";

const MEET_WORDS = /约|见面|出去|吃饭|咖啡|看电影|见面聊/;
const MEET_YI = /聚会|出行|会友|宴请|纳采|订婚|结婚|交易|开市/;
const TALK_WORDS = /说开|表白|道歉|解释|聊|沟通|表白|告白|和好|摊牌/;
const TALK_YI = /会友|祈福|祭祀|纳采|订婚|结婚|出行/;
const WORK_WORDS = /工作|汇报|辞职|面试|谈钱|开会|签|合同|项目/;
const WORK_YI = /开市|交易|立券|纳财|签约|上任|出行/;
const MONEY_WORDS = /钱|买|花|投资|消费|剁手|预算/;
const MONEY_JI = /开市|纳财|交易|立券/;

function pickTopic(question: string): Topic {
  if (MONEY_WORDS.test(question)) return "money";
  if (WORK_WORDS.test(question)) return "work";
  if (TALK_WORDS.test(question)) return "talk";
  if (MEET_WORDS.test(question)) return "meet";
  if (/累|休息|熬夜|睡|躺/.test(question)) return "rest";
  return "general";
}

const hasAny = (list: string[], words: RegExp) => list.some((item) => words.test(item));

/** 没有模型时，用今天的真实黄历数据拼一个不玄乎的回答。 */
export function buildAskDemo(req: AskRequest): AskResult {
  const almanac = getAlmanacData(req.date);
  const topic = pickTopic(req.question);
  const yiHit = hasAny(almanac.yi, topic === "money" ? MONEY_JI : MEET_YI);
  const talkHit = topic === "talk" && hasAny(almanac.yi, TALK_YI);
  const workHit = topic === "work" && hasAny(almanac.yi, WORK_YI);
  const jiHit = hasAny(almanac.ji, /破土|安葬|开市|动土|远行/);

  const basis = [
    `今日宜：${almanac.yi.slice(0, 3).join("、")}`,
    `今日忌：${almanac.ji.slice(0, 3).join("、")}`,
    `冲${almanac.chong.replace(/^冲/, "")}，${almanac.sha}`,
  ];

  let answer: string;
  switch (topic) {
    case "meet":
      answer = yiHit
        ? `今天适合见人，${almanac.yi.slice(0, 2).join("、")}都在这天。想约就约具体时间，别只说「有空吗」。`
        : `今天更适合把邀约说出来、把时间定下来，见面本身可以放到另一天。先问一句「周末哪顿方便」，比临时喊人稳。`;
      break;
    case "talk":
      answer = talkHit
        ? `今天适合把话说开。你先说自己的感受，再给对方留回应的时间，别一次把三个月的事都翻出来。`
        : `今天不太适合硬碰硬。想谈的事先写成三句话，等对方状态松一点再开口，效果会好很多。`;
      break;
    case "work":
      answer = workHit
        ? `今天适合推进要签字、要定下来的事。把结论和时间点先说，再补原因。`
        : `今天适合整理和准备，不适合仓促对外承诺。把材料备齐，明天再谈更稳。`;
      break;
    case "money":
      answer = `今天不适合冲动花钱，${almanac.ji.slice(0, 2).join("、")}都不太合适。想买的东西先放一天再看。`;
      break;
    case "rest":
      answer = `今天就按「${almanac.dayOfficerMeaning}」的节奏来：${almanac.summary}`;
      break;
    default:
      answer = `${almanac.summary} 真要动，就挑「${almanac.yi[0] ?? "出行"}」这类事做，别碰「${almanac.ji[0] ?? "开市"}」。`;
  }

  return {
    answer,
    basis,
    caution: jiHit
      ? `今天${almanac.sha}，重要的谈话或见面换个方向、换个时间会更顺。`
      : "黄历只是民俗参考，真正决定结果的还是你怎么说、什么时候说。",
  };
}

