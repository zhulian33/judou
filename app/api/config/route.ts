import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 告诉前端当前是哪种模型模式：
 * - byok：部署方配了 Key，免费额度用完后需要用户自带 Key
 * - public：没配 Key，整体走公共兜底模型（有限流），不做硬性拦截
 */
export async function GET() {
  const key = process.env.OPENAI_API_KEY?.trim();
  const configured = Boolean(key && key !== "your_key_here");

  return NextResponse.json(
    {
      mode: configured ? "byok" : "public",
      freeLimit: 5,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
