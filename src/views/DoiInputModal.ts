import { App, Modal, Setting } from "obsidian";

export class DoiInputModal extends Modal {
  constructor(app: App, onSubmit: (doi: string) => Promise<void>) {
    super(app);

    this.setTitle("Enter DOI");

    let doi = "";
    new Setting(this.contentEl)
      .setName("DOI")
      .addText((text) =>
        text
          .setPlaceholder("10.1000/xyz123")
          .setValue("")
          .onChange((value) => {
            doi = value;
          })
      );

    new Setting(this.contentEl)
      .addButton((button) =>
        button
          .setButtonText("Submit")
          .onClick(() => {
            this.close();
            onSubmit(doi);
          })
      );
  }
}
