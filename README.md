# Prompt Input Builder

Static GitHub Pages tool for filling reusable SEO prompt templates.

## What It Does

- Shows separated prompt categories: `Game/App APK` and `VPN SEO`.
- `Game/App APK` includes `H1`, `Outline`, and `Writing`.
- `VPN SEO` includes `VPN H1`, `VPN Outline`, `VPN Writing`, `VPN Meta`, `VPN Alt Text`, and `VPN Image`.
- Left side: one shared input list generated from the active prompt category.
- Duplicate fields such as `Primary Keyword`, `Secondary Keywords`, and `Version` appear only once inside the active category.
- APK and VPN inputs are saved separately in the browser, so values do not mix across categories.
- Right side: prompt preview with the input values filled in as `[value]`.
- Copies the completed prompt to your clipboard.
- Saves your latest inputs in the browser.
- Shows filled-field progress and prompt word/character counts.

## Folder Structure

```txt
.
|-- index.html
|-- styles.css
|-- app.js
|-- dev-server.js
`-- prompts/
    |-- prompt_APK/
    |   |-- heading_1_game_apk.txt
    |   |-- final_outline_prompt_v2_apk.txt
    |   `-- final_writing_prompt_v2_apk_mo.txt
    `-- prompt_VPN/
        |-- vpn_heading1_prompt.txt
        |-- vpn_outline_prompt.txt
        |-- vpn_writing_prompt.txt
        |-- vpn_meta_tags_prompt.txt
        |-- vpn_alt_text_prompt.txt
        `-- vpn_image_prompt.txt
```

## Run on GitHub Pages

1. Create a new GitHub repository.
2. Upload all files and folders from this directory into the repository root.
3. Open the repository on GitHub.
4. Go to `Settings` -> `Pages`.
5. Under `Build and deployment`, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Click `Save`.
7. Wait for GitHub Pages to publish the site.

Your tool will run at:

```txt
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/
```

## Edit Prompts

Edit the files in `prompts/prompt_APK/` or `prompts/prompt_VPN/`.

Use `[]` where you want the tool to create an input field:

```txt
Primary Keyword: []
Secondary Keywords: []
Version: []
```

The app uses the label before `:` as the input name.

When you type `abc` into an input, the prompt output keeps the bracket format:

```txt
[abc]
```

## Local Preview

Because the app loads `.txt` files with `fetch`, opening `index.html` directly may be blocked by the browser. Use the included Node local server if you want to test before uploading:

```txt
node dev-server.js
```

Then open:

```txt
http://127.0.0.1:8017
```
