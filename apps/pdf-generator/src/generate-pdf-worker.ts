import { logger } from '@pdfgen/logging';
import { pdfGeneratedQueue, PdfRequestedMessageContent, Worker } from '@pdfgen/queuing';
import { generatePdf, ReactPdfContainer } from '@pdfgen/react-pdf';
import { fileManager } from './file-manager';

const uploadPdfContent = async (pdfId: string, container: ReactPdfContainer) => {
  const generatedPdf = await generatePdf(container); // TODO: fix this type
  const file = await fileManager.upload(`${pdfId}.pdf`, generatedPdf.pdfReadStream);

  return file;
}

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Generating pdf ${pdfId}...`);

  let generatedPdf;

  try {
    generatedPdf = await generatePdf(content.container);
  } catch (error) {
    logger.error({
      msg: `Could not have generated pdf content!`,
      context: {
        pdfId,
        content: content.container
      }
    });
    
    return ack.failure();
  }

  logger.info(`Generated pdf ${pdfId}!`);
  
  await pdfGeneratedQueue.publish(pdfId, {fileId: persistedFile.id});

  return ack.success();
}

export default createPdfWorker;