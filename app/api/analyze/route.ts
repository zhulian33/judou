import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/rateLimit";

import { buildDemoResult } from "@/lib/demo";
import { buildPrompt, SYSTEM_PROMPT } from "@/lib/prompt";
import { buildGuidance } from "@/lib/guidance";
import { looksLikeNarration } from "@/lib/narration";
import { guessSubject, SUBJECT_LABEL } from "@/lib/subject";
import { checkContentSafety } from "@/lib/safety";
import { isScene } from "@/lib/scenes";
import type {
  AffectionInsight,
  AnalyzeRequest,
  GuidanceInsight,
  SubjectInsight,
  AnalyzeResult,
  ApiErrorBody,
  Gender,
  MyIntentInsight,
  NextLinePrediction,
  ReadingHypothesis,
  ReplyOption,
  ReplyStyle,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 500;
const MODEL_TIMEOUT_MS = 45_000;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ModelSource = "configured" | "public" | "local";

class ProviderError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}

function jsonResponse(
  body: AnalyzeResult | ApiErrorBody,
  status: number,
  source?: ModelSource,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(source ? { "X-Judou-Source": source } : {}),
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseRequestBody(body: unknown):
  | { ok: true; request: AnalyzeRequest }
  | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "请求格式不正确。" };
  }

  const message = readString(body.message);
  const myWords = readString(body.myWords);
  const context = readString(body.context);
  const memory = readString(body.memory);
  const gender = readString(body.gender) || "unknown";
  const contactName = readString(body.contactName);

  if (!message) {
    return { ok: false, error: "先把那条消息贴进来。" };
  }

  if (message.length >= MAX_MESSAGE_LENGTH) {
    return { ok: false, error: "消息太长了，请控制在 2000 字以内。" };
  }

  if (myWords.length > 600) {
    return { ok: false, error: "你自己的想法请控制在 600 字以内。" };
  }

  if (memory.length > 1200) {
    return { ok: false, error: "历史记忆太长了。" };
  }

  if (context.length > MAX_CONTEXT_LENGTH) {
    return { ok: false, error: "补充背景请控制在 500 字以内。" };
  }

  if (!["unknown", "female", "male"].includes(gender)) {
    return { ok: false, error: "对方性别参数不正确。" };
  }

  if (contactName.length > 40) {
    return { ok: false, error: "对象名称请控制在 40 字以内。" };
  }

  if (!isScene(body.scene)) {
    return { ok: false, error: "请选择一个有效的聊天场景。" };
  }

  return {
    ok: true,
    request: {
      message,
      scene: body.scene,
      myWords: myWords || undefined,
      context: context || undefined,
      memory: memory || undefined,
      gender: gender as Gender,
      contactName: contactName || undefined,
    },
  };
}

function getEndpoint(): string {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
    .trim()
    .replace(/\/+$/, "");

  return base.endsWith("/chat/completions")
    ? base
    : `${base}/chat/completions`;
}

function getConfiguredKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || key === "your_key_here") {
    return undefined;
  }
  return key;
}

function getPublicEndpoint(): string {
  return (
    process.env.PUBLIC_MODEL_URL?.trim() ||
    "https://text.pollinations.ai/openai"
  );
}

function extractContent(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    throw new ProviderError("模型返回格式异常。");
  }

  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new ProviderError("模型没有返回可用内容。");
  }

  const content = firstChoice.message.content;
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) =>
        isRecord(part) && typeof part.text === "string" ? part.text : "",
      )
      .join("");
  }

  throw new ProviderError("模型没有返回文本内容。");
}

