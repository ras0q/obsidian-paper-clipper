import { App, PluginSettingTab, Setting } from "obsidian";
import AcademicPaperManagementPlugin from "../main.ts";

export interface Settings {
  email: string;
  pdf: {
    enable: boolean;
    confirmToSave: boolean;
    outputPath: string;
  };
  reference: {
    enable: boolean;
    confirmToSave: boolean;
    outputPath: string;
    templatePath: string;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  email: "",
  pdf: {
    enable: true,
    confirmToSave: false,
    outputPath: "Papers/{{ it.year }}/{{ it.title }}.pdf",
  },
  reference: {
    enable: true,
    confirmToSave: false,
    outputPath: "Papers/{{ it.year }}/{{ it.title }}.md",
    templatePath: "",
  },
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
      .setName("Third-party services information")
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
      .setName("Save PDFs")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.pdf.enable)
          .onChange((value) => {
            this.plugin.settings.pdf.enable = value;
            this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.pdf.enable) {
      new Setting(containerEl)
        .setName("Confirm to save PDF")
        .setDesc("Ask for confirmation before saving a PDF file")
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.pdf.confirmToSave)
            .onChange((value) => {
              this.plugin.settings.pdf.confirmToSave = value;
              this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName("PDF path template")
        .setDesc(
          "The template for the path of the PDF files\n" +
            "Unknown characters in filenames will be replaced by underscores",
        )
        .addText((text) =>
          text
            .setPlaceholder(DEFAULT_SETTINGS.pdf.outputPath)
            .setValue(this.plugin.settings.pdf.outputPath)
            .onChange((value) => {
              this.plugin.settings.pdf.outputPath = value;
              this.plugin.saveSettings();
            })
        );
    }

    new Setting(containerEl)
      .setName("Save reference notes")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.reference.enable)
          .onChange((value) => {
            this.plugin.settings.reference.enable = value;
            this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.reference.enable) {
      new Setting(containerEl)
        .setName("Confirm to save reference note")
        .setDesc("Ask for confirmation before saving a reference note")
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.reference.confirmToSave)
            .onChange((value) => {
              this.plugin.settings.reference.confirmToSave = value;
              this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName("Reference path template")
        .setDesc(
          "The template for the path of the reference notes\n" +
            "Unknown characters in filenames will be replaced by underscores",
        )
        .addText((text) =>
          text
            .setPlaceholder(DEFAULT_SETTINGS.reference.outputPath)
            .setValue(this.plugin.settings.reference.outputPath)
            .onChange((value) => {
              this.plugin.settings.reference.outputPath = value;
              this.plugin.saveSettings();
            })
        );

      new Setting(containerEl)
        .setName("Template path")
        .setDesc("The path to the template for the reference notes.")
        .addText((text) =>
          text
            .setPlaceholder("path/to/template.md")
            .setValue(this.plugin.settings.reference.templatePath)
            .onChange((value) => {
              this.plugin.settings.reference.templatePath = value;
              this.plugin.saveSettings();
            })
        );
    }
  }
}
