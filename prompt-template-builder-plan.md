# Plan: Prompt Template Builder

**Generated**: 2026-05-14
**Estimated Complexity**: Medium

## Overview

Xay dung mot project GitHub cho phep nguoi dung nap mot prompt mau co cac truong can dien, hien thi cac o nhap lieu tuong ung, va tao ra prompt hoan chinh ma khong can copy paste tung dong.

Huong tiep can nen di theo MVP truoc: mot web app nam trong GitHub repository, chay local bang browser/dev server, cho phep paste hoac import prompt mau tu file `.txt`, danh dau cac cho can dien thanh field, render form tu dong, preview ket qua real-time, va copy prompt cuoi cung.

Pham vi da chot:

- Tool chay tu GitHub repository, khong can backend trong MVP.
- Prompt mau hien tai den tu note/file `.txt`.
- Tool chi can tao prompt hoan chinh de copy, khong can goi AI API.

Cu phap placeholder thuc te tu prompt hien co:

```text
Primary Keyword: []
Secondary Keywords: []
Version: []
Game Name: []
```

MVP nen uu tien parser cho pattern `Label: []`: tool lay phan ben trai dau `:` lam ten field, hien o input tuong ung, roi thay `[]` tren dung dong bang gia tri nguoi dung dien.

Van co the ho tro placeholder dat ten ro rang neu can:

```text
Viet bai ve {{topic}}
Giong van: {{tone}}
Doi tuong doc: {{audience}}
Do dai: {{length}}
```

Ve sau co the mo rong placeholder dat ten ro rang thanh metadata:

```text
{{topic:type=text|required=true|label=Chu de}}
{{tone:type=select|options=Trang trong,Than thien,Chuyen gia}}
{{notes:type=textarea|required=false}}
```

## Product Scope

### MVP

- Co 3 phan/template mac dinh tu 3 file prompt hien co: H1, Outline, Writing.
- Click vao phan nao thi workspace dung prompt va form input cua phan do.
- Tao, sua, xoa prompt template.
- Paste prompt mau tu note hoac import file `.txt`.
- Tu dong quet cac cho trong dang `[]`.
- Voi dong dang `Label: []`, tao field theo `Label`.
- Ho tro them cu phap `{{field_name}}` neu prompt khong co label gan `[]`.
- Tao form nhap lieu tu cac placeholder.
- Preview prompt da dien theo thoi gian thuc.
- Nut copy prompt hoan chinh.
- Luu template va lan dien gan nhat tren may nguoi dung.
- Import file `.txt`; export template dang JSON hoac `.txt` da gan placeholder.

### Post-MVP

- Thu vien template theo nhom: marketing, coding, viet noi dung, research, sales.
- Placeholder co kieu du lieu: text, textarea, select, checkbox, number, date.
- Dieu kien hien thi field theo lua chon khac.
- Bien toan cuc dung lai nhieu template, vi du `brand_name`, `target_market`.
- Versioning template.
- Chia se template bang link hoac file.
- Dang nhap va sync cloud neu sau nay can.
- Team workspace va phan quyen neu sau nay can.

## Suggested Tech Stack

- Frontend: React + TypeScript + Vite.
- Styling: Tailwind CSS hoac CSS modules, tuy theo muc tieu don gian hay co design system.
- Local storage: IndexedDB thong qua Dexie, hoac `localStorage` cho MVP cuc gon.
- Template parsing: parser nho tu viet cho cu phap `[]` theo dong va tuy chon `{{...}}`, sau nay tach thanh module rieng.
- Testing: Vitest cho parser va logic render, Playwright cho flow nguoi dung.
- Deployment: GitHub Pages, Vercel, hoac Netlify.

Neu muc tieu la project GitHub gon, de nguoi khac clone va chay nhanh, React + Vite + TypeScript la lua chon phu hop. MVP khong can backend, database server, dang nhap, hay API key AI.

## Core Data Model

```ts
type PromptTemplate = {
  id: string;
  name: string;
  description?: string;
  sourceFileName?: string;
  content: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
};

type TemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "date" | "checkbox";
  required: boolean;
  defaultValue?: string;
  options?: string[];
};

type PromptFill = {
  templateId: string;
  values: Record<string, string | number | boolean>;
  updatedAt: string;
};
```

