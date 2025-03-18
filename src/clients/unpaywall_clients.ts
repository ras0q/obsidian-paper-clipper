import { requestUrl } from "obsidian";

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

export const fetchReference = async (
  doi: string,
  email: string,
): Promise<{
  apiResponse: UnpaywallResponse;
  pdf: ArrayBuffer | null;
}> => {
  const apiUrl = `https://api.unpaywall.org/v2/${doi}?email=${email}`;

  const apiUrlResponse = await requestUrl(apiUrl);
  const apiResponse: UnpaywallResponse = apiUrlResponse.json;

  if (!apiResponse.is_oa || !apiResponse.best_oa_location?.url_for_pdf) {
    return {
      apiResponse,
      pdf: null,
    };
  }

  const pdfUrl = apiResponse.best_oa_location.url_for_pdf;
  const pdfResponse = await requestUrl(pdfUrl);
  const pdfArrayBuffer = pdfResponse.arrayBuffer;

  return {
    apiResponse,
    pdf: pdfArrayBuffer,
  };
};
