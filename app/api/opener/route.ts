import { NextResponse } from "next/server";

import { buildOpenerDemo } from "@/lib/openerDemo";
import {
  buildOpenerPrompt,
  OPENER_SYSTEM_PROMPT,
  type OpenerRequest,
} from "@/lib/openerPrompt";
import { checkContentSafety } from "@/lib/safety";
import { isScene } from "@/lib/scenes";
import type {
  Gender,
  OpenerOption,
  OpenerResult,
  Scene,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Source = "configured" | "public" | "local";

function getConfiguredKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key !== "your_key_here" ? key : undefined;
}

function getEndpoint(): string {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
    .trim()
    .replace(/\/+$/, "");
  return base.endsWith("/chat/completions")
    ? base
    : `${base}/chat/completions`;
}

function getPublicEndpoint(): string {
  return (
    process.env.PUBLIC_MODEL_URL?.trim() ||
    "https://text.pollinations.ai/openai"
  );
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBody(body: unknown):
  | { ok: true; request: OpenerRequest }
  | { ok: false; status: number; error: string } {
  if (!isRecord(body)) {
    return { ok: false, status: 400, error: "请求格式不正确。" };
  }

  const idea = readString(body.idea);
  const context = readString(body.context);
  const memory = readString(body.memory);
  const contactName = readString(body.contactName);
  const gender = readString(body.gender) || "unknown";

  if (!idea) {
    return { ok: false, status: 400, error: "先说说你为什么想找对方。" };
  }
  if (idea.length > 600) {
    return { ok: false, status: 400, error: "想法请控制在 600 字以内。" };
  }
  if (context.length > 500) {
    return { ok: false, status: 400, error: "背景请控制在 500 字以内。" };
  }
  if (memory.length > 1200) {
    return { ok: false, status: 400, error: "历史记忆太长了。" };
  }
  if (contactName.length > 40) {
    return { ok: false, status: 400, error: "对象名称请控制在 40 字以内。" };
  }
  if (!["unknown", "female", "male"].includes(gender)) {
    return { ok: false, status: 400, error: "性别参数不正确。" };
  }
  if (!isScene(body.scene)) {
    return { ok: false, status: 400, error: "请选择一个有效的场景。" };
  }

  return {
    ok: true,
    request: {
      idea,
      scene: body.scene as Scene,
      context: context || undefined,
      memory: memory || undefined,
      gender: gender as Gender,
      contactName: contactName || undefined,
    },
  };
}

function extractContent(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    throw new Error("模型返回格式异常。");
  }

  const choice = payload.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message)) {
    throw new Error("模型没有返回内容。");
  }

  const content = choice.message.content;
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

  throw new Error("模型没有返回文本。");
}

async function requestModel(messages: ChatMessage[]): Promise<string> {
  const apiKey = getConfiguredKey();
  const usingConfigured = Boolean(apiKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(
      usingConfigured ? getEndpoint() : getPublicEndpoint(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: usingConfigured
            ? process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
            : process.env.PUBLIC_MODEL_NAME?.trim() || "openai",
          messages,
          temperature: 0.85,
          max_tokens: 900,
          ...(usingConfigured
            ? { response_format: { type: "json_object" } }
            : {}),
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );

    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`模型请求失败：${response.status} ${raw.slice(0, 200)}`);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error("模型返回了无法解析的内容。");
    }

    return extractContent(payload);
  } finally {
    clearTimeout(timer);
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

function normalizeOptions(value: unknown): OpenerOption[] | null {
  if (!Array.isArray(value) || value.length !== 3) {
    return null;
  }

  const expected = ["gentle", "humor", "straight"] as const;
  const options: OpenerOption[] = [];

  for (const [index, style] of expected.entries()) {
    const item = value[index];
    if (!isRecord(item) || readString(item.style) !== style) {
      return null;
    }

    const label = readString(item.label);
    const content = readString(item.content);
    const whyItWorks = readString(item.whyItWorks);

    if (!label || !content || !whyItWorks) {
      return null;
    }

    options.push({ style, label, content, whyItWorks });
  }

  return options;
}

function normalizeResult(value: unknown): OpenerResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const read = readString(value.read);
  const avoid = readString(value.avoid);
  const timing = readString(value.timing);
  const options = normalizeOptions(value.options);

  if (!read || !avoid || !options) {
    return null;
  }

  return {
    read,
    options,
    avoid,
    ...(timing ? { timing } : {}),
  };
}

function jsonResponse(
  body: OpenerResult | { error: string },
  status: number,
  source?: Source,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(source ? { "X-Judou-Source": source } : {}),
    },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "请求内容不是合法的 JSON。" }, 400);
  }

  const parsed = parseBody(body);
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error }, parsed.status);
  }

  const analysis = parsed.request;
  const safetyError = checkContentSafety(
    `${analysis.idea}\n${analysis.context ?? ""}`,
  );
  if (safetyError) {
    return jsonResponse({ error: safetyError }, 422);
  }

  const usingConfigured = Boolean(getConfiguredKey());
  const source: Source = usingConfigured ? "configured" : "public";
  const prompt = buildOpenerPrompt(analysis);

  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const messages: ChatMessage[] = [
        { role: "system", content: OPENER_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];
      if (attempt > 0) {
        messages.push({
          role: "user",
          content:
            "上一次输出没有通过结构校验。请只输出合法 JSON，options 固定 3 条，style 依次为 gentle、humor、straight，每条包含 label、content、whyItWorks，并包含 read、avoid。",
        });
      }

      const raw = await requestModel(messages);
      const result = normalizeResult(parseJsonObject(raw));
      if (result) {
        return jsonResponse(result, 200, source);
      }
    }

    if (!usingConfigured) {
      return jsonResponse(buildOpenerDemo(analysis), 200, "local");
    }

    return jsonResponse(
      { error: "这次没有想出稳定的开场，请再试一次。" },
      502,
    );
  } catch (error) {
    console.error("[句读] opener model failed:", error);
    if (!usingConfigured) {
      return jsonResponse(buildOpenerDemo(analysis), 200, "local");
    }
    return jsonResponse({ error: "开场建议服务暂时不可用。" }, 502);
  }
}
