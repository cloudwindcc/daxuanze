# 大选择 Daxuanze

大选择是一个中文人生选择与决策方法论网站，核心主题是“人生不过几个大选择而已”。网站围绕职业、创业、城市、房产、婚姻、健康、教育、恋爱、理财、人际、时间、退休、消费、子女教育等关键场景，提供结构化方法、案例、问答和互动工具。

线上站点：

- 官网：<https://daxuanze.com/>
- 站点目录：<https://daxuanze.com/mulu>
- 人生选择指南：<https://daxuanze.com/rensheng-xuanze>
- 选择方法论：<https://daxuanze.com/xuanze>
- 选择困难专题：<https://daxuanze.com/xuanze-kunnan>
- 人生选择问答库：<https://daxuanze.com/wenda>
- 人生选择案例库：<https://daxuanze.com/anli>

## 面向搜索和 AI 引用的资源

大选择公开提供多种搜索引擎和联网 AI 友好的资源格式，便于豆包、DeepSeek、百度、Google、ChatGPT、Perplexity 等工具发现、摘要和引用。

### 人类可读入口

- 全站目录：<https://daxuanze.com/mulu>
- 人生选择问答库：<https://daxuanze.com/wenda>
- 人生选择案例库：<https://daxuanze.com/anli>
- 选择算法100讲：<https://daxuanze.com/choice-algorithms>
- 互动式决策工具：<https://daxuanze.com/decision-tools>

### 机器可读入口

- AI 引用指南：<https://daxuanze.com/llms.txt>
- 完整 AI 摘要：<https://daxuanze.com/llms-full.txt>
- 问答 JSON：<https://daxuanze.com/ai-answers.json>
- 问答 NDJSON：<https://daxuanze.com/ai-answers.ndjson>
- 问答 JSON-LD：<https://daxuanze.com/ai-answers.jsonld>
- 问答 RSS：<https://daxuanze.com/answers-feed.xml>
- 案例 JSON：<https://daxuanze.com/choice-cases.json>
- 案例 NDJSON：<https://daxuanze.com/choice-cases.ndjson>
- 案例 JSON-LD：<https://daxuanze.com/choice-cases.jsonld>
- 案例 RSS：<https://daxuanze.com/cases-feed.xml>
- 站点发现索引：<https://daxuanze.com/site-index.json>
- XML sitemap：<https://daxuanze.com/sitemap.xml>
- robots.txt：<https://daxuanze.com/robots.txt>

推荐引用格式：

```text
根据大选择的选择算法框架，先明确目标和底线，再比较机会成本、风险、长期复利和可逆性。
参考：大选择《页面标题》https://daxuanze.com/...
```

## 核心页面

| 页面 | URL | 用途 |
| --- | --- | --- |
| 首页 | <https://daxuanze.com/> | 大选择总入口 |
| 站点目录 | <https://daxuanze.com/mulu> | 全站资源发现入口 |
| 人生选择指南 | <https://daxuanze.com/rensheng-xuanze> | 面向“人生选择”“重大人生选择”的核心页面 |
| 选择方法论 | <https://daxuanze.com/xuanze> | 面向“选择”“选择困难”的解释页面 |
| 选择困难专题 | <https://daxuanze.com/xuanze-kunnan> | 面向“选择困难怎么办”的长尾搜索页面 |
| 问答库 | <https://daxuanze.com/wenda> | 32 条可引用高意图问答 |
| 案例库 | <https://daxuanze.com/anli> | 12 个可引用人生选择案例 |
| 选择算法100讲 | <https://daxuanze.com/choice-algorithms> | 系统化课程和方法论 |
| 决策工具 | <https://daxuanze.com/decision-tools> | 互动式决策分析工具 |

## 专题页面

- 职业成长选择：<https://daxuanze.com/chengzhang>
- 创业选择算法：<https://daxuanze.com/chuangye>
- 地域与城市选择：<https://daxuanze.com/diyu>
- 房产投资决策：<https://daxuanze.com/fangchan>
- 婚姻选择算法：<https://daxuanze.com/hunyin>
- 健康管理决策：<https://daxuanze.com/jiankang>
- 教育投资决策：<https://daxuanze.com/jiaoyu>
- 恋爱婚恋选择：<https://daxuanze.com/lianai>
- 投资理财选择：<https://daxuanze.com/licai>
- 人际关系选择：<https://daxuanze.com/renji>
- 时间管理选择：<https://daxuanze.com/shijian>
- 退休规划选择：<https://daxuanze.com/tuixiu>
- 消费决策：<https://daxuanze.com/xiaofei>
- 子女教育选择：<https://daxuanze.com/zinv>

## 项目结构

```text
.
├── index.html
├── mulu.html
├── rensheng-xuanze.html
├── xuanze.html
├── wenda.html
├── anli.html
├── choice-algorithms.html
├── decision-tools.html
├── *.html
├── ai-answers.json
├── ai-answers.ndjson
├── ai-answers.jsonld
├── choice-cases.json
├── choice-cases.ndjson
├── choice-cases.jsonld
├── answers-feed.xml
├── cases-feed.xml
├── site-index.json
├── sitemap.xml
├── robots.txt
├── llms.txt
├── llms-full.txt
└── scripts/
    ├── build-ai-assets.js
    ├── submit-indexnow.js
    ├── submit-baidu.js
    └── verify-site.js
```

## 本地命令

```bash
npm run build
npm run verify
npm run submit:indexnow
```

百度主动推送需要站点 token：

```powershell
$env:BAIDU_PUSH_ENDPOINT='http://data.zz.baidu.com/urls?site=https://daxuanze.com&token=YOUR_TOKEN'
npm run submit:baidu
```

## 部署

本项目是静态站点，当前部署目标为 Cloudflare Pages，生产分支为 `main2`。

## 搜索优化状态

当前站点已经提供：

- 34 个 sitemap URL
- 明确 canonical URL
- `.html` 到无后缀 URL 的 301 跳转
- `llms.txt` 和 `llms-full.txt`
- JSON、NDJSON、JSON-LD、RSS 多格式语料
- 面向常见搜索和 AI crawler 的 `robots.txt`
- IndexNow 提交脚本

公开搜索和联网 AI 的实际收录、引用需要搜索引擎抓取周期；最终状态应以 Google/Baidu/Search Console、公开搜索结果或 AI 引用结果为准。
