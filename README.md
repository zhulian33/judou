# 句读JUDOU · 不会回的消息，我帮你读懂

> 原型开发中 · 当前版本用于体验和测试

粘贴一条看不懂、不会回的消息，或直接说你为什么想找对方。句读会结合场景和对象资料，给出内心 OS、下一句预测和可直接发送的话。

## 功能
- 只做分析，不给现成回复：潜台词、语气、2–3 种可能、判断可信度、还缺什么信息
- 内心 OS：先显示对方可能在心里的原话，再预测下一句
- 语气助词：识别「吧、呢、啊、嘛、哦」等真实出现的语气词
- 个人意图：可以填“我自己想怎么回”，句读会顺着你的立场改，不擅自换立场
- 主动开口：想找对方但不知道怎么开口时，根据你的想法和场景给 3 种开场
- 暧昧好感：当前好感度、趋势，以及每条回复的「好感加成」
- 关系信任：非暧昧场景显示信任度/配合度和趋势
- 指导方向：对方现在的落点、该往哪走、要守住什么、先别做什么（不写可直接发送的台词）
- 电子黄历：真实日期、农历、宜忌、冲煞、五行、吉位、学习/沟通/钱三块建议
- 桌面小组件：默认就是展开的详细黄历，底部并排「发一句」（主动开口）和「回一句」（解读回复）
- 桌面窗口可自由缩放；窗口变宽后会自动切换横向排版
- 多对象库：对象名称、关系、性别、备注存在本机，切换对象自动带资料
- 对话记忆：每个对象保存最近 5 次分析摘要，下次自动作为上下文参考
- 性别保护：不填性别时全程使用「对方 / TA」，不会根据名字或语气乱猜
- 黑白界面：默认黑白，好感度/信任度越高，背景色越明显
- 场景预设：暧昧 / 职场 / 家庭 / 客服 / 朋友
- 一键复制回复

> 电子黄历只做传统民俗参考，不构成命理或关系决策建议。

## 电子黄历与注册
- 黄历数据由 `lunar-javascript` 计算，不依赖外部黄历接口
- 所有展示文案为简体中文
- 注册是本机体验注册，数据保存在浏览器 `localStorage`
- 正式上线时可将注册逻辑替换成真实账号接口
- 主页面不再展示黄历，黄历只在桌面小组件里出现

## 桌面小组件
```bash
# 方式一：双击
./启动桌面黄历.command

# 方式二：构建后直接打开
npm run build          # 首次使用先构建一次，启动更快更稳
zsh desktop-widget/build-app.sh
open "desktop-widget/句读桌面黄历.app"
```

打开就是完整黄历，不再需要点“展开”。窗口可自由拖动、缩放；宽度超过 620 后自动切成左右两栏。

底部两个按钮：
- **发一句**（黑底）：想找对方但不知道怎么说，输入你的想法，给 3 种开场
- **回一句**（白底黑字）：贴对方的话进来，先给内心 OS 和下一句，再给 3 种回法

桌面端名称是 **句读JUDOU**，图标为「逗号」标志。

小组件的启动逻辑：
- 先检查 `127.0.0.1:3211`、`4321` 上有没有可用的句读服务，并且核对构建号，避免连到旧版本
- 两个端口都不通时，自己在空闲端口拉起 `next start`（没有构建则回落 `next dev`）
- 端口被别的程序占用会自动换下一个端口，不会再出现两个实例抢端口
- 同一时间只允许运行一个句读桌面实例，重复双击会直接把已有窗口调到前面

### 桌面端显示「句读没有启动」
1. 点页面上的“重新连接”；
2. 确认电脑装了 Node.js：`node -v`；
3. 终端进项目目录执行 `npm install && npm run build`；
4. 还不行就看日志：`/tmp/judou-widget-3211.log` 或 `/tmp/judou-widget-4321.log`。

> 改完代码后执行一次 `npm run build`。桌面端会比对构建号，发现旧服务就自动另起一个新端口，不会再把旧界面当成新版本。

## 分析框架
Prompt 中接入了以下公开框架，并在结果页提供折叠说明：
- [主动倾听](https://www.helpguide.org/relationships/communication/active-listening)：内容与情绪双通道，复述、总结、开放式问题
- [Gottman 四骑士](https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/)：批评、轻蔑、防御、冷处理
- [自信表达](https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Assertiveness)：事实、感受、具体请求、边界
- [非暴力沟通](https://www.cnvc.org/learn-nvc/what-is-nvc)：观察、感受、需要、请求
- [高语境沟通](https://en.wikipedia.org/wiki/High-context_and_low-context_cultures)：单条消息不能替代关系背景
- [Grice 会话含义](https://en.wikipedia.org/wiki/Cooperative_principle)：字面绕开重点时，要结合语境理解言外之意
- [Brown & Levinson 礼貌理论](https://en.wikipedia.org/wiki/Politeness_theory)：请求、拒绝和批评常会顾全面子
- [媒介丰富度理论](https://en.wikipedia.org/wiki/Media_richness_theory)：文字消息信息量有限，不能过度确定
- [归因理论](https://en.wikipedia.org/wiki/Attribution_(psychology))：一次行为不等于稳定人格

## 技术栈
Next.js 14 + TypeScript + Tailwind CSS + OpenAI 兼容接口，部署于 Vercel。

接口：
- `/api/analyze`：回复 TA
- `/api/opener`：主动开口
- `/api/almanac`：电子黄历数据

## 本地运行
```bash
npm install
cp .env.example .env
# 填入 OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL
npm run dev
```

> 没有配置模型 Key 时，会优先使用公共模型服务；公共模型有频率限制，失败时才回退到本地规则解析。

公共模型服务会把输入内容发送到第三方，请不要输入身份证、住址等敏感信息。正式使用时建议配置自己的 `OPENAI_API_KEY`。

## 部署
推送到 GitHub，Vercel 导入仓库，配置环境变量即可。

## Roadmap
- V1：Web 工具（当前）
- V2：浏览器插件（选中网页文字右键解读）
- V3：个性化语气学习

## License
MIT
