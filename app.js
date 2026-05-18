const categories = [
  {
    id: "apk",
    label: "Game/App APK",
    defaultTemplateId: "apk-h1",
  },
  {
    id: "vpn",
    label: "VPN SEO",
    defaultTemplateId: "vpn-heading1",
  },
];

const templates = [
  {
    id: "apk-h1",
    categoryId: "apk",
    label: "H1",
    subtitle: "Heading generator",
    title: "H1 Prompt",
    path: "./prompts/prompt_APK/heading_1_game_apk.txt",
  },
  {
    id: "apk-outline",
    categoryId: "apk",
    label: "Outline",
    subtitle: "SEO structure",
    title: "Outline Prompt",
    path: "./prompts/prompt_APK/final_outline_prompt_v2_apk.txt",
  },
  {
    id: "apk-writing",
    categoryId: "apk",
    label: "Writing",
    subtitle: "Full article prompt",
    title: "Writing Prompt",
    path: "./prompts/prompt_APK/final_writing_prompt_v2_apk_mo.txt",
  },
  {
    id: "vpn-heading1",
    categoryId: "vpn",
    label: "VPN H1",
    subtitle: "Title and heading",
    title: "VPN H1 Prompt",
    path: "./prompts/prompt_VPN/vpn_heading1_prompt.txt",
  },
  {
    id: "vpn-outline",
    categoryId: "vpn",
    label: "VPN Outline",
    subtitle: "SEO structure",
    title: "VPN Outline Prompt",
    path: "./prompts/prompt_VPN/vpn_outline_prompt.txt",
  },
  {
    id: "vpn-writing",
    categoryId: "vpn",
    label: "VPN Writing",
    subtitle: "Full article prompt",
    title: "VPN Writing Prompt",
    path: "./prompts/prompt_VPN/vpn_writing_prompt.txt",
  },
  {
    id: "vpn-meta",
    categoryId: "vpn",
    label: "VPN Meta",
    subtitle: "Title and description",
    title: "VPN Meta Tags Prompt",
    path: "./prompts/prompt_VPN/vpn_meta_tags_prompt.txt",
  },
  {
    id: "vpn-alt-text",
    categoryId: "vpn",
    label: "VPN Alt Text",
    subtitle: "Semantic image text",
    title: "VPN Alt Text Prompt",
    path: "./prompts/prompt_VPN/vpn_alt_text_prompt.txt",
  },
  {
    id: "vpn-image",
    categoryId: "vpn",
    label: "VPN Image",
    subtitle: "Image prompt",
    title: "VPN Image Prompt",
    path: "./prompts/prompt_VPN/vpn_image_prompt.txt",
  },
];

const state = {
  activeCategoryId: "apk",
  activeTemplateId: "apk-h1",
  showOriginal: false,
  prompts: {},
  fields: {},
  globalFieldsByCategory: {},
  values: loadValues(),
};

const elements = {
  loadStatus: document.querySelector("#loadStatus"),
  categoryTabs: [...document.querySelectorAll("[data-category-id]")],
  templateTabs: document.querySelector("#templateTabs"),
  inputTitle: document.querySelector("#inputTitle"),
  inputMeta: document.querySelector("#inputMeta"),
  promptTitle: document.querySelector("#promptTitle"),
  promptMeta: document.querySelector("#promptMeta"),
  fieldForm: document.querySelector("#fieldForm"),
  fieldTemplate: document.querySelector("#fieldTemplate"),
  promptPreview: document.querySelector("#promptPreview"),
  clearButton: document.querySelector("#clearButton"),
  copyButton: document.querySelector("#copyButton"),
  toggleModeButton: document.querySelector("#toggleModeButton"),
};

init();

async function init() {
  bindEvents();
  await loadPrompts();
  render();
}

function bindEvents() {
  elements.categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = getCategory(tab.dataset.categoryId);

      state.activeCategoryId = category.id;
      state.activeTemplateId = getDefaultTemplateId(category.id);
      state.showOriginal = false;
      render();
    });
  });

  elements.clearButton.addEventListener("click", () => {
    state.values[state.activeCategoryId] = {};
    saveValues();
    render();
  });

  elements.toggleModeButton.addEventListener("click", () => {
    state.showOriginal = !state.showOriginal;
    renderPrompt();
  });

  elements.copyButton.addEventListener("click", async () => {
    const prompt = getRenderedPrompt();

    try {
      await navigator.clipboard.writeText(prompt);
      flashStatus("Copied prompt");
      flashButton(elements.copyButton, "Copied");
    } catch (error) {
      fallbackCopy(prompt);
      flashStatus("Copied prompt");
      flashButton(elements.copyButton, "Copied");
    }
  });
}

