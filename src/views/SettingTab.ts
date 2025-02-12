import { App, PluginSettingTab, Setting } from "obsidian";
import AcademicPaperManagementPlugin from "../main.ts";

export interface Settings {
  email: string;
  directoryTemplate: string;
  filenameTemplate: string;
  templatePath: string;
}

export const DEFAULT_SETTINGS: Settings = {
  email: "",
  directoryTemplate: "papers",
  filenameTemplate: "{{ it.title }}",
  templatePath: "",
};

export class SettingTab extends PluginSettingTab {
  plugin: AcademicPaperManagementPlugin;

  constructor(app: App, plugin: AcademicPaperManagementPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Email")
      .setDesc("Your email address for the Unpaywall API.")
      .addText((text) =>
        text
          .setPlaceholder("you@example.com")
          .setValue(this.plugin.settings.email)
          .onChange((value) => {
            this.plugin.settings.email = value;
            this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Directory Template")
      .setDesc(
        "The template for the directory structure of the reference notes. Use Mustache syntax.",
      )
      .addText((text) =>
        text
          .setPlaceholder("papers/{{ it.year }}")
          .setValue(this.plugin.settings.directoryTemplate)
          .onChange((value) => {
            this.plugin.settings.directoryTemplate = value;
            this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Filename Template")
      .setDesc(
        "The template for the filenames of the reference notes. Use Mustache syntax.\n" +
          "Unknown characters in filenames will be replaced by underscores",
      )
      .addText((text) =>
        text
          .setPlaceholder("{{ it.title }}")
          .setValue(this.plugin.settings.filenameTemplate)
          .onChange((value) => {
            this.plugin.settings.filenameTemplate = value;
            this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Template Path")
      .setDesc("The path to the Mustache template for the reference notes.")
      .addText((text) =>
        text
          .setPlaceholder("path/to/template.md")
          .onChange((value) => {
            this.plugin.settings.templatePath = value;
            this.plugin.saveSettings();
          })
      );
  }
}
