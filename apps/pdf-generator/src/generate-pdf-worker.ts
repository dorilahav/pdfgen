import { logger } from '@pdfgen/logging';
import { pdfGeneratedQueue, PdfRequestedMessageContent, Worker } from '@pdfgen/queuing';
import { generatePdf } from '@pdfgen/react-pdf';
import { fileManager } from './file-manager';

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Generating pdf ${pdfId}...`);

  let generatedPdf;
  let file;

  try {
    generatedPdf = await generatePdf(content.container); // TODO: fix this type
  } catch (error) {
    logger.error({
      msg: `Could not have generated pdf content!`,
      context: {
        pdfId,
        content: content.container
      },
      err: error
    });

    // TODO: publish to error queue.
    
    return ack.failure();
  }

  try {
    file = await fileManager.upload(`${pdfId}.pdf`, generatedPdf.pdfReadStream);
  } catch (error) {
    logger.error({
      msg: `Could not have uploaded pdf content!`,
      context: {
        pdfId,
        content: content.container
      },
      err: error
    });

    // TODO: publish to error queue.
    
    return ack.failure();
  }

  logger.info(`Generated pdf ${pdfId}!`);
  
  await pdfGeneratedQueue.publish(pdfId, {fileId: file.id});

  return ack.success();
}

export default createPdfWorker;