## Existing Prompt Files Reviewed

Da xem 3 file prompt trong repository:

- `heading_1_game_apk.txt`: prompt tao H1. UI label de xuat: `H1`.
- `# 🌍 FINAL OUTLINE PROMPT V2 – APK.txt`: prompt tao outline. UI label de xuat: `Outline`.
- `✅ FINAL WRITING PROMPT V2 – APK  MO.txt`: prompt viet bai. UI label de xuat: `Writing`.

Danh sach field `[]` tim thay:

### H1 Prompt

- Primary Keyword
- Secondary Keywords
- Current Version
- Platform
- Content Type
- Game/App Type

### Outline Prompt

- Title / H1
- Primary Keyword
- Secondary Keywords
- Version
- Category
- Developer
- File Size
- Android Version Required
- Anchor Text / Link Type

### Writing Prompt

- Title / H1
- Outline
- Primary Keyword
- Secondary Keywords
- Anchor Texts
- Game Name
- Version

Nhan xet: 3 file da du tot de lam seed templates cho app. Pattern `Label: []` ro rang hon viec de trong ngau nhien, nen tool co the tu sinh form ma khong can nguoi dung dat lai field theo `{{field}}`.

## Sprint 1: Static Prototype

**Goal**: Co giao dien dau tien voi 3 phan H1/Outline/Writing, click de chon prompt, tu quet `[]`, hien form field, va xem preview.

**Demo/Validation**:

- Chay app local.
- Click tab/card `H1`, app hien prompt H1 va form H1.
- Click tab/card `Outline`, app hien prompt outline va form outline.
- Click tab/card `Writing`, app hien prompt writing va form writing.
- Dan prompt mau tu note txt co cac dong `Primary Keyword: []`, `Version: []`.
- App hien 3 o nhap.
- Dien vao form thi preview cap nhat dung.

### Task 1.1: Scaffold Project

- **Location**: `package.json`, `src/`, `index.html`
- **Description**: Tao project React + TypeScript + Vite.
- **Dependencies**: None
- **Acceptance Criteria**:
  - App chay duoc bang `npm run dev`.
  - Co script `build`, `test`, `lint` neu dung lint.
- **Validation**:
  - `npm run build` thanh cong.

### Task 1.2: Build Base Layout

- **Location**: `src/App.tsx`, `src/styles.css`
- **Description**: Tao layout gom selector 3 phan H1/Outline/Writing, editor prompt mau, panel form, va panel preview/copy.
- **Dependencies**: Task 1.1
- **Acceptance Criteria**:
  - Co 3 tab/card/segmented buttons: `H1`, `Outline`, `Writing`.
  - Click tab nao thi editor va form doi theo prompt do.
  - Desktop hien workspace ro rang: editor, form, preview.
  - Mobile stack thanh tung khu vuc doc de de thao tac.
- **Validation**:
  - Kiem tra thu cong tren desktop va mobile viewport.

### Task 1.3: Parse Empty Brackets

- **Location**: `src/lib/templateParser.ts`
- **Description**: Viet ham lay danh sach field tu chuoi template voi cu phap `[]`, uu tien lay label o cung dong truoc dau `:`.
- **Dependencies**: Task 1.1
- **Acceptance Criteria**:
  - Dong `Primary Keyword: []` tao field key `primary_keyword`, label `Primary Keyword`.
  - Dong `Title / H1: []` tao field key hop le, label van hien `Title / H1`.
  - Nhieu `[]` tren cac dong khac nhau duoc tach thanh field rieng.
  - Neu gap `[]` khong co label, dat ten tam `Field 1`, `Field 2` va cho nguoi dung doi ten.
- **Validation**:
  - Unit test voi 3 file prompt hien co.

### Task 1.4: Render Dynamic Form

- **Location**: `src/components/FieldForm.tsx`
- **Description**: Tao form tu danh sach placeholder.
- **Dependencies**: Task 1.3
- **Acceptance Criteria**:
  - Moi placeholder co mot input.
  - Label doc duoc tu field key, vi du `target_audience` thanh `Target audience`.
  - State form cap nhat khi template thay doi.
- **Validation**:
  - Unit/integration test voi React Testing Library hoac test thu cong.

