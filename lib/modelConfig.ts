export type ModelSourceKind = "user" | "server" | "public";

export interface ModelConfig {
  key?: string;
  endpoint: string;
  model: string;
  source: ModelSourceKind;
}

function normalizeBase(base: string): string {
  const trimmed = base.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/chat/completions")
    ? trimmed
    : `${trimmed}/chat/completions`;
}

function envKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key !== "your_key_here" ? key : undefined;
}

/**
 * 优先用用户自己带的 Key（请求头），其次用部署方的 Key，最后退回公共兜底。
 * 用户 Key 只在这一次请求里用，不落盘、不打日志。
 */
export function resolveModel(request: Request): ModelConfig {
  const userKey = request.headers.get("x-judou-key")?.trim();
  const userBase = request.headers.get("x-judou-base")?.trim();
  const userModel = request.headers.get("x-judou-model")?.trim();

  if (userKey) {
    return {
      key: userKey,
      endpoint: normalizeBase(
        userBase || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      ),
      model: userModel || process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      source: "user",
    };
  }

  const serverKey = envKey();
  if (serverKey) {
    return {
      key: serverKey,
      endpoint: normalizeBase(
        process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      ),
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      source: "server",
    };
  }

  return {
    endpoint:
      process.env.PUBLIC_MODEL_URL?.trim() ||
      "https://text.pollinations.ai/openai",
    model: process.env.PUBLIC_MODEL_NAME?.trim() || "openai",
    source: "public",
  };
}
