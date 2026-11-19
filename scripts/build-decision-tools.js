const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const tools = JSON.parse(
  fs.readFileSync(path.join(root, "data/decision-tools.json"), "utf8"),
);
const ids = new Set();
for (const tool of tools) {
  if (
    !Number.isInteger(tool.id) ||
    ids.has(tool.id) ||
    !tool.name ||
    !tool.definition ||
    !tool.categories?.length ||
    tool.categories.some((category) => !category.trim()) ||
    !tool.scenarios?.length ||
    !tool.pros?.length ||
    !tool.cons?.length ||
    !tool.analysis
  ) {
    throw new Error(`Invalid or duplicate tool: ${tool.id}`);
  }
  ids.add(tool.id);
}
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

// Per-language view of a tool: English pages read the *_en fields and fall
// back to the Chinese source when a translation is missing.
function view(tool, lang) {
  if (lang !== "en") return tool;
  return {
    ...tool,
    name: tool.name_en || tool.name,
    categories: tool.categories_en || tool.categories,
    definition: tool.definition_en || tool.definition,
    essence: tool.essence_en || tool.essence,
    scenarios: tool.scenarios_en || tool.scenarios,
    pros: tool.pros_en || tool.pros,
    cons: tool.cons_en || tool.cons,
    analysis: tool.analysis_en || tool.analysis,
  };
}

const COPY = {
  en: {
    fallbackIntro:
      "You can read every tool description directly. Enable JavaScript to use search, category filters and scenario recommendations.",
    joiner: ", ",
    scenarioJoiner: ": ",
    strengths: "Strengths",
    limitations: "Limitations",
    listJoiner: "; ",
    schemaName: "Interactive Decision Tools Navigator",
    schemaDescription:
      "Definitions, application scenarios, strengths and limitations of 21 decision methods, with search, category filters and local scenario recommendations.",
    schemaUrl: "https://daxuanze.com/decision-tools",
    inLanguage: "en",
  },
  zh: {
    fallbackIntro:
      "你可以直接阅读全部工具说明。启用 JavaScript 后可使用搜索、筛选和场景推荐。",
    joiner: "、",
    scenarioJoiner: "：",
    strengths: "优势",
    limitations: "局限",
    listJoiner: "；",
    schemaName: "交互式决策工具导航器",
    schemaDescription:
      "21 种决策方法的定义、应用场景、优势与局限，支持搜索、类别筛选和本地场景推荐。",
    schemaUrl: "https://daxuanze.com/zh/decision-tools",
    inLanguage: "zh-CN",
  },
};

for (const { file, lang } of [
  { file: "decision-tools.html", lang: "en" },
  { file: path.join("zh", "decision-tools.html"), lang: "zh" },
]) {
  const copy = COPY[lang];
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");

  function replaceBlock(name, content) {
    const pattern = new RegExp(
      `<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`,
    );
    if (!pattern.test(html)) throw new Error(`Missing generated block: ${name} in ${file}`);
    html = html.replace(
      pattern,
      `<!-- ${name}:start -->\n${content}\n<!-- ${name}:end -->`,
    );
  }

  replaceBlock(
    "decision-tools-data",
    `<script type="application/json" id="decision-tools-data">${json(tools)}</script>`,
  );
  replaceBlock(
    "decision-tools-fallback",
    `<noscript>
  <p class="mb-6">${copy.fallbackIntro}</p>
  ${tools
    .map((rawTool) => {
      const tool = view(rawTool, lang);
      return `<details id="tool-${tool.id}" class="mb-4 rounded-lg border p-4">
    <summary>${escape(tool.name)} · ${tool.categories.map(escape).join(copy.joiner)}</summary>
    <p class="mt-4">${escape(tool.definition)}</p>
    <p class="mt-4">${escape(tool.essence)}</p>
    ${tool.scenarios.map((scenario) => `<p class="mt-4"><strong>${escape(scenario.title)}</strong>${copy.scenarioJoiner}${escape(scenario.text)}</p>`).join("\n")}
    <p class="mt-4">${copy.strengths}: ${tool.pros.map(escape).join(copy.listJoiner)}</p>
    <p class="mt-4">${copy.limitations}: ${tool.cons.map(escape).join(copy.listJoiner)}</p>
    <p class="mt-4">${escape(tool.analysis)}</p>
  </details>`;
    })
    .join("\n")}
</noscript>`,
  );

  // Describe the actual catalogue; ratings and unsupported calculators are omitted.
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${copy.schemaUrl}#webpage`,
    name: copy.schemaName,
    description: copy.schemaDescription,
    url: copy.schemaUrl,
    inLanguage: copy.inLanguage,
    isPartOf: { "@id": "https://daxuanze.com/#website" },
    publisher: { "@id": "https://daxuanze.com/#organization" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.map((rawTool, index) => {
        const tool = view(rawTool, lang);
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "DefinedTerm",
            name: tool.name,
            description: tool.definition,
          },
        };
      }),
    },
  };
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${json(schema)}\n    </script>`,
  );
  fs.writeFileSync(filePath, html, "utf8");
}
console.log(
  `Generated structured data and accessible fallback for ${tools.length} decision tools (en + zh).`,
);
