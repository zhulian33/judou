/**
 * 构建编号：桌面端用它判断连到的服务是不是旧版本。
 * 优先读环境变量，读不到再退回磁盘上的 .next/BUILD_ID（本地 next start 场景）。
 * 这样在 Vercel / EdgeOne 这类没有本地磁盘的运行环境里也能用。
 */
let cached: string | undefined;

export function getBuildId(): string {
  if (cached !== undefined) {
    return cached;
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_BUILD_ID?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim().slice(0, 7) ||
    "";

  if (fromEnv) {
    cached = fromEnv;
    return cached;
  }

  try {
    // 只在 Node 环境里做，且失败就当作没有
    const requireFn = eval("require") as NodeRequire;
    const fs = requireFn("node:fs") as typeof import("node:fs");
    const path = requireFn("node:path") as typeof import("node:path");
    cached = fs
      .readFileSync(path.join(process.cwd(), ".next", "BUILD_ID"), "utf8")
      .trim();
  } catch {
    cached = "";
  }

  return cached;
}
