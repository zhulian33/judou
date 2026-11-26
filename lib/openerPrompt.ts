import { buildKnowledgeBrief } from "@/lib/knowledge";
import { getSceneOption } from "@/lib/scenes";
import type { Gender, Scene } from "@/lib/types";

export interface OpenerRequest {
  idea: string;
  scene: Scene;
  context?: string;
  memory?: string;
  gender?: Gender;
  contactName?: string;
}

export const OPENER_SYSTEM_PROMPT = `你是「句读」，一个很会帮人自然开口的中文助手。
你的任务不是教用户套路，而是根据用户真实想说的话和关系背景，给出不突兀、不发怵、能直接发出去的开口方式。
你只输出一个 JSON 对象，不输出 Markdown、解释、前后缀或代码围栏。`;

export function buildOpenerPrompt(req: OpenerRequest): string {
  const scene = getSceneOption(req.scene);
  const gender =
    req.gender === "female"
      ? "女性。可自然使用「她」，但不要按性别做性格推断。"
      : req.gender === "male"
        ? "男性。可自然使用「他」，但不要按性别做性格推断。"
        : "未提供。不要猜性别，统一用「对方」或「TA」。";

  return `用户想主动找对方，但不知道怎么开口。请根据用户的想法、场景和对象资料，给出 3 种可以直接发的开场。

## 场景
${scene.label}（${scene.id}）
${buildKnowledgeBrief(req.scene)}

## 对象资料
称呼：${req.contactName?.trim() || "未提供"}
性别：${gender}
补充背景：${req.context?.trim() || "无"}
最近记忆：${req.memory?.trim() || "无"}

## 用户想开口的原因 / 想说的话
<idea>
${req.idea.trim()}
</idea>

## 输出规则
- 只输出 JSON。
- 先写一句 read：用清楚、自然的话复述用户真正想做什么，不照抄原句。
- options 固定 3 条，style 按 gentle、humor、straight 排列。
- gentle：自然、不突兀、给对方退路。
- humor：轻松但不油腻，可以有一点冷幽默。
- straight：直接说明来意，不绕圈子，也不施压。
- 每条 15-50 个汉字，最多两句话，必须能直接复制发送。
- 不使用「在吗」「睡了吗」「有空吗」作为开头，除非用户明确要求。
- 不要一上来长篇解释、道歉或连发问题。
- avoid 写一条最常见的错误开场，像朋友提醒。
- timing 可选，写一个具体的发送时机建议。
- 全中文，简体字；不要星座、命理或性格定性。

输出结构：
{
  "read": "你真正想做的是……",
  "options": [
    {
      "style": "gentle",
      "label": "2-5 字小标题",
      "content": "可直接发送的开口",
      "whyItWorks": "为什么这句不突兀，1 句"
    },
    {
      "style": "humor",
      "label": "2-5 字小标题",
      "content": "可直接发送的轻松开口",
      "whyItWorks": "为什么这句不突兀，1 句"
    },
    {
      "style": "straight",
      "label": "2-5 字小标题",
      "content": "可直接发送的直球开口",
      "whyItWorks": "为什么这句不突兀，1 句"
    }
  ],
  "avoid": "别这样开口：……",
  "timing": "什么时候发更自然"
}

## 示例
场景：朋友；想法：想重新联系，但怕尴尬。
{
  "read": "你想重新打开话题，但不想让对方觉得你有事才来找。",
  "options": [
    {
      "style": "gentle",
      "label": "自然版",
      "content": "突然想起你上次说的那家店，后来去了吗？",
      "whyItWorks": "从共同话题自然接上，不需要解释为什么突然联系。"
    },
    {
      "style": "humor",
      "label": "轻一点",
      "content": "冒个泡。没急事，就是突然想起你了。",
      "whyItWorks": "先把来意说轻，对方不会有被求助的压力。"
    },
    {
      "style": "straight",
      "label": "直球版",
      "content": "最近怎么样？想跟你聊两句，你方便的时候回我就行。",
      "whyItWorks": "直接说明想聊，又给了对方时间。"
    }
  ],
  "avoid": "别只发「在吗」，对方不知道你要说什么，会更难回。",
  "timing": "晚上八点后通常更容易接住闲聊。"
}`;
}
