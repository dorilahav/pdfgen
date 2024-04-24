import { PdfGeneratedMessageContent, Worker } from '@pdfgen/queuing';
import { PdfDocument, PdfDocumentStatus } from '../models';

const updatePdfToReadyWorker: Worker<PdfGeneratedMessageContent> = async (pdfId, content, ack) => {
  // TODO: logging
  console.log(`Updating pdf ${pdfId} status to ready...`);
  const pdfDocument = await PdfDocument.findById(pdfId);

  if (!pdfDocument) {
    // TODO: this case.

    // TODO: logging
    console.error(`Could not find pdf ${pdfId}!`);
    
    return;
  }

  pdfDocument.status = PdfDocumentStatus.Ready;
  pdfDocument.fileId = content.fileId;
  
  await pdfDocument.save();

  // TODO: logging
  console.log(`Updated pdf ${pdfId} status to ready!`);

  ack();
}

export default updatePdfToReadyWorker;