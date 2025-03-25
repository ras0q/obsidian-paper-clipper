import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

export async function extractPDFTitle(pdf: ArrayBuffer) {
  // TODO: version management
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.0.375/build/pdf.worker.min.mjs";
  const pdfDocument = await pdfjs.getDocument({ data: pdf }).promise;

  const page = await pdfDocument.getPage(1);
  const items = (await page.getTextContent()).items as TextItem[];

  const combinedItems: TextItem[] = [];
  let currentGroup: TextItem | null = null;
  for (const item of items) {
    if (
      item.str.length === 0 || item.height === 0 ||
      // Check if the item is not rotated
      item.transform[1] !== 0 || item.transform[2] !== 0
    ) {
      continue;
    }

    if (!currentGroup) {
      currentGroup = { ...item };
    } else if (
      currentGroup.height === item.height &&
      currentGroup.fontName === item.fontName
    ) {
      // Combine with current group
      currentGroup.str += " " + item.str;
    } else {
      combinedItems.push(currentGroup);
      currentGroup = null;
    }
  }

  if (currentGroup) {
    combinedItems.push(currentGroup);
  }

  const sortedItems = combinedItems
    .sort((a, b) => b.height - a.height);

  return sortedItems[0].str;
}