async function loadPrompts() {
  const results = await Promise.all(
    templates.map(async (template) => {
      const response = await fetch(template.path);

      if (!response.ok) {
        throw new Error(`Cannot load ${template.path}`);
      }

      const text = await response.text();
      return [template.id, text];
    }),
  ).catch((error) => {
    elements.loadStatus.textContent = "Prompt files not loaded";
    elements.promptPreview.textContent =
      "Cannot load prompt files. If you opened index.html directly, run it from GitHub Pages or a local server.";
    throw error;
  });

  results.forEach(([id, prompt]) => {
    const template = templates.find((item) => item.id === id);
    state.prompts[id] = prompt;
    state.fields[id] = parsePromptFields(prompt, template.label);
  });

  state.globalFieldsByCategory = buildGlobalFieldsByCategory();

  elements.loadStatus.textContent = `${templates.length} prompts ready`;
}

function parsePromptFields(prompt, templateLabel) {
  const fields = [];
  let fallbackCount = 0;
  const lines = prompt.split(/\r?\n/);

  lines.forEach((line, lineIndex) => {
    const matches = [...line.matchAll(/\[\]/g)];

    matches.forEach((match, indexOnLine) => {
      const label = inferLabel(line, match.index);
      const cleanLabel = label || `${templateLabel} Field ${++fallbackCount}`;
      const key = toFieldKey(cleanLabel) || `${toFieldKey(templateLabel)}_field_${fallbackCount || lineIndex + 1}`;

      fields.push({
        key,
        label: cleanLabel,
        lineIndex,
        indexOnLine,
        control: inferControl(cleanLabel),
      });
    });
  });

  return fields;
}

function buildGlobalFieldsByCategory() {
  return categories.reduce((groups, category) => {
    groups[category.id] = buildGlobalFields(category.id);
    return groups;
  }, {});
}

function buildGlobalFields(categoryId) {
  const globalFieldMap = new Map();

  getTemplatesByCategory(categoryId).forEach((template) => {
    const fields = state.fields[template.id] || [];

    fields.forEach((field) => {
      if (!globalFieldMap.has(field.key)) {
        globalFieldMap.set(field.key, {
          ...field,
          usedIn: [template.label],
        });
        return;
      }

      const existingField = globalFieldMap.get(field.key);

      if (!existingField.usedIn.includes(template.label)) {
        existingField.usedIn.push(template.label);
      }

      if (existingField.control.type === "text" && field.control.type !== "text") {
        existingField.control = field.control;
      }
    });
  });

  return [...globalFieldMap.values()];
}

