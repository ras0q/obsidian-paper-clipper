import { App, Modal, Setting } from "obsidian";

interface Config {
  name: string;
  placeholder: string;
  initialValue: string;
}

export class InputModal extends Modal {
  resolve: (value: string | null) => void = () => {};

  constructor(app: App, config: Config) {
    super(app);

    this.setTitle(`Enter ${config.name}`);

    let input = config.initialValue;
    new Setting(this.contentEl)
      .setName(config.name)
      .addText((text) =>
        text
          .setPlaceholder(config.placeholder)
          .setValue(config.initialValue)
          .onChange((value) => {
            input = value;
          })
      );

    new Setting(this.contentEl)
      .addButton((button) =>
        button
          .setButtonText("Submit")
          .onClick(() => {
            this.resolve(input);
            this.close();
          })
      );
  }

  awaitInput(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }
}
