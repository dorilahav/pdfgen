import { pdfGenerationJobsQueue } from '@pdfgen/queuing';
import { Hono } from 'hono';
import { v4 as createUuid } from 'uuid';

export const documentsRouter = new Hono();

documentsRouter.post('/', async c => {
  const jobId = createUuid();
  await pdfGenerationJobsQueue.publish(jobId, {});
  return c.json({jobId});
})