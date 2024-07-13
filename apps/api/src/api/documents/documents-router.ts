import { zValidator } from '@hono/zod-validator';
import { logger } from '@pdfgen/logging';
import { pdfRequestedQueue } from '@pdfgen/queuing';
import { reactPdfContainerSchema } from '@pdfgen/react-pdf';
import { Hono } from 'hono';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { fileManager } from '../../file-manager';
import { createAuthorizedApplicationRateLimiter, verifyApplication } from '../../middlewares';
import { PdfDocumentStatus } from '../../models';
import { createPdfDocument, getPdfDocumentById } from '../../repositories/pdf-documents';

export default () => {
  const createDocumentRateLimiter = createAuthorizedApplicationRateLimiter({
    prefix: 'create-document',
    limit: 20 // 20 create documents per minute
  });

  const queryDocumentRateLimiter = createAuthorizedApplicationRateLimiter({
    prefix: 'query-document',
    limit: 200 // 20 documents per minute * 5 seconds per document + 100 random queries
  });

  const downloadDocumentRateLimiter = createAuthorizedApplicationRateLimiter({
    prefix: 'download-document',
    limit: 120 // 20 new documents per minute + 100 random downloads
  });

  const idParamsValidationSchema = z.object({id: z.string().refine(x => isValidObjectId(x))});

  return new Hono()
    .use(verifyApplication)
    .post('/',
      createDocumentRateLimiter,
      zValidator('json', reactPdfContainerSchema),
      async c => {
        const pdfContainer = c.req.valid('json');
        const application = c.get('application');

        const pdfDocument = await createPdfDocument(application.id);
        
        await pdfRequestedQueue.publish(pdfDocument.id, {container: pdfContainer});

        return c.json(pdfDocument.toJSON(), {status: 202});
      }
    )
    .get('/:id',
      queryDocumentRateLimiter,
      zValidator('param', idParamsValidationSchema),
      async c => {
        const {id: documentId} = c.req.valid('param');
        const application = c.get('application');

        const pdfDocument = await getPdfDocumentById(documentId);

        // TODO: move ownerApplication check to query.
        if (!pdfDocument || !pdfDocument.ownerApplication.equals(application.id)) {
          return c.notFound();
        }

        return c.json(pdfDocument.toJSON(), {status: 200});
      }
    )
    .get('/:id/download',
      downloadDocumentRateLimiter,
      zValidator('param', idParamsValidationSchema),
      async c => {
        const {id: documentId} = c.req.valid('param');
        const application = c.get('application');

        const pdfDocument = await getPdfDocumentById(documentId);

        // TODO: move ownerApplication check to query.
        if (!pdfDocument || !pdfDocument.ownerApplication.equals(application.id) || pdfDocument.status !== PdfDocumentStatus.Ready) {
          return c.notFound();
        }

        const fileDetails = await fileManager.getById(pdfDocument.fileId);

        if (!fileDetails) {
          logger.error({
            msg: 'Trying to query pdf-document with file that does not exist!',
            context: {
              fileId: pdfDocument.fileId,
              documentId: pdfDocument.id
            }
          });

          return c.notFound();
        }

        const fileReadStream = fileManager.downloadAsStream(pdfDocument.fileId);
        const response = new Response(fileReadStream as any, {status: 200});

        response.headers.append('Content-Type', 'application/pdf');
        response.headers.append('Content-Length', fileDetails.size.toString());
        response.headers.append('Content-Disposition', 'attachment; filename="document.pdf"'); // TODO: Give better name

        return response;
      }
    );
};