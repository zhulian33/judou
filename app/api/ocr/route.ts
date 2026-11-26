import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function jsonResponse(
  body:
    | {
        text: string;
        lines: string[];
        blocks: Array<{
          text: string;
          left: number;
          top: number;
          width: number;
        }>;
      }
    | { error: string },
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: "图片上传失败，请重新选择。" }, 400);
  }

  const image = formData.get("image");
  if (!(image instanceof Blob)) {
    return jsonResponse({ error: "没有收到图片。" }, 400);
  }
  if (!image.type.startsWith("image/")) {
    return jsonResponse({ error: "只支持 JPG、PNG 或 WebP 图片。" }, 400);
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return jsonResponse({ error: "图片太大了，请控制在 8MB 以内。" }, 400);
  }

  const apiKey = process.env.OCR_SPACE_API_KEY?.trim() || "helloworld";
  const payload = new FormData();
  payload.append("apikey", apiKey);
  payload.append("language", "chs");
  payload.append("isOverlayRequired", "true");
  payload.append("OCREngine", "2");
  payload.append("scale", "true");
  payload.append("file", image, "chat-screenshot.png");

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: payload,
      cache: "no-store",
    });
    const raw = await response.text();

    if (!response.ok) {
      console.error(`[句读] OCR failed: ${response.status} ${raw.slice(0, 400)}`);
      return jsonResponse({ error: "截图识别服务暂时不可用。" }, 502);
    }

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return jsonResponse({ error: "截图识别返回了异常内容。" }, 502);
    }

    if (
      typeof data !== "object" ||
      data === null ||
      (data as { IsErroredOnProcessing?: boolean }).IsErroredOnProcessing
    ) {
      const message =
        (data as { ErrorMessage?: string[] | string } | null)?.ErrorMessage;
      const detail = Array.isArray(message) ? message.join("；") : message;
      return jsonResponse(
        { error: detail || "没有识别出文字，请换一张清楚的截图。" },
        422,
      );
    }

    const results = (data as {
      ParsedResults?: Array<{
        ParsedText?: string;
        TextOverlay?: {
          Lines?: Array<{
            LineText?: string;
            Words?: Array<{
              Left?: number;
              Top?: number;
              Width?: number;
            }>;
          }>;
        };
      }>;
    }).ParsedResults;
    const text = (results ?? [])
      .map((item) => item.ParsedText ?? "")
      .join("\n")
      .replace(/\r/g, "")
      .trim();
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          Boolean(line) &&
          !line.startsWith("[Note:") &&
          !line.includes("demo key"),
      )
      .slice(0, 80);
    const cleanedText = lines.join("\n");
    const blocks = (results?.[0]?.TextOverlay?.Lines ?? [])
      .map((line) => {
        const text = (line.LineText ?? "").trim();
        if (
          !text ||
          text.startsWith("[Note:") ||
          text.includes("demo key")
        ) {
          return null;
        }

        const words = line.Words ?? [];
        const left = Math.min(
          ...words.map((word) => Number(word.Left ?? 0)),
        );
        const top = Math.min(
          ...words.map((word) => Number(word.Top ?? 0)),
        );
        const right = Math.max(
          ...words.map((word) => Number(word.Left ?? 0) + Number(word.Width ?? 0)),
        );

        return {
          text,
          left: Number.isFinite(left) ? left : 0,
          top: Number.isFinite(top) ? top : 0,
          width: Number.isFinite(right - left) ? right - left : 0,
        };
      })
      .filter((block): block is NonNullable<typeof block> => Boolean(block));

    if (!cleanedText) {
      return jsonResponse(
        { error: "没有识别出文字，试试更清晰、没有遮挡的聊天截图。" },
        422,
      );
    }

    return jsonResponse(
      {
        text: cleanedText.slice(0, 2000),
        lines,
        blocks,
      },
      200,
    );
  } catch (error) {
    console.error("[句读] OCR request error:", error);
    return jsonResponse({ error: "截图识别失败，请稍后再试。" }, 502);
  }
}
