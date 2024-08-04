import { logger } from '@pdfgen/logging';
import { pdfGeneratedQueue, PdfRequestedMessageContent, Worker } from '@pdfgen/queuing';
import { generatePdf } from '@pdfgen/react-pdf';
import { wrapMonad } from '@pdfgen/utils';
import { fileManager } from './file-manager';

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  const context = {pdfId, content: content.container};

  logger.info({msg: 'Generating pdf...', context});

  const [isGenerateRejected, generateError, generatedPdf] = await wrapMonad(() => generatePdf(content.container));

  if (isGenerateRejected) {
    logger.error({msg: `Could not have generated pdf content!`, context, err: generateError});
    
    return ack.failure();
  }

  const [isUploadRejected, uploadError, file] = await wrapMonad(() => fileManager.upload(`${pdfId}.pdf`, generatedPdf.pdfReadStream));

  if (isUploadRejected) {
    logger.error({msg: `Could not have uploaded pdf content!`, context, err: uploadError});
    
    return ack.failure();
  }

  logger.info({msg: 'Generated pdf!', context});
  
  await pdfGeneratedQueue.publish(pdfId, {fileId: file.id});

  return ack.success();
}

export default createPdfWorker;