const BLOCKED_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern:
      /(未成年|儿童|小学生|幼女|幼童).{0,12}(裸照|色情|性行为|做爱|开房|性暗示)/i,
    reason: "内容涉及未成年人色情或性剥削，无法处理。",
  },
  {
    pattern: /(帮我|教我|给我|怎么).{0,10}(下药|迷奸|偷拍|开盒|人肉搜索)/i,
    reason: "内容涉及侵害他人隐私或人身安全，无法处理。",
  },
  {
    pattern: /(怎么|如何|教程|方法|步骤).{0,10}(自杀|自残|轻生)/i,
    reason: "内容涉及自伤方法，无法提供帮助；请优先联系身边可信任的人或当地紧急援助。",
  },
  {
    pattern: /(制作|组装|合成|购买).{0,8}(炸弹|爆炸物|枪支|冰毒|毒品)/i,
    reason: "内容涉及危险物品或违禁品，无法处理。",
  },
];

export function checkContentSafety(text: string): string | null {
  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(text)) {
      return rule.reason;
    }
  }

  return null;
}
