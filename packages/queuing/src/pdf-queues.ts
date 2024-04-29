import { createWorkerQueue } from './core';

export interface PdfRequestedMessageContent {}

const pdfRequestedQueueName = 'pdf-requested';

export const pdfRequestedQueue = createWorkerQueue<PdfRequestedMessageContent>(pdfRequestedQueueName);


export interface PdfGeneratedMessageContent {
  fileId: string;
}

const pdfGeneratedQueueName = 'pdf-generated';

export const pdfGeneratedQueue = createWorkerQueue<PdfGeneratedMessageContent>(pdfGeneratedQueueName);
