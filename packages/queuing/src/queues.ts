import { createWorkerQueue } from './core';

const queueName = 'pdf-generation-jobs';

export const pdfGenerationJobsQueue = createWorkerQueue<{}>(queueName);