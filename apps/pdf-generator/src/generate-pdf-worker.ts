import { logger } from '@pdfgen/logging';
import { PdfRequestedMessageContent, Worker, pdfGeneratedQueue } from '@pdfgen/queuing';
import { fileManager } from './file-manager';
import { generatePdf } from './generate-pdf';

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Generating pdf ${pdfId}...`);

  const generatedPdf = await generatePdf(content as any); // TODO: fix this type
  const persistedFile = await fileManager.upload(`${pdfId}.pdf`, generatedPdf.pdfReadStream);

  logger.info(`Generated pdf ${pdfId}!`);
  
  await pdfGeneratedQueue.publish(pdfId, {fileId: persistedFile.id});

  ack();
}

export default createPdfWorker;