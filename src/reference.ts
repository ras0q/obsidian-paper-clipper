// WARNING: Reference class depends on the Unpaywall API.

import { Notice, requestUrl } from "obsidian";
import { render } from "squirrelly";

const API_BASE_URL = "https://api.unpaywall.org/v2";

// https://unpaywall.org/data-format
interface UnpaywallResponse {
  doi: string;
  title: string;
  is_oa: boolean;
  best_oa_location?: {
    url_for_pdf?: string;
  };
  [key: string]: unknown;
}

export class Reference {
  private data: UnpaywallResponse;

  constructor(data: UnpaywallResponse) {
    this.data = data;
  }

  static async fromDOI(doi: string, email: string): Promise<Reference> {
    const apiUrl = new URL(`${API_BASE_URL}/${doi}`);
    apiUrl.searchParams.set("email", email);

    try {
      const apiResponse: UnpaywallResponse =
        (await requestUrl(apiUrl.toString())).json;

      return new Reference(apiResponse);
    } catch (e) {
      new Notice(e as string);

      throw e;
    }
  }

  static async fromTitle(title: string, email: string): Promise<Reference[]> {
    const apiUrl = new URL(`${API_BASE_URL}/search`);
    apiUrl.searchParams.set("query", title);
    apiUrl.searchParams.set("email", email);

    try {
      const apiResponse: { results: UnpaywallResponse[] } =
        (await requestUrl(apiUrl.toString())).json;

      return apiResponse.results.map((data) => new Reference(data));
    } catch (e) {
      new Notice(e as string);

      throw e;
    }
  }

  async fetchPDF(): Promise<ArrayBuffer | null> {
    if (!this.data.is_oa || !this.data.best_oa_location?.url_for_pdf) {
      return null;
    }

    const pdfUrl = this.data.best_oa_location.url_for_pdf;
    const pdfResponse = await requestUrl(pdfUrl);

    return pdfResponse.arrayBuffer;
  }

  parseTemplate(template: string): string {
    return render(template, this.data);
  }
}
