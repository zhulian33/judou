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
