import { Worker } from '@pdfgen/queuing';
import { PdfDocument, PdfDocumentStatus } from '../models';

const updatePdfToGeneratedWorker: Worker<{}> = async (pdfId, content, ack) => {
  // TODO: logging
  console.log(`Updating pdf ${pdfId} status to generated...`);
  const pdfDocument = await PdfDocument.findById(pdfId);

  if (!pdfDocument) {
    // TODO: this case.

    // TODO: logging
    console.error(`Could not find pdf ${pdfId}!`);
    
    return;
  }

  pdfDocument.status = PdfDocumentStatus.Ready;
  await pdfDocument.save();

  // TODO: logging
  console.log(`Updated pdf ${pdfId} status to generated!`);

  ack();
}

export default updatePdfToGeneratedWorker;