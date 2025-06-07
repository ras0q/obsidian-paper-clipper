import { App, FuzzySuggestModal } from "obsidian";
import { Reference } from "../reference.ts";

export class ReferencesModal extends FuzzySuggestModal<Reference> {
  references: Reference[];
  resolve: (value: Reference | null) => void = () => {};

  constructor(app: App, references: Reference[]) {
    super(app);
    this.references = references;

    this.setTitle("Choose a reference");
  }

  override getItems(): Reference[] {
    return this.references;
  }

  override getItemText(item: Reference): string {
    const { title, z_authors } = item.data;
    return `${title} - ${
      (z_authors || [])
        .map((author) => `${author.raw_author_name}`)
        .join(", ")
    }`;
  }

  override onChooseItem(item: Reference): void {
    this.resolve(item);
  }

  awaitInput(): Promise<Reference | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }
}
