import { Plugin, requestUrl } from "obsidian";
import { DoiInputModal } from "./views/DoiInputModal.ts";
import { DEFAULT_SETTINGS, Settings, SettingTab } from "./views/SettingTab.ts";
import { render } from "squirrelly";

// https://unpaywall.org/data-format
interface UnpaywallResponse {
  doi: string;
  title: string;
  is_oa: boolean;
  best_oa_location?: {
    url_for_pdf?: string;
  };
}

const fallbackTemplate = `---
title: "{{ it.title }}"
author:
{{ @each(it.z_authors) => val, i }}
  - "{{ val.given }} {{ val.family }}"
{{ /each }}
doi: "{{ it.doi }}"
url: "{{ it.doi_url }}"
pdf_url: "[[{{ it.title }}.pdf]]"
is_oa: {{ it.is_oa }}

---
`;

const invalidFilenameCharacters = /[\\\/:*?"<>|]/g;
const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

export default class AcademicPaperManagementPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS;

  override async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));

    this.addCommand({
      id: "create-reference-from-doi",
      name: "Create a reference note from a DOI",
      callback: () => {
        new DoiInputModal(this.app, async (doi) => {
          const extractedDoi = doi.match(doiRegex)?.[0] ?? doi;
          await this.createReferenceFromDOI(extractedDoi);
        }).open();
      },
    });

    this.addCommand({
      id: "create-reference-from-doi-clipboard",
      name: "Create a reference note from the DOI in the clipboard",
      callback: async () => {
        const doi = await navigator.clipboard.readText();
        const extractedDoi = doi.match(doiRegex)?.[0] ?? doi;
        await this.createReferenceFromDOI(extractedDoi);
      },
    });
  }

  override onunload() {
    console.log("unloading Academic Paper Management plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async createReferenceFromDOI(doi: string) {
    const apiUrl =
      `https://api.unpaywall.org/v2/${doi}?email=${this.settings.email}`;

    const apiUrlResponse = await requestUrl(apiUrl);
    const apiResponse: UnpaywallResponse = apiUrlResponse.json;

    const dirname = render(this.settings.directoryTemplate, apiResponse)
      .replace(invalidFilenameCharacters, "_");
    const filename = render(this.settings.filenameTemplate, apiResponse)
      .replace(invalidFilenameCharacters, "_");
    const filePath = `${dirname}/${filename}`;

    if (apiResponse.is_oa && apiResponse.best_oa_location?.url_for_pdf) {
      const pdfUrl = apiResponse.best_oa_location.url_for_pdf;
      const pdfResponse = await requestUrl(pdfUrl);
      const pdfArrayBuffer = pdfResponse.arrayBuffer;

      const pdfFilePath = `${filePath}.pdf`;
      const pdfFile = await this.app.vault.createBinary(
        pdfFilePath,
        pdfArrayBuffer,
      );
      await this.app.workspace.getLeaf().openFile(pdfFile);
    }

    const templateFile = this.app.vault.getFileByPath(
      this.settings.templatePath,
    );

    const template = templateFile
      ? await this.app.vault.read(templateFile)
      : fallbackTemplate;
    const content = render(template, apiResponse);

    const mdFilePath = `${filePath}.md`;
    const mdFile = await this.app.vault.create(mdFilePath, content);
    await this.app.workspace.getLeaf("split").openFile(mdFile);
  }
}
