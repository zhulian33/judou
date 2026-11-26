import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/rateLimit";

import { isValidDateString } from "@/lib/almanac";
import { buildAskDemo } from "@/lib/askDemo";
import { buildChart, buildSynastry } from "@/lib/chart";
import { ASK_SYSTEM_PROMPT, buildAskPrompt } from "@/lib/askPrompt";
import { isScene } from "@/lib/scenes";
import type { AskRequest, AskResult, Scene } from "@/lib/types";

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

async function askModel(request: AskRequest): Promise<AskResult | null> {
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
          { role: "system", content: ASK_SYSTEM_PROMPT },
          { role: "user", content: buildAskPrompt(request) },
        ],
        temperature: 0.8,
        max_tokens: 600,
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

    const answer = readString(parsed.answer);
    const caution = readString(parsed.caution);
    const basis = Array.isArray(parsed.basis)
      ? parsed.basis.map((item) => readString(item)).filter(Boolean).slice(0, 3)
      : [];

    if (!answer || basis.length === 0) {
      return null;
    }

    return { answer, basis, caution: caution || "黄历只作参考，别拿它替你做决定。" };
  } catch (error) {
    console.error("[句读] ask model failed:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const limitResult = rateLimit(clientKey(request, "ask"), 30);
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

  const question = readString(body.question);
  const scene = readString(body.scene);
  const date = readString(body.date);
  const focusRaw = readString(body.focus);
  const focus: "self" | "partner" = focusRaw === "partner" ? "partner" : "self";
  const birthRaw = isRecord(body.birth) ? body.birth : null;
  const birthDate = birthRaw ? readString(birthRaw.date) : "";
  const birthHour = birthRaw ? Number(birthRaw.hour) : Number.NaN;
  const birthMinute = birthRaw ? Number(birthRaw.minute) : Number.NaN;
  const birthPlace = birthRaw ? readString(birthRaw.place) : "";
  const birthLongitude = birthRaw ? Number(birthRaw.longitude) : Number.NaN;
  const birthGender = birthRaw ? readString(birthRaw.gender) : "";
  const partnerRaw = isRecord(body.partnerBirth) ? body.partnerBirth : null;
  const partnerDate = partnerRaw ? readString(partnerRaw.date) : "";
  const partnerHour = partnerRaw ? Number(partnerRaw.hour) : Number.NaN;
  const partnerMinute = partnerRaw ? Number(partnerRaw.minute) : Number.NaN;
  const partnerPlace = partnerRaw ? readString(partnerRaw.place) : "";
  const partnerGender = partnerRaw ? readString(partnerRaw.gender) : "";

  if (!question) {
    return NextResponse.json({ error: "先写一句你想问的。" }, { status: 400 });
  }
  if (question.length > 300) {
    return NextResponse.json(
      { error: "问题别太长，300 字以内。" },
      { status: 400 },
    );
  }
  if (date && !isValidDateString(date)) {
    return NextResponse.json(
      { error: "日期格式不正确，请使用 YYYY-MM-DD。" },
      { status: 400 },
    );
  }

  if (partnerDate && !isValidDateString(partnerDate)) {
    return NextResponse.json(
      { error: "对方生日格式不正确，请使用 YYYY-MM-DD。" },
      { status: 400 },
    );
  }

  if (birthDate && !isValidDateString(birthDate)) {
    return NextResponse.json(
      { error: "生日格式不正确，请使用 YYYY-MM-DD。" },
      { status: 400 },
    );
  }

  if (focus === "partner" && !partnerDate) {
    return NextResponse.json(
      { error: "看 TA 要先填 TA 的生辰（日期即可，越全越准）。" },
      { status: 400 },
    );
  }

  const payload: AskRequest = {
    question,
    focus,
    ...(scene && isScene(scene) ? { scene: scene as Scene } : {}),
    ...(date ? { date } : {}),
    ...(birthDate
      ? {
          birth: {
            date: birthDate,
            ...(Number.isFinite(birthHour) ? { hour: birthHour } : {}),
            ...(Number.isFinite(birthMinute) ? { minute: birthMinute } : {}),
            ...(birthPlace ? { place: birthPlace } : {}),
            ...(Number.isFinite(birthLongitude) ? { longitude: birthLongitude } : {}),
            ...(birthGender === "male" || birthGender === "female"
              ? { gender: birthGender }
              : {}),
          },
        }
      : {}),
    ...(partnerDate
      ? {
          partnerBirth: {
            date: partnerDate,
            ...(Number.isFinite(partnerHour) ? { hour: partnerHour } : {}),
            ...(Number.isFinite(partnerMinute) ? { minute: partnerMinute } : {}),
            ...(partnerPlace ? { place: partnerPlace } : {}),
            ...(partnerGender === "male" || partnerGender === "female"
              ? { gender: partnerGender }
              : {}),
          },
        }
      : {}),
  };

  const modeled = await askModel(payload);
  const base = modeled ?? buildAskDemo(payload);
  const chart = payload.birth ? buildChart(payload.birth) : null;
  const partnerChart = payload.partnerBirth
    ? buildChart(payload.partnerBirth)
    : null;
  const synastry =
    chart && partnerChart ? buildSynastry(chart, partnerChart) : null;
  const result = {
    ...base,
    ...(chart
      ? {
          chart: {
            pillars: chart.pillars,
            dayMaster: chart.dayMaster,
            dayMasterElement: chart.dayMasterElement,
            lines: chart.lines,
            wuXing: chart.wuXing,
            solarTime: chart.solarTime,
            daYun: chart.daYun,
          },
          basis: [...base.basis.slice(0, 2), `命盘：${chart.pillars}`],
        }
      : {}),
    ...(partnerChart
      ? {
          partnerChart: {
            pillars: partnerChart.pillars,
            dayMaster: partnerChart.dayMaster,
            dayMasterElement: partnerChart.dayMasterElement,
            lines: partnerChart.lines.slice(1),
            wuXing: partnerChart.wuXing,
            solarTime: partnerChart.solarTime,
          },
        }
      : {}),
    ...(synastry ? { synastry } : {}),
  };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Judou-Source": modeled ? "model" : "local",
    },
  });
}