async function requestCompletion(
  messages: ChatMessage[],
  useJsonMode = true,
): Promise<string> {
  const apiKey = getConfiguredKey();
  const usingConfiguredModel = Boolean(apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(
      usingConfiguredModel ? getEndpoint() : getPublicEndpoint(),
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: usingConfiguredModel
          ? process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
          : process.env.PUBLIC_MODEL_NAME?.trim() || "openai",
        messages,
        temperature: 0.85,
        max_tokens: 1800,
        ...(useJsonMode && usingConfiguredModel
          ? { response_format: { type: "json_object" } }
          : {}),
      }),
      signal: controller.signal,
      cache: "no-store",
      },
    );

    const raw = await response.text();

    if (!response.ok) {
      if (
        useJsonMode &&
        usingConfiguredModel &&
        response.status === 400 &&
        /response_format|json mode|json_object/i.test(raw)
      ) {
        return requestCompletion(messages, false);
      }

      console.error(
        `[句读] ${usingConfiguredModel ? "private" : "public"} model request failed: ${response.status} ${raw.slice(0, 500)}`,
      );

      if (response.status === 401 || response.status === 403) {
        throw new ProviderError("模型服务鉴权失败，请检查 OPENAI_API_KEY。");
      }
      if (response.status === 429) {
        throw new ProviderError("模型服务有点忙，请稍后再试。", 503);
      }

      throw new ProviderError("模型服务暂时不可用，请稍后再试。");
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new ProviderError("模型服务返回了无法解析的内容。");
    }

    return extractContent(payload);
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderError("模型思考超时了，请稍后再试。", 504);
    }
    console.error("[句读] model request error:", error);
    throw new ProviderError("连接模型服务失败，请检查网络或接口地址。");
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonObject(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
}

function normalizeReply(
  value: unknown,
  expectedStyle: ReplyStyle,
  requireAffectionBonus: boolean,
): ReplyOption | null {
  if (!isRecord(value)) {
    return null;
  }

  const style = readString(value.style);
  const label = readString(value.label);
  const content = readString(value.content);
  const whyItWorks = readString(value.whyItWorks);
  const bonusValue = value.affectionBonus;
  const affectionBonus =
    typeof bonusValue === "number" ? bonusValue : Number.NaN;

  if (
    style !== expectedStyle ||
    !label ||
    label.length > 20 ||
    !content ||
    content.length > 220
  ) {
    return null;
  }

  if (requireAffectionBonus) {
    if (
      !Number.isInteger(affectionBonus) ||
      affectionBonus < 0 ||
      affectionBonus > 20
    ) {
      return null;
    }
  }

  return {
    style: expectedStyle,
    label,
    content,
    ...(whyItWorks && whyItWorks.length <= 120 ? { whyItWorks } : {}),
    ...(requireAffectionBonus ? { affectionBonus } : {}),
  };
}

function normalizeNextLine(value: unknown): NextLinePrediction | null {
  if (!isRecord(value)) {
    return null;
  }

  const content = readString(value.content);
  const confidence = readString(value.confidence);
  const reason = readString(value.reason);

  if (
    !content ||
    content.length > 160 ||
    !["high", "medium", "low"].includes(confidence) ||
    !reason ||
    reason.length > 160
  ) {
    return null;
  }

  return {
    content,
    confidence: confidence as NextLinePrediction["confidence"],
    reason,
  };
}

function normalizeReadings(value: unknown): ReadingHypothesis[] | null {
  if (!Array.isArray(value) || value.length < 2 || value.length > 3) {
    return null;
  }

  const readings: ReadingHypothesis[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const title = readString(item.title);
    const explanation = readString(item.explanation);
    const likelihood = readString(item.likelihood);

    if (
      !title ||
      title.length > 24 ||
      !explanation ||
      explanation.length > 180 ||
      !["high", "medium", "low"].includes(likelihood)
    ) {
      return null;
    }

    readings.push({
      title,
      explanation,
      likelihood: likelihood as ReadingHypothesis["likelihood"],
    });
  }

  return readings;
}

function normalizeParticles(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const particles = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 4);

  return Array.from(new Set(particles)).slice(0, 8);
}

function normalizeMyIntent(value: unknown): MyIntentInsight | null {
  if (!isRecord(value)) {
    return null;
  }

  const read = readString(value.read);
  const adjustment = readString(value.adjustment);

  if (
    !read ||
    read.length > 160 ||
    !adjustment ||
    adjustment.length > 200
  ) {
    return null;
  }

  return { read, adjustment };
}

