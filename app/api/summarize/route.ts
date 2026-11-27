import { NextResponse } from "next/server";

import { resolveModel } from "@/lib/modelConfig";
import { clientKey, rateLimit } from "@/lib/rateLimit";

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




async function summarize(req: SummaryRequest, request: Request): Promise<SummaryResult | null> {
  const model = resolveModel(request);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(model.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(model.key ? { Authorization: `Bearer ${model.key}` } : {}),
      },
      body: JSON.stringify({
        model: model.model,
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
    const missing = readString(parsed.missing);
    const temperature = readString(parsed.temperature);
    const avoid = readString(parsed.avoid);
    const moves = Array.isArray(parsed.moves)
      ? parsed.moves.map((item) => readString(item)).filter(Boolean).slice(0, 3)
      : [];
    const points = Array.isArray(parsed.points)
      ? parsed.points.map((item) => readString(item)).filter(Boolean).slice(0, 4)
      : [];

    if (!core || !meaning || !advice || points.length === 0) {
      return null;
    }

    const rawEn = isRecord(parsed.en) ? parsed.en : null;
    const enCore = rawEn ? readString(rawEn.core) : "";
    const enPoints = rawEn && Array.isArray(rawEn.points)
      ? rawEn.points.map((item) => readString(item)).filter(Boolean).slice(0, 4)
      : [];
    const en = rawEn && enCore && enPoints.length > 0
      ? {
          core: enCore,
          points: enPoints,
          meaning: readString(rawEn.meaning),
          advice: readString(rawEn.advice),
          ...(readString(rawEn.temperature) ? { temperature: readString(rawEn.temperature) } : {}),
          ...(Array.isArray(rawEn.moves)
            ? { moves: rawEn.moves.map((item) => readString(item)).filter(Boolean).slice(0, 3) }
            : {}),
          ...(readString(rawEn.avoid) ? { avoid: readString(rawEn.avoid) } : {}),
          ...(readString(rawEn.missing) ? { missing: readString(rawEn.missing) } : {}),
        }
      : null;

    return {
      ...(subject ? { subject } : {}),
      core,
      points,
      meaning,
      advice,
      ...(temperature ? { temperature } : {}),
      ...(moves.length > 0 ? { moves } : {}),
      ...(avoid ? { avoid } : {}),
      ...(missing ? { missing } : {}),
      ...(en ? { en } : {}),
    };
  } catch (error) {
    console.error("[句读] summarize failed:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const limitResult = rateLimit(clientKey(request, "summarize"), 20);
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
    return NextResponse.json({ error: "请求内容不是合法的 JSON。" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const model = resolveModel(request);
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

  const modeled = await summarize(payload, request);
  const result = modeled ?? buildSummaryDemo(payload);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Judou-Source": modeled ? model.source : "local",
    },
  });
}

