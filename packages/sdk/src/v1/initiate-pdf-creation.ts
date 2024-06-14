import { ErrorApiResponse, HttpClient, ValidationError, mapApiResponseToError } from '../common';
import { reconcilePdfContainer } from '../common/reconcile-pdf-container';
import { PdfDocumentDetails } from './types';

export interface InitiatePdfCreationOptions {
  document: JSX.Element;
  signal?: AbortSignal;
}

export type InitiatePdfCreation = (options: InitiatePdfCreationOptions) => Promise<PdfDocumentDetails>;

export const initiatePdfCreation = (httpClient: HttpClient): InitiatePdfCreation => (
  async ({signal, document}) => {
    const pdfContainer = reconcilePdfContainer(document);
    const response = await httpClient.sendApiRequest<PdfDocumentDetails>('POST', '/documents', signal, pdfContainer);

    if (!response.ok) {
      throw getErrorFromResponse(response);
    }

    return response.data;
  }
);

const getErrorFromResponse = (response: ErrorApiResponse) => {
  if (response.status === 400) {
    const details = response.data;

    return new ValidationError(
      'The pdf sent for generation does not follow the @react-pdf/renderer specifications.',
      details
    );
  }

  return mapApiResponseToError(response);
}