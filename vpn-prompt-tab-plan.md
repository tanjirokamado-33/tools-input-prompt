# Plan: Add VPN Prompt Tab

**Generated**: 2026-05-18
**Estimated Complexity**: Medium

## Overview
Add a new VPN prompt area to the existing static Prompt Studio so users can switch between current Game/App APK prompts and the new VPN SEO prompts in `prompts/prompt_VPN`.

The current app has three hard-coded APK tabs in `index.html` and `app.js`: `H1`, `Outline`, and `Writing`. The VPN prompts already exist as `.txt` files, so the main implementation work is UI grouping, template registration, file renaming, field parsing compatibility, and verification that all prompt files load correctly from their actual paths.

Recommended UX: add a top-level category switch with two groups:

- `Game/App APK`
- `VPN SEO`

Inside each group, show prompt tabs for that category only. This avoids mixing APK and VPN inputs in one huge shared form.

Confirmed decisions:

- VPN must be fully separated from APK.
- Add all 5 VPN tabs in the first implementation.
- Rename VPN prompt files to stable ASCII filenames if useful.

## Prerequisites
- Existing static app remains framework-free: `index.html`, `styles.css`, `app.js`.
- Use existing `fetch()` prompt-loading approach.
- Keep prompt files as `.txt`.
- Rename VPN prompt files to ASCII names before wiring them into `app.js`.
- Serve locally with a static server for validation because direct `file://` can block `fetch()`.

## Sprint 1: Map Prompt Inventory and Fix Template Sources
**Goal**: Ensure all prompt templates are referenced from the correct folders and decide the final VPN tab list.

**Demo/Validation**:
- App can load the existing APK prompt files from `prompts/prompt_APK`.
- VPN prompt file paths are known and ready to register.
- No 404s for prompt `.txt` files.

### Task 1.1: Confirm Existing APK Path Usage
- **Location**: `app.js`, `prompts/prompt_APK/*`
- **Description**: Update the existing APK template paths if needed. Current `app.js` points to `./prompts/heading_1_game_apk.txt`, `./prompts/final_outline_prompt_v2_apk.txt`, and `./prompts/final_writing_prompt_v2_apk_mo.txt`, while the files are present under `prompts/prompt_APK/`.
- **Dependencies**: None
- **Acceptance Criteria**:
  - Existing APK prompts still load.
  - Existing three APK tabs still work.
- **Validation**:
  - Run local server and check browser/network console for missing prompt files.

### Task 1.2: Define VPN Template Metadata
- **Location**: `app.js`, `prompts/prompt_VPN/*`
- **Description**: Rename VPN prompt files to stable ASCII filenames, then register VPN prompt templates with stable IDs, labels, titles, input titles, and file paths.
- **Dependencies**: Task 1.1
- **Acceptance Criteria**:
  - Every VPN prompt file has a mapped template entry.
  - IDs are ASCII and stable, for example `vpn-outline`, `vpn-writing`, `vpn-meta`, `vpn-alt-text`, `vpn-image`.
  - Filenames are ASCII and readable, for example:
    - `vpn_image_prompt.txt`
    - `vpn_alt_text_prompt.txt`
    - `vpn_meta_tags_prompt.txt`
    - `vpn_writing_prompt.txt`
    - `vpn_outline_prompt.txt`
- **Validation**:
  - Confirm all paths match files in `prompts/prompt_VPN`.

### Task 1.3: Decide Visible VPN Tab Names
- **Location**: `index.html`, `app.js`
- **Description**: Use concise tab labels:
  - `VPN Outline`
  - `VPN Writing`
  - `VPN Meta`
  - `VPN Alt Text`
  - `VPN Image`
- **Dependencies**: Task 1.2
- **Acceptance Criteria**:
  - Names are short enough for desktop and mobile.
  - Labels clearly distinguish VPN prompts from APK prompts.
- **Validation**:
  - Visual review at desktop and narrow viewport.

## Sprint 2: Add Category-Aware Tabs
**Goal**: Add a clean UI model that supports multiple prompt groups without duplicating rendering logic.

**Demo/Validation**:
- User can switch between `Game/App APK` and `VPN SEO`.
- Each category shows only its own prompt tabs.
- Active prompt preview updates correctly.

### Task 2.1: Restructure Template Data
- **Location**: `app.js`
- **Description**: Add a `category` or `group` field to template definitions. Keep one `templates` array, then derive visible templates based on active group.
- **Dependencies**: Sprint 1
- **Acceptance Criteria**:
  - Current APK templates are assigned to `apk`.
  - New VPN templates are assigned to `vpn`.
  - Existing render functions continue to use the active template object.
- **Validation**:
  - Manual switch through all APK and VPN templates.

### Task 2.2: Add Category Navigation
- **Location**: `index.html`, `styles.css`, `app.js`
- **Description**: Add top-level category buttons above the prompt tabs. Keep visual hierarchy clear: category switch first, prompt tabs second.
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - `Game/App APK` is active by default to preserve current behavior.
  - Clicking `VPN SEO` sets a valid default VPN template, likely `VPN Outline`.
  - ARIA labels remain meaningful.
- **Validation**:
  - Keyboard/tab navigation works.
  - Active state styling is visible.

### Task 2.3: Render Prompt Tabs Dynamically
- **Location**: `index.html`, `app.js`
- **Description**: Replace hard-coded prompt tab button handling with dynamic rendering from template metadata, or update the hard-coded HTML carefully if keeping the current simple structure.
- **Dependencies**: Task 2.2
- **Acceptance Criteria**:
  - No duplicated event binding for new prompt tabs.
  - Active tab state updates correctly within each group.
  - Adding future prompt files only requires changing metadata, not multiple UI locations.
