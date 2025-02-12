import { App, PluginSettingTab, Setting } from "obsidian";
import AcademicPaperManagementPlugin from "../main.ts";

export interface Settings {
  baseDir: string;
  email: string;
  templatePath: string;
}

export const DEFAULT_SETTINGS: Settings = {
  baseDir: "academic-papers",
  email: "",
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
      .setName("Base Directory")
      .setDesc(
        "The directory where the reference notes and PDFs will be saved.",
      )
      .addText((text) =>
        text
          .setPlaceholder("academic-papers")
          .setValue(this.plugin.settings.baseDir)
          .onChange((value) => {
            this.plugin.settings.baseDir = value;
            this.plugin.saveSettings();
          })
      );

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
