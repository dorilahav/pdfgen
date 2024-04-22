import { createWorkerQueue } from './core';

const pdfRequestedQueueName = 'pdf-requested';

export const pdfRequestedQueue = createWorkerQueue<{}>(pdfRequestedQueueName);

const pdfGeneratedQueueName = 'pdf-generated';

export const pdfGeneratedQueue = createWorkerQueue<{}>(pdfGeneratedQueueName);