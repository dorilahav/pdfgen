import { logger } from '@pdfgen/logging';
import { PdfGeneratedMessageContent, Worker } from '@pdfgen/queuing';
import { PdfDocument, PdfDocumentStatus } from '../models';

const markPdfReady: Worker<PdfGeneratedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Updating pdf ${pdfId} status to ready...`);
  
  const pdfDocument = await PdfDocument.findById(pdfId);

  if (!pdfDocument) {
    logger.error(`Cannot mark pdf ${pdfId} Ready because it was not found in the DB! This might indicate that there's a bug.`);
    
    return;
  }

  pdfDocument.status = PdfDocumentStatus.Ready;
  pdfDocument.fileId = content.fileId;
  
  await pdfDocument.save();

  logger.info(`Marked pdf ${pdfId} as ready!`);

  ack();
}

export default markPdfReady;