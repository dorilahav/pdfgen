import { logger } from '@pdfgen/logging';
import { PdfGeneratedMessageContent, Worker } from '@pdfgen/queuing';
import { markPdfDocumentAsReady } from '../repositories/pdf-documents';

const markPdfReady: Worker<PdfGeneratedMessageContent> = async (pdfId, content, ack, isRetry) => {
  logger.info(`Updating pdf ${pdfId} status to ready...`);

  let pdfDocument;
  
  try {
    pdfDocument = await markPdfDocumentAsReady(pdfId, content.fileId);
  } catch (error) {
    logger.error({
      msg: `Cannot mark Pdf as ready because an error has occurred.`,
      context: {
        pdfId,
        fileId: content.fileId
      },
      err: error
    });

    // TODO: pass to error queue.

    return ack.failure();
  }

  if (!pdfDocument) {
    if (isRetry) {
      logger.error({
        msg: `Cannot mark pdf as ready because it was not found in the DB! This might indicate that there's a bug.`,
        context: {
          pdfId,
          fileId: content.fileId
        }
      });

      return ack.failure();
    }

    logger.warn({
      msg: `Cannot mark pdf as ready because it was not found in the DB! Retrying...`,
      context: {
        pdfId,
        fileId: content.fileId
      }
    });

    return ack.requeue();
  }

  logger.info(`Marked pdf ${pdfId} as ready!`);

  return ack.success();
}

export default markPdfReady;