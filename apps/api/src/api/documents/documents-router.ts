import { pdfGenerationJobsQueue } from '@pdfgen/queuing';
import { Hono } from 'hono';
import { PdfDocument } from '../../models';

export const documentsRouter = new Hono();

documentsRouter.post('/', async c => {
  const pdfDocument = await new PdfDocument().save();
  const jobId = pdfDocument._id.toString();
  
  await pdfGenerationJobsQueue.publish(jobId, {});
  return c.json({jobId});
});