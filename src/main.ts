import { base64ToArrayBuffer, Notice, Plugin } from "obsidian";
import { Reference } from "./reference.ts";
import { extractPDFTitle } from "./services/pdf_extraction.ts";
import { InputModal } from "./views/InputModal.ts";
import { ReferencesModal } from "./views/ReferencesModal.ts";
import { DEFAULT_SETTINGS, Settings, SettingTab } from "./views/SettingTab.ts";

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

const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

export default class AcademicPaperManagementPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS;

  override async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingTab(this.app, this));

    this.addCommand({
      id: "create-reference-from-doi",
      name: "Create a reference note from a DOI",
      callback: async () => {
        const modal = new InputModal(this.app, {
          name: "DOI",
          placeholder: "10.1000/xyz123",
          initialValue: "",
        });
        const doi = await modal.awaitInput();
        if (!doi) return;

        const extractedDoi = doi.match(doiRegex)?.[0] ?? doi;
        const reference = await Reference.fromDOI(
          extractedDoi,
          this.settings.email,
        );

        const pdf = await reference.fetchPDF();
        if (pdf) await this.savePDF(reference, pdf);

        await this.generateReferenceNote(reference);
      },
    });

    this.addCommand({
      id: "create-reference-from-doi-clipboard",
      name: "Create a reference note from the DOI in the clipboard",
      callback: async () => {
        const doi = await navigator.clipboard.readText();

        const extractedDoi = doi.match(doiRegex)?.[0] ?? doi;
        const reference = await Reference.fromDOI(
          extractedDoi,
          this.settings.email,
        );

        const pdf = await reference.fetchPDF();
        if (pdf) await this.savePDF(reference, pdf);

        await this.generateReferenceNote(reference);
      },
    });

    // obsidian://clip-paper?clipboard=base64
    this.registerObsidianProtocolHandler("clip-paper", async (params) => {
      try {
        const { clipboard } = params;
        if (clipboard !== "base64") throw 'For now, only "base64" is supported';

        const copiedBase64 = await navigator.clipboard.readText();
        const pdf = base64ToArrayBuffer(copiedBase64);

        const title = await extractPDFTitle(pdf.slice(0));

        const titleModal = new InputModal(this.app, {
          name: "Paper title",
          placeholder: "Title of the paper",
          initialValue: title.length > 0
            ? title
            : "Title of the paper could not be extracted",
        });
        const modifiedTitle = await titleModal.awaitInput();
        if (!modifiedTitle) return;

        new Notice(`Searching the references for "${modifiedTitle}"...`);
        const references = await Reference.searchFromTitle(
          modifiedTitle,
          this.settings.email,
        );

        const referencesModal = new ReferencesModal(this.app, references);
        const bestReference = await referencesModal.awaitInput();
        if (!bestReference) return;

        await this.savePDF(bestReference, pdf);
        await this.generateReferenceNote(bestReference);
      } catch (e) {
        console.error(e);
        new Notice(e as string);
      }
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

  private async savePDF(reference: Reference, pdf: ArrayBuffer) {
    const pdfPath = reference.parseTemplate(
      this.settings.pdfPathTemplate,
      { escape: true },
    );
    await this.prepareFolder(pdfPath);

    let pdfFile = this.app.vault.getFileByPath(pdfPath);
    if (pdfFile) {
      const confirm = globalThis.confirm(
        `The file ${pdfPath} already exists. Do you want to overwrite it?`,
      );
      if (!confirm) return;
      await this.app.vault.modifyBinary(pdfFile, pdf);
    } else {
      pdfFile = await this.app.vault.createBinary(pdfPath, pdf);
    }

    await this.app.workspace.getLeaf().openFile(pdfFile);
  }

  private async generateReferenceNote(reference: Reference) {
    const templateFile = this.app.vault.getFileByPath(
      this.settings.templatePath,
    );

    const template = templateFile
      ? await this.app.vault.read(templateFile)
      : fallbackTemplate;
    const content = reference.parseTemplate(template);

    const referencePath = reference.parseTemplate(
      this.settings.referencePathTemplate,
      { escape: true },
    );
    await this.prepareFolder(referencePath);

    const referenceFile = await this.app.vault.create(referencePath, content);

    await this.app.workspace.getLeaf("split").openFile(referenceFile);
  }

  private async prepareFolder(path: string) {
    const dirPath = path.split("/").slice(0, -1).join("/");
    if (this.app.vault.getFolderByPath(dirPath) === null) {
      await this.app.vault.createFolder(dirPath);
    }
  }
}
