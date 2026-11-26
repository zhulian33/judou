import { readFileSync } from "node:fs";
import path from "node:path";

let cachedBuildId: string | undefined;

/** 读取磁盘上的构建编号，供桌面端判断连到的服务是不是旧版本。 */
export function getBuildId(): string {
  if (cachedBuildId !== undefined) {
    return cachedBuildId;
  }

  try {
    cachedBuildId = readFileSync(
      path.join(process.cwd(), ".next", "BUILD_ID"),
      "utf8",
    ).trim();
  } catch {
    cachedBuildId = "";
  }

  return cachedBuildId;
}
