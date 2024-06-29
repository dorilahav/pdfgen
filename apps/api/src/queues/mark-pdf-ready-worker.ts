import { logger } from '@pdfgen/logging';
import { PdfGeneratedMessageContent, Worker } from '@pdfgen/queuing';
import { markPdfDocumentAsReady } from '../repositories/pdf-documents';

const markPdfReady: Worker<PdfGeneratedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Updating pdf ${pdfId} status to ready...`);
  
  const pdfDocument = await markPdfDocumentAsReady(pdfId, content.fileId);

  if (!pdfDocument) {
    logger.error(`Cannot mark pdf ${pdfId} Ready because it was not found in the DB! This might indicate that there's a bug.`);

    // TODO: Handle this case, right now it's causing a deadlock
    
    return;
  }

  logger.info(`Marked pdf ${pdfId} as ready!`);

  ack();
}

export default markPdfReady;