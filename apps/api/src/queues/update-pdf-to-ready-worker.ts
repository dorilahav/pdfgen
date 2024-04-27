import { logger } from '@pdfgen/logging';
import { PdfGeneratedMessageContent, Worker } from '@pdfgen/queuing';
import { PdfDocument, PdfDocumentStatus } from '../models';

const updatePdfToReadyWorker: Worker<PdfGeneratedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Updating pdf ${pdfId} status to ready...`);
  
  const pdfDocument = await PdfDocument.findById(pdfId);

  if (!pdfDocument) {
    // TODO: this case.
    logger.error(`Could not find pdf ${pdfId}!`);
    
    return;
  }

  pdfDocument.status = PdfDocumentStatus.Ready;
  pdfDocument.fileId = content.fileId;
  
  await pdfDocument.save();

  logger.info(`Updated pdf ${pdfId} status to ready!`);

  ack();
}

export default updatePdfToReadyWorker;