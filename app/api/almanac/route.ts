import { NextResponse } from "next/server";

import {
  getAlmanacData,
  getShanghaiDate,
  isValidDateString,
} from "@/lib/almanac";
import { getBuildId } from "@/lib/build";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? getShanghaiDate();

  if (!isValidDateString(date)) {
    return NextResponse.json(
      { error: "日期格式不正确，请使用 YYYY-MM-DD。" },
      { status: 400 },
    );
  }

  return NextResponse.json(getAlmanacData(date), {
    headers: {
      "Cache-Control": "no-store",
      "X-Judou-Build": getBuildId(),
    },
  });
}
