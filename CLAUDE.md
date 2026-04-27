# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目状态

目前仓库只有一份设计文档 `Life_of_Pi_prompt.md`，**尚未开始编码**。所有架构信息都来自这份文档的规划，不是现有代码。开始实现前先通读该文档，特别是「四、最终交付 Prompt」段——它是验收标准。

## 构建与运行

没有构建系统、没有依赖管理、没有测试框架。最终交付物是单文件 `Life_of_Pi.html`（内联 CSS + JS，零外部依赖），浏览器双击即可运行。手动验证靠 DevTools 看 localStorage 与控制台。

## 架构规划（按设计文档）

**单文件 SPA**：一个 HTML 文件承载整个应用，登录页 → 4 个 tab 的 SPA 切换。底栏 4 个 tab 对应 4 个 `.page`：倒计时 / 打卡 / 认知 / 复盘。

**模块边界与跨模块联动**（这是读多个段落才看得出的关键设计）：
- 倒计时详情页底部「今日为它做了什么」一行输入会**写入认知模块**并 tag 该目标 ID——认知模块是其他模块的事件汇流层。
- 周复盘的「自动生成段落」**读取打卡数据 + 倒计时数据 + 认知 tag 频率**——复盘是只读聚合视图，不产生新数据，不要让它反向改前三个模块。
- 时光机模式（认知模块）的「还在影响我 / 翻篇了」回响数据会被复盘消费，形成「上周焦点完成了吗」段。

**localStorage schema（v1）**：
- key 命名空间：`lop:countdowns` / `lop:habits` / `lop:checkins` / `lop:cognitions` / `lop:reviews` / `lop:settings`
- schema 版本号：`lop:schema_version = 1`
- 每条记录带 uuid + 时间戳
- 即使在单文件里，也用 namespace 隔出 db 访问层（设计文档原话「db.js 风格的访问层」），不要让各模块各自直接 `localStorage.getItem`。

**设计系统硬约束**（这些是验收点，不是建议）：
- 色板：白底 `#ffffff` / 墨色 `#0a0a0a` / 辅助灰 `#6b6b6b` / 分隔灰 `#e5e5e5` / 单一橙 accent `#ff6b35`（**仅用于关键状态**，不要泛用）
- 大数字 72px font-weight 200 ultralight + 小标签 11px font-weight 700 uppercase letter-spacing 0.08em
- 卡片：`1px solid #e5e5e5` + `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`
- 下划线输入聚焦：border-bottom 1px → 2px，160ms `cubic-bezier(0.4, 0, 0.2, 1)`
- 页面切换：translateX + 0.32s `cubic-bezier(0.32, 0.72, 0, 1)`，下层 8px 视差
- 复盘报告分割线用 `· · · · · ·` 点线（`letter-spacing: 4px`），**不要用 `<hr>` 实线**

**视口**：手机优先 390×844 起步；桌面端中间内容固定 480px 居中。390 宽度下不能横向滚动。

## 「压力变动力」产品哲学（影响实现选择）

设计文档里有大段反模式表，违反这些等于功能没做对：
- **不要红色警示色**、不显示「今日未完成」、不显示「还剩 X 天」（要写「已经走了 X / N 天」）
- 心情 tag **不可视化为图表**——把情绪量化成 KPI 是反模式
- 打卡的「最小启动」字段是核心机制，不是可选项
- 连击用 80% 容错制，不是严格连续
- 复盘**不打分、不评级**，没有「这周不及格」概念
- 失的部分「写下即放下」——写完就关闭，不进二次回看入口

## 禁止项

- 不要 `alert()` 占位——所有按钮必须真生效
- 不要外部 CDN，**包括图标库**——图标用内联 SVG 自己画
- 不要任何 npm 依赖、构建步骤——最终就是一个 `.html` 文件
