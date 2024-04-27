import { logger } from '@pdfgen/logging';
import { PdfRequestedMessageContent, Worker, pdfGenerateStartedQueue, pdfGeneratedQueue } from '@pdfgen/queuing';
import { createReadStream } from 'fs';
import { fileManager } from './file-manager';

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  logger.info(`Generating pdf ${pdfId}...`);

  await pdfGenerateStartedQueue.publish(pdfId, {});

  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  const filePath = "E:\\Users\\user\\Downloads\\טכנאי315539.pdf";
  const persistedFile = await fileManager.upload('test.pdf', createReadStream(filePath));

  logger.info(`Generated pdf ${pdfId}!`);
  
  await pdfGeneratedQueue.publish(pdfId, {fileId: persistedFile.id});

  ack();
}

export default createPdfWorker;