### Task 1.5: Import TXT Into Editor

- **Location**: `src/components/TxtImportButton.tsx`, `src/lib/readTextFile.ts`
- **Description**: Cho phep nguoi dung chon file `.txt`, doc noi dung, va nap vao editor.
- **Dependencies**: Task 1.2
- **Acceptance Criteria**:
  - Chi chap nhan file `.txt` hoac text/plain.
  - Giu nguyen xuong dong va khoang trang trong prompt.
  - Ten file duoc dung lam ten template mac dinh neu chua co ten.
- **Validation**:
  - Import thu file txt co nhieu dong, dong trong, va ky tu tieng Viet.

### Task 1.6: Seed Three Prompt Templates

- **Location**: `src/data/defaultTemplates.ts`
- **Description**: Dua 3 prompt hien co vao app lam template mac dinh cho 3 phan H1/Outline/Writing.
- **Dependencies**: Task 1.2, Task 1.3
- **Acceptance Criteria**:
  - Lan dau mo app co san 3 phan.
  - Moi phan load dung prompt tu file tuong ung.
  - Moi phan co field form rieng theo cac `[]` cua prompt do.
- **Validation**:
  - Manual click qua 3 phan va doi chieu so field.

### Task 1.7: Generate Preview

- **Location**: `src/lib/renderTemplate.ts`, `src/components/PromptPreview.tsx`
- **Description**: Thay tung `[]` bang gia tri nguoi dung da nhap theo dung thu tu field da parse.
- **Dependencies**: Task 1.3, Task 1.4
- **Acceptance Criteria**:
  - `[]` chua co gia tri duoc giu lai hoac hien trang thai can dien.
  - Cac field co label trung lap duoc gan key rieng neu nam o ngu canh khac nhau.
  - Nut copy prompt hoan chinh hoat dong.
- **Validation**:
  - Unit test render.
  - Test copy bang browser.

## Sprint 2: Template Management

**Goal**: Nguoi dung co the luu trang thai rieng cho tung phan H1/Outline/Writing, va sau nay co the quan ly them prompt mau neu can.

**Demo/Validation**:

- Chuyen qua lai giua 3 phan.
- Gia tri da dien o moi phan duoc giu rieng.
- Reload browser van con du lieu.

### Task 2.1: Add Template Store

- **Location**: `src/lib/storage.ts`, `src/state/templates.ts`
- **Description**: Luu template vao `localStorage` hoac IndexedDB.
- **Dependencies**: Sprint 1
- **Acceptance Criteria**:
  - Co CRUD template.
  - Co template mau mac dinh khi lan dau mo app.
  - Du lieu khong mat sau reload.
- **Validation**:
  - Unit test storage adapter.
  - Manual reload test.

### Task 2.2: Template Sidebar

- **Location**: `src/components/TemplateList.tsx`
- **Description**: Hien 3 phan H1/Outline/Writing va chuan bi cau truc de mo rong template sau nay.
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Chon template cap nhat editor va preview.
  - 3 template mac dinh khong bi xoa nham trong MVP.
  - UI cho biet template nao dang active.
- **Validation**:
  - Manual workflow test.

### Task 2.3: Autosave

- **Location**: `src/hooks/useAutosave.ts`
- **Description**: Tu dong luu noi dung template va gia tri da dien.
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Thay doi template duoc luu sau debounce ngan.
  - Gia tri form gan nhat duoc khoi phuc.
  - Co trang thai "saved" hoac "saving" neu can.
- **Validation**:
  - Manual reload test.

## Sprint 3: Rich Field Syntax

**Goal**: Cho phep placeholder dinh nghia loai input va lua chon.

**Demo/Validation**:

- Template co `{{tone:type=select|options=Friendly,Formal}}`.
- App hien dropdown thay vi input text.
- Render prompt dung gia tri da chon.

### Task 3.1: Extend Parser

- **Location**: `src/lib/templateParser.ts`
- **Description**: Ho tro them cu phap named placeholder `{{field_name}}` va metadata trong placeholder neu can.
- **Dependencies**: Sprint 1
- **Acceptance Criteria**:
  - Ho tro `type`, `label`, `required`, `default`, `options`.
  - Loi metadata duoc hien ro, khong lam crash app.
  - Van tuong thich voi `{{field_name}}`.
