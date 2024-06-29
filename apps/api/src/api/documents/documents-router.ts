import { zValidator } from '@hono/zod-validator';
import { logger } from '@pdfgen/logging';
import { pdfRequestedQueue } from '@pdfgen/queuing';
import { reactPdfContainerSchema } from '@pdfgen/react-pdf';
import { Hono } from 'hono';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { fileManager } from '../../file-manager';
import { verifyApplication } from '../../middlewares';
import { PdfDocument, PdfDocumentStatus } from '../../models';

export const documentsRouter = new Hono().use(verifyApplication);

documentsRouter.post('/',
  zValidator('json', reactPdfContainerSchema),
  async c => {
    const pdfContainer = c.req.valid('json');
    const application = c.get('application');

    const pdfDocument = await new PdfDocument({
      ownerApplication: application.id
    }).save();
    
    await pdfRequestedQueue.publish(pdfDocument.id, {container: pdfContainer});

    return c.json(pdfDocument.toJSON(), {status: 202});
  }
);

documentsRouter.get('/:id',
  zValidator('param', z.object({id: z.string().refine(x => isValidObjectId(x))})),
  async c => {
    const {id: documentId} = c.req.valid('param');
    const application = c.get('application');

    const pdfDocument = await PdfDocument.findById(documentId);

    if (!pdfDocument || !pdfDocument.ownerApplication.equals(application.id)) {
      return c.notFound();
    }

    return c.json(pdfDocument.toJSON(), {status: 200});
  }
);

documentsRouter.get('/:id/download',
  zValidator('param', z.object({id: z.string().refine(x => isValidObjectId(x))})),
  async c => {
    const {id: documentId} = c.req.valid('param');
    const application = c.get('application');

    const pdfDocument = await PdfDocument.findById(documentId);

    if (!pdfDocument || !pdfDocument.ownerApplication.equals(application.id) || pdfDocument.status !== PdfDocumentStatus.Ready) {
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
    response.headers.append('Content-Disposition', 'attachment; filename="document.pdf"'); // TODO: Give better name

    return response;
  }
)