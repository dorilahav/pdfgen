import { zValidator } from '@hono/zod-validator';
import { logger } from '@pdfgen/logging';
import { pdfRequestedQueue } from '@pdfgen/queuing';
import { reactPdfContainerSchema } from '@pdfgen/react-pdf';
import { Hono } from 'hono';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { fileManager } from '../../file-manager';
import { PdfDocument, PdfDocumentStatus } from '../../models';

export const documentsRouter = new Hono();

documentsRouter.post('/',
  zValidator('json', reactPdfContainerSchema),
  async c => {
    const pdfContainer = c.req.valid('json');
    const pdfDocument = await new PdfDocument().save();
    
    await pdfRequestedQueue.publish(pdfDocument.id, {container: pdfContainer});

    return c.json(pdfDocument.toJSON(), {status: 202});
  }
);

documentsRouter.get('/:id',
  zValidator('param', z.object({id: z.string().refine(x => isValidObjectId(x))})),
  async c => {
    const {id: documentId} = c.req.valid('param');

    const pdfDocument = await PdfDocument.findById(documentId);

    if (!pdfDocument) {
      return c.notFound();
    }

    return c.json(pdfDocument.toJSON(), {status: 200});
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

    const fileDetails = await fileManager.getById(pdfDocument.fileId);

    if (!fileDetails) {
      logger.error('Trying to query pdf-document with file that does not exist!');
      return c.notFound();
    }

    const fileReadStream = fileManager.downloadAsStream(pdfDocument.fileId);
    const response = new Response(fileReadStream as any, {status: 200});

    response.headers.append('Content-Type', 'application/pdf');
    response.headers.append('Content-Length', fileDetails.size.toString());

    return response;
  }
)