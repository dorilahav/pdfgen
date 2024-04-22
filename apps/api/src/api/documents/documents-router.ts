import { zValidator } from '@hono/zod-validator';
import { pdfRequestedQueue } from '@pdfgen/queuing';
import { lstat, readFile } from 'fs/promises';
import { Hono } from 'hono';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { PdfDocument, PdfDocumentStatus } from '../../models';

export const documentsRouter = new Hono();

documentsRouter.post('/', async c => {
  const pdfDocument = await new PdfDocument().save();
  const jobId = pdfDocument._id.toString();
  
  await pdfRequestedQueue.publish(jobId, {});
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

    return c.json(pdfDocument.toJSON(), {status: 202});
  }
);

documentsRouter.get('/:id/download',
  zValidator('param', z.object({id: z.string().refine(x => isValidObjectId(x))})),
  async c => {
    const {id: documentId} = c.req.valid('param');

    const pdfDocument = await PdfDocument.findById(documentId);

    if (!pdfDocument || pdfDocument.status !== PdfDocumentStatus.Ready) {
      return c.notFound();
    }

    const filePath = "E:\\Users\\user\\Downloads\\טכנאי315539.pdf";

    // TODO: Change file reading to be chunked for big files.
    const [{size}, file] = await Promise.all([
      lstat(filePath),
      readFile(filePath)
    ]);
    
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Length', size.toString());

    return c.body(file);
  }
)