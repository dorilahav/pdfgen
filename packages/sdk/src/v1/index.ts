import { constructBaseUrl, createHttpClient } from '../common';
import { GetDownloadUrl, getDownloadUrl } from './get-download-url';
import { GetPdfDocumentDetails, getPdfDocumentDetails } from './get-pdf-document-details';
import { initiatePdfCreation, InitiatePdfCreation } from './initiate-pdf-creation';

interface PdfGenApiClientOptions {
  token: string;
  hostname?: string;
}

export interface PdfGenApiClient {
  initiatePdfCreation: InitiatePdfCreation;
  getPdfDocumentDetails: GetPdfDocumentDetails;
  getDownloadUrl: GetDownloadUrl;
}

export const createPdfGenApiClient = (options: PdfGenApiClientOptions): PdfGenApiClient => {
  const baseUrl = constructBaseUrl(options.hostname ?? 'https://api.pdfgenapi.com', 'v1');
  const httpClient = createHttpClient(baseUrl, options.token);

  return {
    initiatePdfCreation: initiatePdfCreation(httpClient),
    getPdfDocumentDetails: getPdfDocumentDetails(httpClient),
    getDownloadUrl: getDownloadUrl(baseUrl)
  }
}

export type { GetDownloadUrl, GetDownloadUrlOptions } from './get-download-url';
export type { GetPdfDocumentDetails, GetPdfDocumentDetailsOptions } from './get-pdf-document-details';
export type { InitiatePdfCreation, InitiatePdfCreationOptions } from './initiate-pdf-creation';
export type * from './types';

