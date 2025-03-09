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

    const information = document.createDocumentFragment();
    information.createSpan({
      text:
        "This plugin uses some third-party services and libraries. See the following links for more information:",
    });
    const informationList = information.createEl("ul", {}, (ul) => {
      ul.createEl(
        "li",
        { text: "Reference metadata: Unpaywall API" },
        (li) => {
          li.createEl("ul", {}, (ul) => {
            ul.createEl(
              "li",
              { text: "API Documentation (Data format): " },
              (li) => {
                li.createEl("a", {
                  text: "unpaywall.org/data-format",
                  href: "https://unpaywall.org/data-format",
                });
              },
            );
          });
        },
      );
      ul.createEl(
        "li",
        { text: "Template engine: squirrelly" },
        (li) => {
          li.createEl("ul", {}, (ul) => {
            ul.createEl("li", { text: "Documentation: " }, (li) => {
              li.createEl("a", {
                text: "squirrelly.js.org/docs",
                href: "https://squirrelly.js.org/docs",
              });
            });
            ul.createEl("li", { text: "GitHub Repository: " }, (li) => {
              li.createEl("a", {
                text: "squirrellyjs/squirrelly",
                href: "https://github.com/squirrellyjs/squirrelly",
              });
            });
          });
        },
      );
    });
    information.append(informationList);

    new Setting(containerEl)
      .setName("Third-party Services Information")
      .setDesc(information);

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
        "The template for the directory structure of the reference notes",
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
        "The template for the filenames of the reference notes\n" +
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
      .setDesc("The path to the template for the reference notes.")
      .addText((text) =>
        text
          .setPlaceholder("path/to/template.md")
          .setValue(this.plugin.settings.templatePath)
          .onChange((value) => {
            this.plugin.settings.templatePath = value;
            this.plugin.saveSettings();
          })
      );
  }
}
