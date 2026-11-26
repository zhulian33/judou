/**
 * 判断用户贴进来的到底是一句「对方发来的消息」，
 * 还是他自己在讲一整件事（自述）。
 *
 * 典型自述：很长、一堆「我觉得/我想/我很」、同时在讲「她/他」。
 */
export function looksLikeNarration(message: string): boolean {
  const text = message.trim();
  if (text.length < 70) {
    return false;
  }

  const firstPerson =
    text.match(/我(?:觉得|想|很|也|真的|不知道|大概|会|感觉|是不是)/g)?.length ?? 0;
  const thirdPerson = /她|他|TA|对方/.test(text);
  const hasSelfState = /我很|我觉得|我不知道|我会想|我感觉/.test(text);

  return firstPerson >= 2 && thirdPerson && hasSelfState;
}
