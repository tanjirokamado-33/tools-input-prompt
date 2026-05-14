const templates = [
  {
    id: "h1",
    label: "H1",
    title: "H1 Prompt",
    inputTitle: "H1 Inputs",
    path: "./prompts/heading_1_game_apk.txt",
  },
  {
    id: "outline",
    label: "Outline",
    title: "Outline Prompt",
    inputTitle: "Outline Inputs",
    path: "./prompts/final_outline_prompt_v2_apk.txt",
  },
  {
    id: "writing",
    label: "Writing",
    title: "Writing Prompt",
    inputTitle: "Writing Inputs",
    path: "./prompts/final_writing_prompt_v2_apk_mo.txt",
  },
];

const state = {
  activeTemplateId: "h1",
  showOriginal: false,
  prompts: {},
  fields: {},
  globalFields: [],
  values: loadValues(),
};

const elements = {
  loadStatus: document.querySelector("#loadStatus"),
  tabs: [...document.querySelectorAll("[data-template-id]")],
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
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTemplateId = tab.dataset.templateId;
      state.showOriginal = false;
      render();
    });
  });

  elements.clearButton.addEventListener("click", () => {
    state.values = {};
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

  state.globalFields = buildGlobalFields();

  elements.loadStatus.textContent = "3 prompts ready";
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

function buildGlobalFields() {
  const globalFieldMap = new Map();

  templates.forEach((template) => {
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

  if (["outline", "secondary keywords", "anchor texts", "mod features"].includes(normalized)) {
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
        "Auto-detect from Primary Keyword",
      ],
    };
  }

  if (normalized.includes("platform")) {
    return { type: "select", options: ["", "Android", "PC", "iOS", "Console", "Web"] };
  }

  if (normalized.includes("category")) {
    return { type: "select", options: ["", "Game", "App", "Tools", "Action", "RPG", "Simulation"] };
  }

  return { type: "text" };
}

function render() {
  const activeTemplate = getActiveTemplate();

  elements.tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.templateId === activeTemplate.id);
  });

  elements.inputTitle.textContent = "All Prompt Inputs";
  elements.promptTitle.textContent = activeTemplate.title;
  elements.toggleModeButton.textContent = state.showOriginal ? "Show filled" : "Show original";

  renderMeta();
  renderForm();
  renderPrompt();
}

function renderMeta() {
  const fields = state.globalFields || [];
  const values = state.values || {};
  const filledCount = fields.filter((field) => String(values[field.key] || "").trim()).length;

  elements.inputMeta.textContent = `${filledCount}/${fields.length} shared fields filled`;
}

function renderForm() {
  const fields = state.globalFields || [];
  const values = state.values || {};

  elements.fieldForm.innerHTML = "";

  if (fields.length === 0) {
    elements.fieldForm.innerHTML =
      '<p class="empty-state">No [] fields found in this prompt.</p>';
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

  control.id = `${state.activeTemplateId}-${field.key}`;
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
    state.values[field.key] = control.value;
    saveValues();
    renderMeta();
    renderPrompt();
  });

  return control;
}

function getFieldHint(field) {
  const usage = field.usedIn && field.usedIn.length > 0 ? `Used in: ${field.usedIn.join(", ")}` : "";
  const hint = field.control.hint || "";

  return [usage, hint].filter(Boolean).join(" · ");
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
  return `${words.toLocaleString()} words · ${characters.toLocaleString()} characters`;
}

function getRenderedPrompt() {
  const activeTemplate = getActiveTemplate();
  const prompt = getActivePrompt();
  const fields = state.fields[activeTemplate.id] || [];
  const values = state.values || {};
  let fieldIndex = 0;

  return prompt.replace(/\[\]/g, () => {
    const field = fields[fieldIndex++];
    const value = field ? values[field.key] : "";
    return value ? `[${value}]` : "[]";
  });
}

function getActiveTemplate() {
  return templates.find((template) => template.id === state.activeTemplateId) || templates[0];
}

function getActivePrompt() {
  return state.prompts[state.activeTemplateId] || "";
}

function loadValues() {
  try {
    return JSON.parse(localStorage.getItem("promptBuilderValues") || "{}");
  } catch (error) {
    return {};
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
