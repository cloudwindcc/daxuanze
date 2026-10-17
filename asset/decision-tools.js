const toolsData = JSON.parse(
  document.getElementById("decision-tools-data").textContent,
);

document.addEventListener("DOMContentLoaded", () => {
  const toolGrid = document.getElementById("tool-grid");
  const searchBox = document.getElementById("search-box");
  const categoryFiltersContainer = document.getElementById("category-filters");
  const modal = document.getElementById("tool-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const closeModalBtn = document.getElementById("close-modal");
  const noResults = document.getElementById("no-results");

  let returnFocus = null;
  let backgroundElements = [];

  let allCategories = ["全部"];
  toolsData.forEach((tool) => {
    tool.categories.forEach((cat) => {
      if (!allCategories.includes(cat)) {
        allCategories.push(cat);
      }
    });
  });

  function renderCategories() {
    categoryFiltersContainer.innerHTML = allCategories
      .map(
        (cat) => `
                    <button type="button" aria-pressed="${cat === "全部"}" class="filter-btn px-4 py-2 border rounded-full text-sm font-medium transition ${cat === "全部" ? "active-filter" : "bg-white text-slate-700 border-gray-300 hover:bg-emerald-50"}" data-category="${cat}">
                        ${cat}
                    </button>
                `,
      )
      .join("");
  }

  function getToolColorTheme(categories) {
    // 根据主要类别分配颜色主题
    if (categories.includes("战略性")) return "blue";
    if (categories.includes("定量")) return "green";
    if (categories.includes("创造性")) return "purple";
    if (categories.includes("问题解决")) return "orange";
    if (categories.includes("优先级排序")) return "indigo";
    if (categories.includes("预测性")) return "pink";
    if (categories.includes("风险管理")) return "red";
    return "blue"; // 默认颜色
  }

  function getColorClasses(theme) {
    const colors = {
      blue: {
        bg: "from-blue-500/60 to-blue-600/60",
        border: "hover:border-blue-400/40",
        shadow: "hover:shadow-blue-500/20",
        text: "group-hover:text-blue-600 dark:group-hover:text-blue-300",
        arrow: "text-blue-400",
        badge: "bg-blue-500/90",
      },
      green: {
        bg: "from-green-500/60 to-green-600/60",
        border: "hover:border-green-400/40",
        shadow: "hover:shadow-green-500/20",
        text: "group-hover:text-green-600 dark:group-hover:text-green-300",
        arrow: "text-green-400",
        badge: "bg-green-500/90",
      },
      purple: {
        bg: "from-purple-500/60 to-purple-600/60",
        border: "hover:border-purple-400/40",
        shadow: "hover:shadow-purple-500/20",
        text: "group-hover:text-purple-600 dark:group-hover:text-purple-300",
        arrow: "text-purple-400",
        badge: "bg-purple-500/90",
      },
      orange: {
        bg: "from-orange-500/60 to-orange-600/60",
        border: "hover:border-orange-400/40",
        shadow: "hover:shadow-orange-500/20",
        text: "group-hover:text-orange-600 dark:group-hover:text-orange-300",
        arrow: "text-orange-400",
        badge: "bg-orange-500/90",
      },
      indigo: {
        bg: "from-indigo-500/60 to-indigo-600/60",
        border: "hover:border-indigo-400/40",
        shadow: "hover:shadow-indigo-500/20",
        text: "group-hover:text-indigo-600 dark:group-hover:text-indigo-300",
        arrow: "text-indigo-400",
        badge: "bg-indigo-500/90",
      },
      pink: {
        bg: "from-pink-500/60 to-pink-600/60",
        border: "hover:border-pink-400/40",
        shadow: "hover:shadow-pink-500/20",
        text: "group-hover:text-pink-600 dark:group-hover:text-pink-300",
        arrow: "text-pink-400",
        badge: "bg-pink-500/90",
      },
      red: {
        bg: "from-red-500/60 to-red-600/60",
        border: "hover:border-red-400/40",
        shadow: "hover:shadow-red-500/20",
        text: "group-hover:text-red-600 dark:group-hover:text-red-300",
        arrow: "text-red-400",
        badge: "bg-red-500/90",
      },
    };
    return colors[theme] || colors.blue;
  }

  function renderTools(filteredTools) {
    const toolsToRender = filteredTools || toolsData;
    if (toolsToRender.length === 0) {
      noResults.classList.remove("hidden");
      toolGrid.innerHTML = "";
    } else {
      noResults.classList.add("hidden");
      toolGrid.innerHTML = toolsToRender
        .map((tool) => {
          const theme = getToolColorTheme(tool.categories);
          const colors = getColorClasses(theme);

          return `
                        <div role="button" tabindex="0" aria-haspopup="dialog" aria-controls="tool-modal" aria-label="查看${tool.name}详情" class="tool-card bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-gray-300/30 ${colors.border} transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${colors.shadow} group cursor-pointer" id="tool-${tool.id}" data-id="${tool.id}">
                            <div class="flex items-center mb-4">
                                <div class="w-12 h-12 bg-gradient-to-br ${colors.bg} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <i class="fas fa-tools text-white text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg mb-1 text-slate-800 dark:text-slate-100 ${colors.text} transition-colors drop-shadow-sm">${tool.name}</h3>
                                    <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${tool.definition.substring(0, 60)}...</p>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 mb-4">
                                ${tool.categories
                                  .slice(0, 3)
                                  .map(
                                    (cat) =>
                                      `<span class="${colors.badge} text-slate-100 dark:text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">${cat}</span>`,
                                  )
                                  .join("")}
                                ${tool.categories.length > 3 ? `<span class="bg-gray-600/90 text-slate-100 dark:text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">+${tool.categories.length - 3}</span>` : ""}
                            </div>

                            <div class="mt-auto pt-4 border-t border-gray-300/30 dark:border-slate-700/30">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-slate-700 dark:text-slate-200 font-medium">点击查看详情</span>
                                    <i class="fas fa-arrow-right ${colors.arrow} group-hover:translate-x-1 transition-transform duration-300"></i>
                                </div>
                            </div>
                        </div>
                        `;
        })
        .join("");
    }
  }

  function filterAndRender() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    const activeCategory = document.querySelector(".filter-btn.active-filter")
      .dataset.category;

    const filteredTools = toolsData.filter((tool) => {
      const nameMatch = [
        tool.name,
        tool.definition,
        ...tool.categories,
        ...tool.scenarios.flatMap((scenario) => [
          scenario.title,
          scenario.text,
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
      const categoryMatch =
        activeCategory === "全部" || tool.categories.includes(activeCategory);
      return nameMatch && categoryMatch;
    });

    renderTools(filteredTools);
  }

  function showModal(toolId) {
    const tool = toolsData.find((t) => t.id == toolId);
    if (!tool) return;

    returnFocus = document.activeElement;
    backgroundElements = Array.from(document.body.children).filter(
      (node) => node !== modal && node.tagName !== "SCRIPT" && !node.inert,
    );
    backgroundElements.forEach((node) => {
      node.inert = true;
    });
    modal.setAttribute("aria-hidden", "false");
    modalTitle.textContent = tool.name;
    modal.classList.remove("invisible", "opacity-0");
    modal.classList.add("show");
    modal.querySelector(".modal-content").classList.remove("scale-95");
    modal.querySelector(".modal-content").scrollTop = 0;
    document.body.style.overflow = "hidden";

    let scenariosHTML = tool.scenarios
      .map(
        (s) => `
                    <div class="mb-3">
                        <h5 class="font-semibold text-slate-700">${s.title}</h5>
                        <p class="text-slate-600">${s.text}</p>
                    </div>
                `,
      )
      .join("");

    let prosConsHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <h4 class="font-bold text-lg mb-2 text-green-600">✅ 优势</h4>
                            <ul class="list-disc list-inside space-y-1 text-slate-700">
                                ${tool.pros.map((p) => `<li>${p}</li>`).join("")}
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-bold text-lg mb-2 text-red-600">❌ 缺点</h4>
                            <ul class="list-disc list-inside space-y-1 text-slate-700">
                                ${tool.cons.map((c) => `<li>${c}</li>`).join("")}
                            </ul>
                        </div>
                    </div>
                `;

    let specialDiagram = "";
    if (tool.name === "SWOT 分析") {
      specialDiagram = `
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                             <h4 class="font-bold text-lg mb-3 text-center">SWOT 矩阵示例</h4>
                             <div class="grid grid-cols-2 gap-2 text-center">
                                <div class="bg-green-100 p-3 rounded"><strong>优势 (S)</strong><p class="text-sm">内部、积极</p></div>
                                <div class="bg-yellow-100 p-3 rounded"><strong>劣势 (W)</strong><p class="text-sm">内部、消极</p></div>
                                <div class="bg-blue-100 p-3 rounded"><strong>机会 (O)</strong><p class="text-sm">外部、积极</p></div>
                                <div class="bg-red-100 p-3 rounded"><strong>威胁 (T)</strong><p class="text-sm">外部、消极</p></div>
                             </div>
                        </div>
                    `;
    } else if (tool.name === "艾森豪威尔矩阵") {
      specialDiagram = `
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                             <h4 class="font-bold text-lg mb-3 text-center">艾森豪威尔矩阵</h4>
                             <div class="grid grid-cols-2 gap-2">
                                <div class="bg-red-200 p-3 rounded text-center"><strong>紧急且重要</strong><p>立即做</p></div>
                                <div class="bg-blue-200 p-3 rounded text-center"><strong>重要不紧急</strong><p>计划做</p></div>
                                <div class="bg-yellow-200 p-3 rounded text-center"><strong>紧急不重要</strong><p>委派</p></div>
                                <div class="bg-gray-200 p-3 rounded text-center"><strong>不紧急不重要</strong><p>删除</p></div>
                             </div>
                        </div>
                    `;
    } else if (tool.name === "鱼骨图") {
      specialDiagram = `
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 class="font-bold text-lg mb-3 text-center">鱼骨图 (6M) 结构</h4>
                            <div class="fishbone">
                                <div class="flex-grow space-y-8">
                                    <div class="fishbone-rib">人员 (Man)</div>
                                    <div class="fishbone-rib">方法 (Method)</div>
                                    <div class="fishbone-rib">机器 (Machine)</div>
                                </div>
                                <div class="fishbone-spine"></div>
                                <div class="fishbone-head"></div>
                                <div class="flex-grow text-right space-y-8">
                                     <div class="fishbone-rib text-left">材料 (Material)</div>
                                     <div class="fishbone-rib text-left">测量 (Measurement)</div>
                                     <div class="fishbone-rib text-left">环境 (Milieu)</div>
                                </div>
                            </div>
                         </div>
                     `;
    }

    const content = `
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-bold text-lg mb-2 text-emerald-600">基本定义</h4>
                            <p class="text-slate-700">${tool.definition}</p>
                        </div>
                        <div>
                            <h4 class="font-bold text-lg mb-2 text-emerald-600">关键内涵</h4>
                            <p class="text-slate-700">${tool.essence}</p>
                        </div>
                        <div>
                            <h4 class="font-bold text-lg mb-2 text-emerald-600">应用场景</h4>
                            ${scenariosHTML}
                        </div>
                        ${prosConsHTML}
                        ${specialDiagram}
                        <div class="mt-4 pt-4 border-t">
                            <h4 class="font-bold text-lg mb-2 text-emerald-600">深度分析</h4>
                            <p class="text-slate-700 bg-emerald-50 p-4 rounded-lg">${tool.analysis}</p>
                        </div>
                    </div>
                `;

    // The tool content comes from the local, versioned catalogue.
    modalBody.innerHTML = content;
    requestAnimationFrame(() => {
      if (modal.classList.contains("show"))
        closeModalBtn.focus({ preventScroll: true });
    });
  }

  function hideModal() {
    if (!modal.classList.contains("show")) return;
    modal.classList.add("invisible", "opacity-0");
    modal.classList.remove("show");
    modal.querySelector(".modal-content").classList.add("scale-95");
    document.body.style.overflow = "";
    modal.setAttribute("aria-hidden", "true");
    backgroundElements.forEach((node) => {
      node.inert = false;
    });
    backgroundElements = [];
    if (returnFocus?.isConnected) returnFocus.focus();
  }

  categoryFiltersContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active-filter");
        btn.setAttribute("aria-pressed", "false");
      });
      e.target.setAttribute("aria-pressed", "true");
      e.target.classList.add("active-filter");
      filterAndRender();
    }
  });

  searchBox.addEventListener("input", filterAndRender);

  toolGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".tool-card");
    if (card) {
      showModal(card.dataset.id);
    }
  });

  toolGrid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".tool-card");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      showModal(card.dataset.id);
    }
  });

  closeModalBtn.addEventListener("click", hideModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("show")) return;
    if (e.key === "Tab") {
      const focusable = Array.from(
        modal.querySelectorAll(
          'button, a[href], input, textarea, [tabindex="0"]',
        ),
      ).filter((node) => !node.disabled && node.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === "Escape") {
      hideModal();
    }
  });

  function renderChart() {
    const counts = new Map();
    toolsData.forEach((tool) =>
      tool.categories.forEach((category) =>
        counts.set(category, (counts.get(category) || 0) + 1),
      ),
    );
    const maximum = Math.max(...counts.values());
    document.getElementById("toolsChart").innerHTML = Array.from(counts)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([category, count]) => `
                    <li class="dx-chart-row"><span>${category}</span><span class="dx-chart-track" aria-hidden="true"><span style="width: ${(count / maximum) * 100}%"></span></span><span>${count} 个</span></li>
                `,
      )
      .join("");
  }

  const problemInput = document.getElementById("problem-input");
  const recommendButton = document.getElementById("recommend-btn");
  problemInput.addEventListener("input", () => {
    document.getElementById("char-count").textContent =
      problemInput.value.length;
    recommendButton.disabled = !problemInput.value.trim();
  });
  const rules = [
    {
      pattern: /风险|不确定|损失|止损|失败/,
      categories: ["风险管理", "预测性"],
    },
    {
      pattern: /投资|成本|收益|预算|财务|买房/,
      categories: ["财务分析", "定量", "投资组合管理"],
    },
    {
      pattern: /时间|任务|紧急|效率|优先/,
      categories: ["时间管理", "个人生产力", "优先级排序"],
    },
    {
      pattern: /团队|讨论|共识|创意|点子/,
      categories: ["团队协作", "创造性", "专家共识"],
    },
    {
      pattern: /原因|故障|质量|根源|为什么/,
      categories: ["根本原因分析", "问题解决"],
    },
    {
      pattern: /创业|行业|市场|竞争|战略/,
      categories: ["战略性", "外部环境分析"],
    },
    {
      pattern: /offer|工作|职业|选择|比较|方案/i,
      categories: ["多准则决策分析", "评估", "个人决策"],
    },
  ];
  document
    .getElementById("recommendation-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const query = problemInput.value.trim().toLowerCase();
      if (!query) return;
      const categories = new Set(
        rules
          .filter((rule) => rule.pattern.test(query))
          .flatMap((rule) => rule.categories),
      );
      const ranked = toolsData
        .map((tool) => {
          const matches = tool.categories.filter((category) =>
            categories.has(category),
          );
          const nameMatch = query.includes(tool.name.toLowerCase());
          return {
            tool,
            matches,
            score: matches.length + (nameMatch ? 10 : 0),
          };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      const results = document.getElementById("recommendation-results");
      results.replaceChildren();
      document.getElementById("recommendation-status").textContent =
        ranked.length
          ? "推荐以下工具，点击可查看用法："
          : "暂时没有匹配的场景。试试描述风险、成本、时间、团队或工作选择，也可以使用下方搜索。";
      ranked.forEach(({ tool, matches }) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dx-recommendation-result";
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute("aria-controls", "tool-modal");
        button.textContent =
          tool.name + " · " + (matches.join("、") || "工具名称匹配");
        button.addEventListener("click", () => showModal(tool.id));
        item.appendChild(button);
        results.appendChild(item);
      });
    });

  renderCategories();
  renderTools();
  renderChart();
});
