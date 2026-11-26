import type { ExampleMessage } from "@/lib/types";

export const EXAMPLE_MESSAGES: ExampleMessage[] = [
  {
    scene: "flirt",
    label: "暧昧降温",
    message: "我最近有点忙，晚点再说吧。",
    context: "连续聊了两周，昨天还约了周末见面。",
  },
  {
    scene: "work",
    label: "临时催活",
    message: "这个需求今天能给我吗？我明天要汇报。",
    context: "对方是跨部门同事，需求是今天上午才发过来的。",
  },
  {
    scene: "family",
    label: "熟悉的比较",
    message: "你看看别人家的孩子，再看看你。",
  },
  {
    scene: "service",
    label: "标准话术",
    message: "亲，这个问题我们这边处理不了哦，您再想想办法呢～",
  },
  {
    scene: "friend",
    label: "嘴上没事",
    message: "没事，你忙你的，我自己去就行。",
    context: "本来约好一起去看展，我临时说要加班。",
  },
];

export const OPENER_EXAMPLES: ExampleMessage[] = [
  {
    scene: "flirt",
    label: "想重新联系",
    message: "想找对方聊两句，但怕太突然，也怕显得我一直在等。",
    context: "之前聊得不错，但最近几天没怎么说话。",
  },
  {
    scene: "work",
    label: "想问进度",
    message: "想跟进一下之前那个合作，但不想一开口就像在催。",
  },
  {
    scene: "family",
    label: "想好好聊",
    message: "想跟家里认真聊一次，但不想一开口就吵起来。",
  },
  {
    scene: "friend",
    label: "想约见面",
    message: "想约对方出来吃饭，但怕对方觉得我只是临时想起。",
    context: "上次见面已经是两个月前了。",
  },
  {
    scene: "service",
    label: "想催处理",
    message: "想再问一下客服处理进度，但不想重复说一遍情绪。",
  },
];
