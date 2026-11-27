#!/usr/bin/env node
/**
 * 一键重新截图：把网页和桌面小组件的展示图输出到 preview/。
 *
 * 用法：
 *   node scripts/capture-screenshots.mjs            # 自动起服务、自动截图
 *   BASE_URL=http://127.0.0.1:3211 node scripts/capture-screenshots.mjs
 *
 * 依赖：本机装了 Chrome（/Applications/Google Chrome.app）。
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "preview");
const PORT = Number(process.env.PORT || 4390);
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const CDP_PORT = Number(process.env.CDP_PORT || 9421);

const ENGLISH_TEXT =
  "These figures had fallen to 2 and 5 W, respectively. Despite this decline, Australia remained considerably higher than Canada. Overall, the chart compares four countries over a ten-year period.";

const LONG_TEXT =
  "她好像对我开始冷了 就是好像她觉得影响到她了 现在连正常微信聊天都会有点冷了…我感觉到她在刻意保持距离 接下来我不知道该如何了 因为我想着还是朋友的 只是感觉她好像有点被我压力到了 可是我真的也没做啥 也可能是她本身忙 我今天不小心刷到她动态了 我真的没有想到她其实很敏感很内耗 甚至我觉得我没有办法太托住她的情绪 我也大概了解为什么你说我们两个都很像了 确实 一样高敏 一样喜欢狗 一样有的时候很悲观 一样防备心重";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function startServer() {
  if (process.env.BASE_URL) return null;
  const useBuild = existsSync(path.join(ROOT, ".next", "BUILD_ID"));
  const cmd = useBuild
    ? ["node", ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)]]
    : ["node", ["node_modules/next/dist/bin/next", "dev", "-p", String(PORT)]];
  const child = spawn(cmd[0], cmd[1], {
    cwd: ROOT,
    stdio: "ignore",
    detached: false,
  });
  console.log(`[截图] 启动本地服务 ${BASE}（${useBuild ? "production" : "dev"}）`);
  return child;
}

async function waitForServer(timeoutMs = 40000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/health`, { cache: "no-store" });
      if (res.ok) return true;
    } catch {
      // 继续等
    }
    await sleep(700);
  }
  return false;
}

class Cdp {
  constructor(wsUrl) {
    this.id = 0;
    this.pending = new Map();
    this.ws = new WebSocket(wsUrl);
    this.ready = new Promise((resolve) =>
      this.ws.addEventListener("open", () => resolve()),
    );
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id)(msg.result);
        this.pending.delete(msg.id);
      }
    });
  }

  send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++this.id;
      this.pending.set(id, resolve);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return result?.result?.value;
  }

  async shot(file, { width, height, fullPage = true }) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 620,
    });
    const { data } = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: fullPage,
    });
    writeFileSync(path.join(OUT, file), Buffer.from(data, "base64"));
    console.log(`[截图] preview/${file}`);
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const server = startServer();
  const ok = await waitForServer();
  if (!ok) {
    console.error("[截图] 服务没起来，先执行 npm run build");
    server?.kill();
    process.exit(1);
  }

  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${path.join(ROOT, ".screenshot-profile")}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    await sleep(2500);
    const targets = await (
      await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
    ).json();
    const page = targets.find((t) => t.type === "page");
    const cdp = new Cdp(page.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send("Page.enable");

    // 1. 首页（移动端）
    await cdp.send("Page.navigate", { url: `${BASE}/` });
    await sleep(2500);
    await cdp.shot("home-mobile.png", { width: 430, height: 932 });

    // 2. 提炼结果
    await cdp.evaluate(`
      (() => {
        const ta = document.querySelector('textarea');
        const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        set.call(ta, ${JSON.stringify(LONG_TEXT)});
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      })()
    `);
    await sleep(500);
    await cdp.evaluate(`
      (() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('提炼这段'));
        btn?.click();
        return !!btn;
      })()
    `);
    await sleep(14000);
    await cdp.shot("summary-mobile.png", { width: 430, height: 932 });

    // 2.1 英文原文 + 双语切换
    await cdp.evaluate(`
      (() => {
        const ta = document.querySelector('textarea');
        const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        set.call(ta, ${JSON.stringify("ENGLISH_TEXT_PLACEHOLDER")});
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      })()
    `.replace('"ENGLISH_TEXT_PLACEHOLDER"', JSON.stringify(ENGLISH_TEXT)));
    await sleep(500);
    await cdp.evaluate(`
      (() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('提炼这段') || b.textContent.includes('重新提炼'));
        btn?.click();
        return !!btn;
      })()
    `);
    await sleep(14000);
    await cdp.evaluate(`
      (() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'EN');
        btn?.click();
        return !!btn;
      })()
    `);
    await sleep(600);
    await cdp.shot("summary-en-mobile.png", { width: 430, height: 932 });

    // 3. 先知（带生辰与合盘）
    await cdp.evaluate(`
      localStorage.setItem('judou.birth.v1', JSON.stringify({date:'2006-03-28', time:'10:25', place:'太原', gender:'female'}));
      localStorage.setItem('judou.partner.v1', JSON.stringify({date:'2005-10-19', time:'12:30', place:'太原', gender:'male'}));
      true
    `);
    await cdp.send("Page.reload");
    await sleep(2500);
    await cdp.evaluate(`
      (() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '先知');
        btn?.click();
        return !!btn;
      })()
    `);
    await sleep(1000);
    await cdp.evaluate(`
      (() => {
        const ta = document.querySelector('textarea');
        const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        set.call(ta, '我们俩合不合？');
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      })()
    `);
    await sleep(400);
    await cdp.evaluate(`
      (() => {
        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('问先知'));
        btn?.click();
        return !!btn;
      })()
    `);
    await sleep(14000);
    await cdp.shot("ask-mobile.png", { width: 430, height: 932 });

    // 4. 桌面小组件（窄 / 宽）
    await cdp.evaluate(`
      localStorage.setItem('judou.account.v1', JSON.stringify({nickname:'阿连', createdAt: Date.now()}));
      true
    `);
    await cdp.send("Page.navigate", { url: `${BASE}/widget` });
    await sleep(2500);
    await cdp.shot("widget.png", { width: 400, height: 900 });
    await cdp.shot("widget-wide.png", { width: 900, height: 640 });

    console.log("[截图] 完成，文件在 preview/");
  } finally {
    chrome.kill();
    server?.kill();
  }
}

main().catch((error) => {
  console.error("[截图] 失败：", error);
  process.exit(1);
});
