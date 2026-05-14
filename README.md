# Prompt Input Builder

Static GitHub Pages tool for filling reusable SEO prompt templates.

## What It Does

- Shows 3 prompt sections: `H1`, `Outline`, and `Writing`.
- Left side: input fields generated from `[]` placeholders.
- Right side: prompt preview with the input values filled in.
- Copies the completed prompt to your clipboard.
- Saves your latest inputs in the browser.

## Folder Structure

```txt
.
├─ index.html
├─ styles.css
├─ app.js
└─ prompts/
   ├─ heading_1_game_apk.txt
   ├─ final_outline_prompt_v2_apk.txt
   └─ final_writing_prompt_v2_apk_mo.txt
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

Edit the files in `prompts/`.

Use `[]` where you want the tool to create an input field:

```txt
Primary Keyword: []
Secondary Keywords: []
Version: []
```

The app uses the label before `:` as the input name.

## Local Preview

Because the app loads `.txt` files with `fetch`, opening `index.html` directly may be blocked by the browser. Use a local server if you want to test before uploading:

```txt
python -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```
