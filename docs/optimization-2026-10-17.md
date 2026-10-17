# 项目优化记录 · 2026-10-17

基于 `origin/main2`，本地分支为 `codex/project-optimization`。

## 已完成

- 全站使用预编译、压缩后的本地 Tailwind 样式，移除 Play CDN 运行时。
- 移除首页和咨询页中持续运行的隐藏粒子动画、重复 canvas ID。
- 修复失效的推荐入口，提供本地关键词匹配；输入内容留在当前页面。
- 工具搜索覆盖名称、类别、定义和应用场景，支持清理首尾空格。
- 弹窗支持 Enter / 空格打开、Tab 焦点约束、Escape 关闭和焦点恢复。
- 类别分布改为可读的 HTML / CSS 图表，移除 Chart.js 请求。
- 工具内容集中在 `data/decision-tools.json`，同步生成页面数据、结构化数据和无 JavaScript 阅读版。
- 删除工具页无依据的评分、评论数量和未实现的计算器描述。
- 修复三处 `/fuye` 旧链接，增加首页别名 301 与独立 404 页面。
- 新增站内链接、锚点、重复 ID 检查及 GitHub Actions。
- 锁定依赖，提供与生产路由一致的本地预览，并阻止预览服务器暴露开发文件。

## 验证结果

- `npm ci`：通过；依赖审计 0 漏洞。
- `npm run check`：通过，覆盖 122 个 HTML 页面、150 个 sitemap URL、4,514 处站内引用及现有 GEO 检查。
- `npm test`：16 项通过。桌面与手机 Chromium 检查了全部 121 个公开页面，并验证搜索、筛选、图表、推荐、弹窗、课程预览、无 JavaScript 阅读和 404。
- 浏览器测试屏蔽外部服务；全部公开页面无脚本错误或横向溢出。
- 重复构建：页面与生成资源的 SHA-256 校验一致。

## 发布

通过 Cloudflare Pages 的 Git 集成发布，生产分支为 `main2`，正式域名为 https://daxuanze.com。使用 Node.js 22 或更新版本，构建命令为 `npm run build`，输出目录为仓库根目录。发布后运行 `npm run check:discovery` 检查线上发现资源；实际搜索收录与 AI 引用需要上线后持续观察。