function normalizeAffection(value: unknown): AffectionInsight | null {
  if (!isRecord(value)) {
    return null;
  }

  const scoreValue = value.score;
  const score = typeof scoreValue === "number" ? scoreValue : Number.NaN;
  const trend = readString(value.trend);
  const note = readString(value.note);

  if (
    !Number.isInteger(score) ||
    score < 0 ||
    score > 100 ||
    !["warming", "steady", "cooling"].includes(trend) ||
    !note ||
    note.length > 220
  ) {
    return null;
  }

  return {
    score,
    trend: trend as AffectionInsight["trend"],
    note,
  };
}

function splitKeep(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value.map((item) => readString(item))
    : typeof value === "string"
      ? value.split(/[\n；;、]/).map((item) => item.trim())
      : [];

  return raw
    .map((item) => item.replace(/^[0-9一二三四五①-⑤.、)）\s-]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

/// 模型经常把结构写歪，这里尽量接住，实在缺再用已有分析补。
function normalizeGuidance(
  value: unknown,
  fallback: GuidanceInsight,
): GuidanceInsight {
  if (!isRecord(value)) {
    return fallback;
  }

  const read =
    readString(value.read) ||
    readString(value.summary) ||
    readString(value.state) ||
    fallback.read;
  const direction =
    readString(value.direction) ||
    readString(value.advice) ||
    readString(value.guidance) ||
    fallback.direction;
  const avoid =
    readString(value.avoid) ||
    readString(value.warning) ||
    readString(value.risk) ||
    fallback.avoid;
  const keep = splitKeep(value.keep ?? value.principles ?? value.tips);

  return {
    read,
    direction,
    keep: keep.length > 0 ? keep : fallback.keep,
    avoid,
  };
}

function normalizeSubject(
  value: unknown,
  fallback: SubjectInsight,
): SubjectInsight {
  if (!isRecord(value)) {
    return fallback;
  }

  const who = readString(value.who);
  if (who !== "me" && who !== "self" && who !== "third") {
    return fallback;
  }

  const label = readString(value.label) || SUBJECT_LABEL[who];
  return { who, label };
}

function normalizeResult(
  value: unknown,
  scene: AnalyzeRequest["scene"],
  hasMyWords: boolean,
  message: string,
  narration: boolean,
): AnalyzeResult | null {
  if (!isRecord(value) || !Array.isArray(value.replies)) {
    return null;
  }

  const subtext = readString(value.subtext);
  const emotion = readString(value.emotion);
  const intent = readString(value.intent);
  const risk = readString(value.risk);
  const thoughts = readString(value.thoughts)
    .replace(/^[（(]\s*内心\s*OS\s*[）)]\s*/i, "")
    .replace(/^[（(]\s*/, "")
    .replace(/\s*[）)]$/, "");
  const particles = normalizeParticles(value.particles) ?? [];
  const analysisConfidence = readString(value.analysisConfidence);
  const readings = normalizeReadings(value.readings);
  const missingInfo = readString(value.missingInfo);
  const myIntent = hasMyWords ? normalizeMyIntent(value.myIntent) : null;
  const nextLine = normalizeNextLine(value.nextLine);
  const affection =
    scene === "flirt" ? normalizeAffection(value.affection) : null;
  const trust =
    scene !== "flirt" ? normalizeAffection(value.trust) : null;

  if (
    !subtext ||
    !emotion ||
    !intent ||
    !risk ||
    !thoughts ||
    !["high", "medium", "low"].includes(analysisConfidence) ||
    !readings ||
    !missingInfo ||
    (hasMyWords && !myIntent) ||
    !nextLine ||
    (scene === "flirt" && !affection) ||
    (scene !== "flirt" && !trust) ||
    value.replies.length !== 4
  ) {
    return null;
  }

  const replyMap = new Map<string, unknown>();
  for (const reply of value.replies) {
    if (!isRecord(reply)) {
      return null;
    }
    const style = readString(reply.style);
    if (replyMap.has(style)) {
      return null;
    }
    replyMap.set(style, reply);
  }

  const requireAffectionBonus = scene === "flirt";
  const gentle = normalizeReply(
    replyMap.get("gentle"),
    "gentle",
    requireAffectionBonus,
  );
  const humor = normalizeReply(
    replyMap.get("humor"),
    "humor",
    requireAffectionBonus,
  );
  const deadpan = normalizeReply(
    replyMap.get("deadpan"),
    "deadpan",
    requireAffectionBonus,
  );
  const straight = normalizeReply(
    replyMap.get("straight"),
    "straight",
    requireAffectionBonus,
  );

  if (!gentle || !humor || !deadpan || !straight) {
    return null;
  }

  const guidance = normalizeGuidance(
    value.guidance,
    buildGuidance(scene, { subtext, emotion, intent, risk }),
  );
  const subject = narration
    ? { who: "third" as const, label: "你在讲这件事" }
    : normalizeSubject(value.subject, guessSubject(message));

  return {
    subtext,
    emotion,
    intent,
    risk,
    thoughts,
    particles,
    analysisConfidence:
      analysisConfidence as AnalyzeResult["analysisConfidence"],
    readings,
    missingInfo,
    ...(myIntent ? { myIntent } : {}),
    nextLine,
    ...(affection ? { affection } : {}),
    ...(trust ? { trust } : {}),
    guidance,
    subject,
    framing: narration ? "narration" : "received",
    replies: [gentle, humor, deadpan, straight],
  };
}

export async function POST(request: Request) {
  const limitResult = rateLimit(clientKey(request, "analyze"), 20);
  if (!limitResult.ok) {
    return NextResponse.json(
      { error: "太频繁了，休息一下再试。" },
      {
        status: 429,
        headers: { "Retry-After": String(limitResult.retryAfter) },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "请求内容不是合法的 JSON。" }, 400);
  }

  const parsed = parseRequestBody(body);
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error }, 400);
  }

  const analyzeRequest = parsed.request;
  const safetyError = checkContentSafety(
    `${analyzeRequest.message}\n${analyzeRequest.context ?? ""}`,
  );
  if (safetyError) {
    return jsonResponse({ error: safetyError }, 422);
  }

  const usingConfiguredModel = Boolean(getConfiguredKey());
  const source: ModelSource = usingConfiguredModel ? "configured" : "public";
  const narration = looksLikeNarration(analyzeRequest.message);
  const prompt = buildPrompt(analyzeRequest, { narration });
  let lastOutput = "";

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryInstruction =
        attempt === 0
          ? ""
          : `上一次输出没有通过结构校验。请重新只输出一个合法 JSON 对象，必须包含 subtext、emotion、intent、risk、thoughts、particles、analysisConfidence、2-3 条 readings、missingInfo、nextLine、guidance，以及按 gentle、humor、deadpan、straight 排列的 4 条 replies。用户提供了自己的话时还必须包含 myIntent。暧昧场景必须包含 affection，非暧昧场景必须包含 trust；暧昧场景每条回复带 0-20 的 affectionBonus。不要解释，不要 Markdown。`;

      const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];

      if (retryInstruction) {
        messages.push({ role: "user", content: retryInstruction });
      }

      lastOutput = await requestCompletion(messages);
      const result = normalizeResult(
        parseJsonObject(lastOutput),
        analyzeRequest.scene,
        Boolean(analyzeRequest.myWords),
        analyzeRequest.message,
        narration,
      );

      if (result) {
        return jsonResponse(result, 200, source);
      }
    }

    console.error(
      `[句读] invalid model output: ${lastOutput.slice(0, 500)}`,
    );

    if (!usingConfiguredModel) {
      return jsonResponse(buildDemoResult(analyzeRequest), 200, "local");
    }

    return jsonResponse(
      { error: "这次没有读出稳定的结果，请再试一次。" },
      502,
    );
  } catch (error) {
    if (!usingConfiguredModel) {
      console.error("[句读] public model failed, using local fallback:", error);
      return jsonResponse(buildDemoResult(analyzeRequest), 200, "local");
    }

    if (error instanceof ProviderError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    console.error("[句读] unexpected analyze error:", error);
    return jsonResponse({ error: "服务开小差了，请稍后再试。" }, 500);
  }
}