function inferLabel(line, placeholderIndex) {
  const before = line.slice(0, placeholderIndex).replace(/[|#>*`-]/g, " ").trim();
  const colonIndex = before.lastIndexOf(":");

  if (colonIndex >= 0) {
    return cleanLabel(before.slice(0, colonIndex).split(/\s{2,}/).pop());
  }

  const pipeParts = line
    .slice(0, placeholderIndex)
    .split("|")
    .map((part) => cleanLabel(part))
    .filter(Boolean);

  if (pipeParts.length > 0) {
    return pipeParts[pipeParts.length - 1];
  }

  return "";
}

function cleanLabel(value = "") {
  return value
    .replace(/^[\s:#|>*`-]+/, "")
    .replace(/[\s:#|>*`-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toFieldKey(label) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function inferControl(label) {
  const normalized = label.toLowerCase();
  const longFieldTerms = [
    "outline",
    "secondary keywords",
    "anchor texts",
    "mod features",
    "premium / mod features",
    "article content",
    "serp data",
    "competitor",
    "target audience",
    "business goal",
    "image prompt",
    "key benefits",
  ];

  if (longFieldTerms.some((term) => normalized.includes(term))) {
    return { type: "textarea", hint: "Paste one item per line or keep your existing format." };
  }

  if (normalized.includes("content type")) {
    return {
      type: "select",
      options: [
        "",
        "Mod Apk",
        "Mod",
        "Mods",
        "Cheats",
        "Hack",
        "Trainer",
        "Crack",
        "Premium Apk",
        "VPN Review",
        "VPN Guide",
        "VPN Comparison",
        "Auto-detect from Primary Keyword",
      ],
    };
  }

  if (normalized.includes("target market")) {
    return { type: "select", options: ["", "Global - EN", "US", "UK", "CA", "AU", "Other"] };
  }

  if (normalized.includes("platform")) {
    return { type: "select", options: ["", "Android", "PC", "iOS", "Console", "Web"] };
  }

  return { type: "text" };
}

function render() {
  const activeCategory = getCategory(state.activeCategoryId);
  const activeTemplate = getActiveTemplate();

  elements.categoryTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.categoryId === activeCategory.id);
  });

  renderTemplateTabs();

  elements.inputTitle.textContent = `${activeCategory.label} Inputs`;
  elements.promptTitle.textContent = activeTemplate.title;
  elements.toggleModeButton.textContent = state.showOriginal ? "Show filled" : "Show original";

  renderMeta();
  renderForm();
  renderPrompt();
}

function renderTemplateTabs() {
  elements.templateTabs.innerHTML = "";

  getTemplatesByCategory(state.activeCategoryId).forEach((template) => {
    const tab = document.createElement("button");
    const label = document.createElement("span");
    const subtitle = document.createElement("small");

    tab.className = "template-tab";
    tab.type = "button";
    tab.dataset.templateId = template.id;
    tab.classList.toggle("is-active", template.id === state.activeTemplateId);

    label.textContent = template.label;
    subtitle.textContent = template.subtitle;

    tab.append(label, subtitle);
    tab.addEventListener("click", () => {
      state.activeTemplateId = template.id;
      state.showOriginal = false;
      render();
    });

    elements.templateTabs.append(tab);
  });
}

function renderMeta() {
  const fields = getActiveGlobalFields();
  const values = getActiveValues();
  const filledCount = fields.filter((field) => String(values[field.key] || "").trim()).length;

  elements.inputMeta.textContent = `${filledCount}/${fields.length} shared fields filled`;
}

function renderForm() {
  const fields = getActiveGlobalFields();
  const values = getActiveValues();

  elements.fieldForm.innerHTML = "";

  if (fields.length === 0) {
    elements.fieldForm.innerHTML =
      '<p class="empty-state">No [] fields found in this prompt group.</p>';
    return;
  }

  fields.forEach((field) => {
    const node = elements.fieldTemplate.content.firstElementChild.cloneNode(true);
    const label = node.querySelector(".field-label");
    const hint = node.querySelector(".field-hint");
    const controlHost = node.querySelector(".field-control");
    const control = createControl(field, values[field.key] || "");

    label.textContent = field.label;
    hint.textContent = getFieldHint(field);
    node.classList.toggle("is-long", field.control.type === "textarea");
    controlHost.append(control);
    elements.fieldForm.append(node);
  });
}

function createControl(field, value) {
  const control =
    field.control.type === "textarea"
      ? document.createElement("textarea")
      : field.control.type === "select"
        ? document.createElement("select")
        : document.createElement("input");

  control.id = `${state.activeCategoryId}-${field.key}`;
  control.name = field.key;

  if (field.control.type === "select") {
    field.control.options.forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue || "Select an option";
      control.append(option);
    });
  } else if (field.control.type !== "textarea") {
    control.type = "text";
  }

  control.value = value;
  control.placeholder = field.label;
  control.addEventListener("input", () => {
    getActiveValues()[field.key] = control.value;
    saveValues();
    renderMeta();
    renderPrompt();
  });

  return control;
}

function getFieldHint(field) {
  const usage = field.usedIn && field.usedIn.length > 0 ? `Used in: ${field.usedIn.join(", ")}` : "";
  const customHints = {
    android_version_required: "(điền phiên bản Android tối thiểu cần hỗ trợ, ví dụ Android 8.0+)",
    anchor_text_link_type: "(điền anchor text và loại link nội bộ cần dùng)",
    anchor_texts: "(điền danh sách anchor text cần chèn trong bài, mỗi dòng một anchor)",
    brand_site_name: "(điền tên domain hoặc tên website)",
    category: "(điền danh mục nội dung tùy ý, ví dụ VPN, Privacy, Security, Game, App)",
    content_type: "(điền loại nội dung cần viết, ví dụ review, guide, comparison, mod apk)",
    current_version: "(điền phiên bản hiện tại, ví dụ v1.2.3)",
    developer: "(điền tên nhà phát triển hoặc publisher)",
    file_size: "(điền dung lượng file, ví dụ 120 MB)",
    fieldvaluetitle_h1: "(điền tiêu đề H1 đã tạo hoặc tiêu đề chính của bài)",
    game_app_type: "(điền loại game hoặc app, ví dụ Action Game, VPN App, Productivity App)",
    game_name: "(điền tên game hoặc ứng dụng)",
    outline: "(dán outline bài viết: gồm H2/H3, cấu trúc bài và ý chính từng phần)",
    platform: "(điền nền tảng, ví dụ Android, PC, iOS, Web)",
    primary_keyword: "(điền từ khóa chính, giữ đúng cụm keyword cần SEO)",
    secondary_keywords: "(điền các từ khóa phụ, mỗi dòng hoặc cách nhau bằng dấu phẩy)",
    title_h1: "(điền tiêu đề H1 hoặc title chính của bài)",
    version: "(điền phiên bản, ví dụ v1.2.3)",
    vpn_anchor_texts: "(điền danh sách anchor text cho internal link, mỗi dòng một anchor)",
    vpn_article_content: "(dán nội dung bài viết hoặc đoạn nội dung cần dùng làm ngữ cảnh)",
    vpn_brand: "(điền tên domain)",
    vpn_business_goal: "(điền mục tiêu kinh doanh, ví dụ traffic, conversion, download, sign-up)",
    vpn_category: "(điền danh mục VPN tùy ý, ví dụ Privacy, Streaming, Security, Travel)",
    vpn_competitor_outline: "(dán outline đối thủ để tham khảo cấu trúc, H2/H3 và các ý chính)",
    vpn_content_type: "(điền loại nội dung VPN, ví dụ review, guide, comparison, tutorial)",
    vpn_image_context: "(điền bối cảnh hình ảnh cần tạo, ví dụ app screen, privacy concept, secure browsing)",
    vpn_key_benefits_features: "(điền các lợi ích hoặc tính năng chính của VPN, mỗi dòng một ý)",
    vpn_main_entity: "(điền thực thể chính của hình ảnh, ví dụ tên VPN, thiết bị, người dùng, bản đồ)",
    vpn_outline:
      "(dán outline bài viết VPN cần viết: gồm H2/H3, cấu trúc bài, ý chính từng phần, hoặc outline đã tạo từ tab VPN Outline)",
    vpn_primary_keyword: "(điền từ khóa chính VPN, giữ đúng cụm keyword cần SEO)",
    vpn_secondary_keywords: "(điền các từ khóa phụ VPN, mỗi dòng hoặc cách nhau bằng dấu phẩy)",
    vpn_title_h1: "(điền tiêu đề H1 của bài VPN)",
  };
  const customHint = customHints[field.key];

  if (customHint) {
    return customHint;
  }

  const hint = field.control.hint || "";

  return [usage, hint].filter(Boolean).join(" - ");
}

function renderPrompt() {
  const prompt = state.showOriginal ? getActivePrompt() : getRenderedPrompt();
  elements.promptPreview.textContent = prompt || "Loading prompt...";
  elements.toggleModeButton.textContent = state.showOriginal ? "Show filled" : "Show original";
  elements.promptMeta.textContent = getPromptStats(prompt);
}

function getPromptStats(prompt) {
  const characters = prompt.length;
  const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  return `${words.toLocaleString()} words - ${characters.toLocaleString()} characters`;
}

function getRenderedPrompt() {
  const activeTemplate = getActiveTemplate();
  const prompt = getActivePrompt();
  const fields = state.fields[activeTemplate.id] || [];
  const values = getActiveValues();
  let fieldIndex = 0;

  return prompt.replace(/\[\]/g, () => {
    const field = fields[fieldIndex++];
    const value = field ? values[field.key] : "";
    return value ? `[${value}]` : "[]";
  });
}

function getCategory(categoryId) {
  return categories.find((category) => category.id === categoryId) || categories[0];
}

function getDefaultTemplateId(categoryId) {
  const category = getCategory(categoryId);
  return category.defaultTemplateId;
}

function getTemplatesByCategory(categoryId) {
  return templates.filter((template) => template.categoryId === categoryId);
}

function getActiveTemplate() {
  const activeTemplate = templates.find((template) => template.id === state.activeTemplateId);

  if (activeTemplate) {
    return activeTemplate;
  }

  state.activeTemplateId = getDefaultTemplateId(state.activeCategoryId);
  return templates.find((template) => template.id === state.activeTemplateId) || templates[0];
}

function getActivePrompt() {
  return state.prompts[state.activeTemplateId] || "";
}

function getActiveGlobalFields() {
  return state.globalFieldsByCategory[state.activeCategoryId] || [];
}

function getActiveValues() {
  if (!state.values[state.activeCategoryId]) {
    state.values[state.activeCategoryId] = {};
  }

  return state.values[state.activeCategoryId];
}

function loadValues() {
  try {
    const parsedValues = JSON.parse(localStorage.getItem("promptBuilderValues") || "{}");

    if (parsedValues.apk || parsedValues.vpn) {
      return {
        apk: parsedValues.apk || {},
        vpn: parsedValues.vpn || {},
      };
    }

    return {
      apk: parsedValues,
      vpn: {},
    };
  } catch (error) {
    return {
      apk: {},
      vpn: {},
    };
  }
}

function saveValues() {
  localStorage.setItem("promptBuilderValues", JSON.stringify(state.values));
}

function flashStatus(message) {
  const previous = elements.loadStatus.textContent;
  elements.loadStatus.textContent = message;

  window.setTimeout(() => {
    elements.loadStatus.textContent = previous;
  }, 1400);
}

function flashButton(button, message) {
  const previous = button.textContent;
  button.textContent = message;

  window.setTimeout(() => {
    button.textContent = previous;
  }, 1200);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