- **Validation**:
  - Unit test parser voi simple va rich syntax.

### Task 3.2: Field Type Components

- **Location**: `src/components/fields/`
- **Description**: Tao input component cho text, textarea, select, checkbox, number, date.
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Field render dung theo type.
  - Required validation hoat dong.
  - Default value duoc ap dung khi template moi load.
- **Validation**:
  - Component tests hoac manual tests.

### Task 3.3: Validation UX

- **Location**: `src/components/FieldForm.tsx`, `src/lib/validation.ts`
- **Description**: Hien field thieu, disable copy final neu required field chua dien.
- **Dependencies**: Task 3.2
- **Acceptance Criteria**:
  - Nguoi dung biet field nao dang thieu.
  - Preview danh dau placeholder chua duoc thay.
  - Khong mat input khi template co loi parse nho.
- **Validation**:
  - Test required field va parse error.

## Sprint 4: Import, Export, and Sharing

**Goal**: Bien project thanh cong cu co the chia se template qua GitHub de nguoi khac dung lai.

**Demo/Validation**:

- Export template thanh file JSON hoac `.txt` co placeholder.
- Import file JSON vao app khac.
- Co thu muc examples trong repo.

### Task 4.1: Define Template File Format

- **Location**: `docs/template-format.md`, `examples/*.json`, `examples/*.txt`
- **Description**: Dinh nghia schema file template va convention cho file `.txt`.
- **Dependencies**: Sprint 2, Sprint 3
- **Acceptance Criteria**:
  - Co vi du template `.txt` don gian va JSON.
  - Co mo ta cac field metadata.
  - File format co version, vi du `schemaVersion: 1`.
- **Validation**:
  - Review doc va import thu example.

### Task 4.2: Import/Export JSON

- **Location**: `src/lib/importExport.ts`, `src/components/ImportExportMenu.tsx`
- **Description**: Them chuc nang tai template ra file va nap tu file.
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - Export dung schema.
  - Import validate truoc khi luu.
  - Loi file khong hop le duoc hien ro.
- **Validation**:
  - Unit test schema validation.
  - Manual import/export round trip.

### Task 4.3: Export TXT Template

- **Location**: `src/lib/importExport.ts`, `src/components/ImportExportMenu.tsx`
- **Description**: Cho phep tai template hien tai ra file `.txt` voi placeholder.
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - Export giu nguyen format prompt.
  - File `.txt` export co the import lai.
  - Ten file than thien, dua tren ten template.
- **Validation**:
  - Manual export/import round trip voi file txt.

### Task 4.4: GitHub-Friendly Examples

- **Location**: `README.md`, `examples/`
- **Description**: Them huong dan va bo template mau.
- **Dependencies**: Task 4.1, Task 4.2, Task 4.3
- **Acceptance Criteria**:
  - README co quick start.
  - README co huong dan viet placeholder.
  - Co it nhat 5 template mau.
- **Validation**:
  - Clone repo moi va lam theo README.

## Sprint 5: Polish and Deployment

**Goal**: Hoan thien de publish project GitHub va co demo online.

**Demo/Validation**:

- App build production thanh cong.
- Demo online truy cap duoc.
- README day du thong tin cai dat va su dung.

### Task 5.1: Responsive and Accessibility Pass

- **Location**: `src/`
- **Description**: Kiem tra layout, keyboard navigation, label, focus state, contrast.
- **Dependencies**: Sprint 1-4
- **Acceptance Criteria**:
  - Dung duoc tren mobile.
  - Input co label dung.
  - Nut va form co focus state.
- **Validation**:
  - Browser test tren mobile/desktop.
  - Basic accessibility scan neu co cong cu.

### Task 5.2: Production Build

- **Location**: `package.json`, config deploy
- **Description**: Cau hinh build va deploy len GitHub Pages/Vercel.
- **Dependencies**: Sprint 1-4
- **Acceptance Criteria**:
  - `npm run build` thanh cong.
  - Co workflow deploy neu dung GitHub Pages.
  - Demo URL hoat dong.
- **Validation**:
  - Truy cap demo sau deploy.

### Task 5.3: Project Documentation

