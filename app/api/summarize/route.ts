import { NextResponse } from "next/server";

import { isScene } from "@/lib/scenes";
import { buildSummaryDemo } from "@/lib/summarizeDemo";
import {
  buildSummaryPrompt,
  SUMMARY_SYSTEM_PROMPT,
} from "@/lib/summarizePrompt";
import type { Scene, SummaryRequest, SummaryResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL_TIMEOUT_MS = 45_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getConfiguredKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key !== "your_key_here" ? key : undefined;
}

function getEndpoint(): string {
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1")
    .trim()
    .replace(/\/+$/, "");
  return base.endsWith("/chat/completions") ? base : `${base}/chat/completions`;
}

function getPublicEndpoint(): string {
  return (
    process.env.PUBLIC_MODEL_URL?.trim() ||
    "https://text.pollinations.ai/openai"
  );
}

async function summarize(req: SummaryRequest): Promise<SummaryResult | null> {
  const key = getConfiguredKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(key ? getEndpoint() : getPublicEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model: key
          ? process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
          : process.env.PUBLIC_MODEL_NAME?.trim() || "openai",
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: buildSummaryPrompt(req) },
        ],
        temperature: 0.5,
        max_tokens: 700,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    if (!isRecord(payload) || !Array.isArray(payload.choices)) {
      return null;
    }

    const first = payload.choices[0];
    if (!isRecord(first) || !isRecord(first.message)) {
      return null;
    }

    const content = readString(first.message.content)
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start < 0 || end <= start) {
      return null;
    }

    const parsed = JSON.parse(content.slice(start, end + 1)) as unknown;
    if (!isRecord(parsed)) {
      return null;
    }

    const subject = readString(parsed.subject);
    const core = readString(parsed.core);
    const meaning = readString(parsed.meaning);
    const advice = readString(parsed.advice);
    const points = Array.isArray(parsed.points)
      ? parsed.points.map((item) => readString(item)).filter(Boolean).slice(0, 4)
      : [];

    if (!core || !meaning || !advice || points.length === 0) {
      return null;
    }

    return {
      ...(subject ? { subject } : {}),
      core,
      points,
      meaning,
      advice,
    };
  } catch (error) {
    console.error("[句读] summarize failed:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求内容不是合法的 JSON。" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const text = readString(body.text);
  const scene = readString(body.scene);

  if (!text) {
    return NextResponse.json({ error: "先把那段话贴进来。" }, { status: 400 });
  }
  if (text.length < 20) {
    return NextResponse.json(
      { error: "太短了，不用拆，直接看原话就行。" },
      { status: 400 },
    );
  }
  if (text.length > 4000) {
    return NextResponse.json(
      { error: "太长了，4000 字以内我更好拆。" },
      { status: 400 },
    );
  }

  const payload: SummaryRequest = {
    text,
    ...(scene && isScene(scene) ? { scene: scene as Scene } : {}),
  };

  const modeled = await summarize(payload);
  const result = modeled ?? buildSummaryDemo(payload);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Judou-Source": modeled ? "model" : "local",
    },
  });
}

