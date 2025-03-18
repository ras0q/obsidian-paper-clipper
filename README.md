# Paper Clipper

[![release](https://img.shields.io/github/manifest-json/v/ras0q/obsidian-paper-clipper.svg?color=A68AF9&style=for-the-badge&logo=github)](https://github.com/ras0q/obsidian-paper-clipper/releases/latest)
[![downloads](https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json&query=$['paper-clipper'].downloads&label=Downloads&color=A68AF9&style=for-the-badge&logo=obsidian&)](https://obsidian.md/plugins?id=paper-clipper)

An [Obsidian](https://obsidian.md/) plugin to capture and manage academic papers

![thumbnail](./public/thumbnail.gif)

## Features

> [!CAUTION]
> This plugin is a work in progress. Please report any issues you encounter.
>
> [Discussion on Reddit](https://www.reddit.com/r/ObsidianMD/comments/1ioa6ai/creating_a_plugin_that_clips_academic_papers_by/)

- [x] Fetch full-text PDFs and metadata from open access sources using a DOI
- [ ] Extract DOI and metadata from existing PDFs
- [ ] Auto-organize papers with citation-ready formatting
- [x] Import PDFs into Obsidian with a [bookmarklet](#importing-pdfs)

### Importing PDFs

This plugin implements a custom URI scheme to import PDFs into Obsidian.

```plaintext
obsidian://clip-paper?file=<file-path>&open=<true|false>
```

- `file` (optional): The path to the PDF file relative to the vault root
- `open` (optional): Whether to open the PDF after importing

You can use the following bookmarklet to import PDFs into Obsidian:

```js
javascript:(async()=>{try{const url=location.href;if(!url.endsWith(".pdf"))throw"not a PDF file";const title=(document.title||document.location.pathname).replace(/[\\\/:*?"<>|]/g,"");const filePath=`papers/${title}.pdf`;const pdf=await(await fetch(url)).bytes();const binaryString=pdf.reduce((acc,byte)=>acc+String.fromCharCode(byte),"");const base64Data=btoa(binaryString);await navigator.clipboard.writeText(base64Data);location.href=`obsidian://clip-paper?file=${encodeURIComponent(filePath)}&open=true`;}catch(error){alert(`Error: ${error}`);console.error(error);}})();
```

<details>

<summary>Full code</summary>

```js
javascript:(async () => {
  try {
    const url = location.href;
    if (!url.endsWith(".pdf")) throw "not a PDF file";

    const title = (document.title || document.location.pathname)
      .replace(/[\\\/:*?"<>|]/g, "");
    const filePath = `papers/${title}.pdf`;

    const pdf = await (await fetch(url)).bytes();

    const binaryString = pdf.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      "",
    );
    const base64Data = btoa(binaryString);

    await navigator.clipboard.writeText(base64Data);
    location.href = `obsidian://clip-paper?file=${encodeURIComponent(filePath)}&open=true`;
  } catch (error) {
    alert(`Error: ${error}`);
    console.error(error);
  }
})();
```

</details>