- **Validation**:
  - Switch category, switch prompt, fill fields, preview remains correct.

## Sprint 3: Scope Input Fields by Category
**Goal**: Prevent APK and VPN fields from merging into one shared input panel.

**Demo/Validation**:
- In APK mode, shared inputs are built only from APK prompts.
- In VPN mode, shared inputs are built only from VPN prompts.

### Task 3.1: Make Global Fields Group-Aware
- **Location**: `app.js`
- **Description**: Update `buildGlobalFields()` to accept the active group or build a map per group. The current implementation merges fields from all templates, which would become noisy after adding VPN.
- **Dependencies**: Sprint 2
- **Acceptance Criteria**:
  - `All Prompt Inputs` reflects the active group only.
  - `Used in:` hints list only templates in that group.
  - Switching groups updates input count and field list.
- **Validation**:
  - Compare field lists in `Game/App APK` vs `VPN SEO`.

### Task 3.2: Preserve Values Without Collisions
- **Location**: `app.js`
- **Description**: Review localStorage key behavior. Field keys like `primary_keyword` can be intentionally shared across categories, but VPN-specific values may overwrite APK-specific values if users switch categories.
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Values are namespaced by category to avoid cross-contamination.
  - APK and VPN can both have fields like `primary_keyword`, but their saved values remain separate.
  - Use a clear storage shape or key convention, for example `values.apk.primary_keyword` and `values.vpn.primary_keyword`.
- **Validation**:
  - Fill APK primary keyword, switch to VPN, fill different keyword, switch back and confirm values persist separately.

### Task 3.3: Improve Field Control Inference for VPN
- **Location**: `app.js`
- **Description**: Extend `inferControl()` for VPN fields such as `Target Market`, `Business Goal`, `VPN App Name`, `Premium / MOD Features`, `SERP data`, `Article content`, and `Target audience`.
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Long fields use textarea.
  - Repeated option fields use select only when the options are stable and useful.
  - Existing APK control behavior is unchanged.
- **Validation**:
  - Visual check that large VPN inputs are not cramped.

## Sprint 4: Verification and Documentation
**Goal**: Confirm the VPN tab works end to end and document the new prompt folder structure.

**Demo/Validation**:
- Open local app, switch through all APK and VPN tabs, fill sample values, copy prompt.
- README reflects the new grouped prompt system.

### Task 4.1: Local Runtime Test
- **Location**: Browser runtime
- **Description**: Start a local static server and verify all prompts load.
- **Dependencies**: Sprints 1-3
- **Acceptance Criteria**:
  - Load status shows all expected prompts ready.
  - No missing file errors.
  - Copy button works.
- **Validation**:
  - Test in browser from `http://localhost:8000` or another available port.

### Task 4.2: Responsive UI Check
- **Location**: `styles.css`, browser runtime
- **Description**: Check tab wrapping and category navigation on mobile-sized viewport.
- **Dependencies**: Sprints 1-3
- **Acceptance Criteria**:
  - Category buttons and prompt tabs do not overlap.
  - Prompt/action buttons remain usable.
  - Text fits inside controls.
- **Validation**:
  - Browser screenshot or manual viewport resize.

### Task 4.3: Update README
- **Location**: `README.md`
- **Description**: Document grouped prompts and folder paths:
  - `prompts/prompt_APK`
  - `prompts/prompt_VPN`
- **Dependencies**: Sprints 1-3
- **Acceptance Criteria**:
  - README no longer says the app only has 3 prompt sections.
  - Local preview instructions remain accurate.
- **Validation**:
  - Read README and verify examples match the actual paths.

## Testing Strategy
- Static load test: run a local server and verify every prompt path returns 200.
- UI flow test: switch category, switch prompt tab, fill shared fields, preview rendered prompt, show original, copy prompt.
- Persistence test: reload page and confirm stored values behave according to the chosen category scoping.
- Regression test: existing APK `H1`, `Outline`, and `Writing` flows still work.
- Responsive test: verify top navigation and prompt tabs at desktop and mobile widths.

## Potential Risks & Gotchas
- Current `app.js` paths appear to reference old prompt locations, while files now exist in `prompts/prompt_APK`. This should be fixed before adding VPN to avoid confusing a new-tab implementation with an existing load bug.
- Current VPN filenames contain spaces, brackets, Vietnamese text, and emoji. Rename them to ASCII filenames during implementation to reduce GitHub Pages and cross-platform path risk.
- The prompt files appear to display mojibake in terminal output. Browser rendering may still be fine if the files are valid UTF-8, but this should be verified visually. If the text is actually mis-encoded, fix encoding before relying on the prompts.
- Field labels may duplicate across APK and VPN. Decide whether shared SEO fields should be global across all prompt groups or isolated per group.
- Loading all prompts at startup is fine for the current file count, but if many more prompt categories are added later, lazy loading by category may be cleaner.

## Rollback Plan
- Revert `index.html`, `styles.css`, and `app.js` changes related to category navigation and VPN templates.
- Keep `prompts/prompt_VPN` files untouched unless a file rename was part of implementation.
- Restore previous localStorage behavior by keeping the original `promptBuilderValues` key if namespacing causes issues.

## Confirmed Scope
- VPN prompt values must be separate from APK values.
- Add all five VPN tabs now: `VPN Outline`, `VPN Writing`, `VPN Meta`, `VPN Alt Text`, and `VPN Image`.
- Rename VPN prompt files to ASCII filenames and update all references.
