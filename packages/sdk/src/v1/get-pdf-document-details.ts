import { ErrorApiResponse, HttpClient, PdfNotFoundError, ValidationError, mapApiResponseToError } from '../common';
import { Id, PdfDocumentDetails } from './types';

export interface GetPdfDocumentDetailsOptions {
  documentId: Id;
  signal?: AbortSignal;
}

export type GetPdfDocumentDetails = (options: GetPdfDocumentDetailsOptions) => Promise<PdfDocumentDetails>;

export const getPdfDocumentDetails = (httpClient: HttpClient): GetPdfDocumentDetails => (
  async ({documentId, signal}) => {
    const response = await httpClient.sendApiRequest<PdfDocumentDetails>('GET', `/documents/${documentId}`, signal);

    if (!response.ok) {
      throw getErrorFromResponse(response, documentId);
    }

    return response.data;
  }
);

const getErrorFromResponse = async (response: ErrorApiResponse, documentId: Id) => {
  if (response.status === 400) {
    const details = response.data;

    return new ValidationError(
      'The provided id is not a valid pdf document id.',
      details
    );
  }

  if (response.status === 404) {
    return new PdfNotFoundError(documentId);
  }
    
  return mapApiResponseToError(response);
}