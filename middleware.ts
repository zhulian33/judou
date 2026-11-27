import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 阿里云函数计算的默认域名（*.fcapp.run）会给响应加 `Content-Disposition: attachment`，
 * 浏览器于是把页面当文件下载。这里显式声明 inline，争取让网关不要覆盖成下载。
 */
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Content-Disposition", "inline");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
