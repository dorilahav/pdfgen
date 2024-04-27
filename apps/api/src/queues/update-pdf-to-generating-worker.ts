import { logger } from '@pdfgen/logging';
import { PdfGenerateStartedMessageContent, Worker } from '@pdfgen/queuing';
import { PdfDocument, PdfDocumentStatus } from '../models';

const updatePdfToGeneratingWorker: Worker<PdfGenerateStartedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Updating pdf ${pdfId} status to generating...`);
  
  const pdfDocument = await PdfDocument.findById(pdfId);

  if (!pdfDocument) {
    // TODO: this case.
    logger.error(`Could not find pdf ${pdfId}!`);
    
    return;
  }

  pdfDocument.status = PdfDocumentStatus.Generating;
  await pdfDocument.save();

  logger.info(`Updated pdf ${pdfId} status to generating!`);

  ack();
}

export default updatePdfToGeneratingWorker;