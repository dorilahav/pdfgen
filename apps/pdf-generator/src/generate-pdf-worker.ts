import { PdfRequestedMessageContent, Worker, pdfGenerateStartedQueue, pdfGeneratedQueue } from '@pdfgen/queuing';
import { createReadStream } from 'fs';
import { fileManager } from './file-manager';

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  // TODO: logging
  console.log(`Generating pdf ${pdfId}...`);

  await pdfGenerateStartedQueue.publish(pdfId, {});

  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  const filePath = "E:\\Users\\user\\Downloads\\טכנאי315539.pdf";
  const persistedFile = await fileManager.upload('test.pdf', createReadStream(filePath));

  await pdfGeneratedQueue.publish(pdfId, {fileId: persistedFile.id});

  // TODO: logging
  console.log(`Generated pdf ${pdfId}!`);
  ack();
}

export default createPdfWorker;