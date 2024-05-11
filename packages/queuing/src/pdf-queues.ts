import { ReactPdfContainer } from '@pdfgen/react-pdf';
import { createWorkerQueue } from './core';

export interface PdfRequestedMessageContent {
  container: ReactPdfContainer;
}

const pdfRequestedQueueName = 'pdf-requested';

export const pdfRequestedQueue = createWorkerQueue<PdfRequestedMessageContent>(pdfRequestedQueueName);


export interface PdfGeneratedMessageContent {
  fileId: string;
}

const pdfGeneratedQueueName = 'pdf-generated';

export const pdfGeneratedQueue = createWorkerQueue<PdfGeneratedMessageContent>(pdfGeneratedQueueName);
