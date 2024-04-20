import { zValidator } from '@hono/zod-validator';
import { pdfGenerationJobsQueue } from '@pdfgen/queuing';
import { Hono } from 'hono';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { PdfDocument } from '../../models';

export const documentsRouter = new Hono();

documentsRouter.post('/', async c => {
  const pdfDocument = await new PdfDocument().save();
  const jobId = pdfDocument._id.toString();
  
  await pdfGenerationJobsQueue.publish(jobId, {});
  return c.json({jobId});
});

documentsRouter.get('/:id',
  zValidator('param', z.object({id: z.string().refine(x => isValidObjectId(x))})),
  async c => {
    const {id: documentId} = c.req.valid('param');

    const pdfDocument = await PdfDocument.findById(documentId);

    if (!pdfDocument) {
      return c.notFound();
    }

    return c.json(pdfDocument.toJSON());
  }
)