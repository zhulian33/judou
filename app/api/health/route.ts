import { NextResponse } from "next/server";

import pkg from "@/package.json";
import { getBuildId } from "@/lib/build";

function appVersion(): string {
  return pkg.version ?? "0.0.0";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.OPENAI_API_KEY?.trim();
  const configured = Boolean(key && key !== "your_key_here");

  return NextResponse.json(
    {
      ok: true,
      build: getBuildId() || "dev",
      time: new Date().toISOString(),
      model: configured ? "configured" : "public-fallback",
      version: appVersion(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Judou-Build": getBuildId(),
      },
    },
  );
}
