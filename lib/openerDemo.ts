import type { OpenerResult } from "@/lib/types";

import type { OpenerRequest } from "@/lib/openerPrompt";

const SCENE_OPENERS: Record<
  OpenerRequest["scene"],
  OpenerResult["options"]
> = {
  flirt: [
    {
      style: "gentle",
      label: "自然版",
      content: "突然想起你上次说的那件事，后来怎么样了？",
      whyItWorks: "从共同话题接上，不需要解释为什么突然联系。",
    },
    {
      style: "humor",
      label: "轻一点",
      content: "冒个泡。没急事，就是突然想起你了。",
      whyItWorks: "先把来意说轻，对方不会有被催的压力。",
    },
    {
      style: "straight",
      label: "直球版",
      content: "想找你聊两句。你方便的时候回我就行。",
      whyItWorks: "直接说明来意，又给了对方时间。",
    },
  ],
  work: [
    {
      style: "gentle",
      label: "自然版",
      content: "有个小事想跟你确认一下，不急，你方便时回我。",
      whyItWorks: "先说明不急，降低对方的压力。",
    },
    {
      style: "humor",
      label: "轻一点",
      content: "来冒个泡。不是催进度，是有个点想跟你对一下。",
      whyItWorks: "先排除“催活”的误解，再说明来意。",
    },
    {
      style: "straight",
      label: "直球版",
      content: "想跟你确认一件事。你今天什么时候方便聊五分钟？",
      whyItWorks: "给出具体时间范围，对方更容易安排。",
    },
  ],
  family: [
    {
      style: "gentle",
      label: "自然版",
      content: "想问问你最近怎么样。今晚有空的话，我们聊两句？",
      whyItWorks: "先关心近况，不直接进入说教或正事。",
    },
    {
      style: "humor",
      label: "轻一点",
      content: "来查个岗：最近吃得好吗？不是要跟你讲大道理。",
      whyItWorks: "用轻松方式降低对方的防御。",
    },
    {
      style: "straight",
      label: "直球版",
      content: "我有点事想跟你好好说，不是吵架。你今晚方便吗？",
      whyItWorks: "提前说明不是冲突，降低紧张感。",
    },
  ],
  service: [
    {
      style: "gentle",
      label: "自然版",
      content: "你好，想跟进一下之前的问题，麻烦帮我看下现在到哪一步了。",
      whyItWorks: "直接说明是跟进，不从头重复情绪。",
    },
    {
      style: "humor",
      label: "轻一点",
      content: "来问问进度。工单还在的话，麻烦帮我看看它走到哪了。",
      whyItWorks: "语气平，但把工单这个凭据点出来。",
    },
    {
      style: "straight",
      label: "直球版",
      content: "我想确认处理进度和下一步时间，麻烦给我一个明确回复。",
      whyItWorks: "诉求清楚，方便后续留痕。",
    },
  ],
  friend: [
    {
      style: "gentle",
      label: "自然版",
      content: "突然想起你，最近怎么样？",
      whyItWorks: "不突兀，也不需要对方立刻给长回复。",
    },
    {
      style: "humor",
      label: "轻一点",
      content: "冒个泡。没急事，就是突然想起你了。",
      whyItWorks: "先把来意说轻，对方不会被求助感压住。",
    },
    {
      style: "straight",
      label: "直球版",
      content: "最近怎么样？想跟你聊两句，你方便的时候回我就行。",
      whyItWorks: "直接说明想聊，又给了对方时间。",
    },
  ],
};

export function buildOpenerDemo(req: OpenerRequest): OpenerResult {
  const idea = req.idea.trim();
  return {
    read: `你想主动开口的是：「${idea.slice(0, 42)}${idea.length > 42 ? "…" : ""}」。`,
    options: SCENE_OPENERS[req.scene].map((option) => ({ ...option })),
    avoid: "别只发「在吗」或一上来连发几条，对方不知道你要说什么，会更难回。",
    timing: "如果对方白天忙，晚上八点后通常更容易接住闲聊。",
  };
}