- **Location**: `README.md`, `docs/`
- **Description**: Viet tai lieu cho nguoi dung va contributor.
- **Dependencies**: Sprint 1-4
- **Acceptance Criteria**:
  - Co install, run, build, test.
  - Co giai thich placeholder syntax.
  - Co roadmap va contribution guide ngan.
- **Validation**:
  - Nguoi moi co the clone va chay app trong vai phut.

## Testing Strategy

- Unit test parser: placeholder don gian, duplicate field, invalid placeholder, rich metadata.
- Unit test parser voi `[]`: line label, label co ky tu `/`, dong khong co label, nhieu field, duplicate label.
- Unit test renderer: thay the field, missing value, escaped characters neu co.
- Unit test storage: save, update, delete, restore.
- Unit test/import manual test cho file `.txt`: giu xuong dong, khoang trang, tieng Viet.
- Component test form: render dung input theo field type.
- End-to-end test:
  - Tao template.
  - Dien field.
  - Copy final prompt.
  - Reload va kiem tra du lieu con.
  - Import/export template.

## UX Notes

- Man hinh chinh nen la workspace lam viec, khong phai landing page.
- Bo cuc MVP nen co 2 ben chinh:
  - Ben trai: cac o nhap du lieu duoc sinh tu dong theo tung field trong prompt.
  - Ben phai: toan bo prompt template/preview, giu nguyen noi dung goc va hien ket qua thay the cac vi tri `[]`.
- Phia tren hoac ben canh workspace co 3 phan de chon: `H1`, `Outline`, `Writing`; click phan nao thi dung prompt va input cua phan do.
- Prompt hoan chinh co the hien trong preview drawer/modal hoac khu vuc copy rieng ben duoi/nut "Preview & Copy", de khong lam roi bo cuc 2 ben chinh.
- Can co action nhanh de bien doan dang chon trong editor thanh `{{field_name}}`, vi nguoi dung dang co file txt voi cho trong chua duoc danh dau.
- Field bi thieu nen duoc danh dau truc tiep tai form va preview.
- Can co nut copy ro rang va feedback ngan sau khi copy.
- Khong nen bat nguoi dung hoc cu phap phuc tap trong MVP; voi prompt hien tai, `[]` la du de khoi dau.

## Potential Risks & Gotchas

- Placeholder syntax qua phuc tap se lam nguoi dung kho viet template. Nen bat dau voi `[]` va label tren cung dong; metadata la nang cao.
- File `.txt` chi co `[]` nhung khong co label gan do thi may khong the luon biet do la field nao. MVP nen tao ten tam `Field 1`, `Field 2` va cho nguoi dung doi label.
- Neu dung regex qua don gian, cac case nhu `{{ field | options=a,b }}` co the loi. Nen tach parser thanh module rieng va test ky.
- Gia tri nguoi dung co the chua ky tu dac biet. Can render theo text, khong inject HTML.
- `localStorage` co gioi han dung luong. Neu template nhieu, chuyen sang IndexedDB.
- Import file can validate schema de tranh lam hong data hien tai.
- Khong can tich hop AI API trong pham vi hien tai; neu sau nay them, khong bao gio luu API key client-side cho public app.

## Rollback Plan

- Neu rich syntax gay phuc tap, giu lai simple syntax va an tinh nang metadata sau flag noi bo.
- Neu storage moi gay loi, export du lieu hien tai sang JSON truoc khi migrate.
- Neu deploy GitHub Pages gap loi routing, dung hash router hoac Vercel truoc de co demo nhanh.

## Decisions

1. Lam thanh mot GitHub repository chay duoc local va co the deploy thanh static web app.
2. Nguon prompt ban dau la note/file `.txt` co cac cho can dien bang `[]`.
3. Tool chi tao prompt hoan chinh de copy, khong tich hop AI API trong MVP.

## Remaining Product Question

Can chot cach tool xu ly `[]` nam trong bang Markdown hoac dong khong co dau `:`:

- Khuyen nghi: neu co `Label: []`, lay `Label` lam field.
- Neu dong dang `| Anchor Text | Link Type: []`, lay label gan nhat truoc `[]`, vi du `Link Type`.
- Neu khong suy ra duoc, tao field tam va cho nguoi dung doi ten trong UI.
