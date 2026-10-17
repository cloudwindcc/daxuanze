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
const file = path.join(root, "decision-tools.html");
let html = fs.readFileSync(file, "utf8");

function replaceBlock(name, content) {
  const pattern = new RegExp(
    `<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`,
  );
  if (!pattern.test(html)) throw new Error(`Missing generated block: ${name}`);
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
  <p class="mb-6">你可以直接阅读全部工具说明。启用 JavaScript 后可使用搜索、筛选和场景推荐。</p>
  ${tools
    .map(
      (
        tool,
      ) => `<details id="tool-${tool.id}" class="mb-4 rounded-lg border p-4">
    <summary>${escape(tool.name)} · ${tool.categories.map(escape).join("、")}</summary>
    <p class="mt-4">${escape(tool.definition)}</p>
    <p class="mt-4">${escape(tool.essence)}</p>
    ${tool.scenarios.map((scenario) => `<p class="mt-4"><strong>${escape(scenario.title)}</strong>：${escape(scenario.text)}</p>`).join("\n")}
    <p class="mt-4">优势：${tool.pros.map(escape).join("；")}</p>
    <p class="mt-4">局限：${tool.cons.map(escape).join("；")}</p>
    <p class="mt-4">${escape(tool.analysis)}</p>
  </details>`,
    )
    .join("\n")}
</noscript>`,
);

// Describe the actual catalogue; ratings and unsupported calculators are omitted.
const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://daxuanze.com/decision-tools#webpage",
  name: "交互式决策工具导航器",
  description:
    "21 种决策方法的定义、应用场景、优势与局限，支持搜索、类别筛选和本地场景推荐。",
  url: "https://daxuanze.com/decision-tools",
  inLanguage: "zh-CN",
  isPartOf: { "@id": "https://daxuanze.com/#website" },
  publisher: { "@id": "https://daxuanze.com/#organization" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "DefinedTerm",
        name: tool.name,
        description: tool.definition,
      },
    })),
  },
};
html = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${json(schema)}\n    </script>`,
);
fs.writeFileSync(file, html, "utf8");
console.log(
  `Generated structured data and accessible fallback for ${tools.length} decision tools.`,
);
