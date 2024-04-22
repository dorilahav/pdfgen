import { PdfGenerateStartedMessageContent, Worker } from '@pdfgen/queuing';
import { PdfDocument, PdfDocumentStatus } from '../models';

const updatePdfToGeneratingWorker: Worker<PdfGenerateStartedMessageContent> = async (pdfId, content, ack) => {
  // TODO: logging
  console.log(`Updating pdf ${pdfId} status to generating...`);
  const pdfDocument = await PdfDocument.findById(pdfId);

  if (!pdfDocument) {
    // TODO: this case.

    // TODO: logging
    console.error(`Could not find pdf ${pdfId}!`);
    
    return;
  }

  pdfDocument.status = PdfDocumentStatus.Generating;
  await pdfDocument.save();

  // TODO: logging
  console.log(`Updated pdf ${pdfId} status to generating!`);

  ack();
}

export default updatePdfToGeneratingWorker;