import * as pdfjs from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

export async function extractPDFTitle(pdf: ArrayBuffer) {
  // TODO: version management
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.0.375/build/pdf.worker.min.mjs";
  const pdfDocument = await pdfjs.getDocument({ data: pdf }).promise;

  const page = await pdfDocument.getPage(1);
  const items = (await page.getTextContent()).items as TextItem[];
  const sortedItems = items
    .filter((i) =>
      i.str.length > 0 && i.height > 0 &&
      // Check if the item is not rotated
      i.transform[1] === 0 && i.transform[2] === 0
    )
    .sort((a, b) => b.height - a.height);

  return sortedItems[0].str;
}
