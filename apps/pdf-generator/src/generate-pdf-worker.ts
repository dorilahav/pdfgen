import { PdfRequestedMessageContent, Worker, pdfGenerateStartedQueue, pdfGeneratedQueue } from '@pdfgen/queuing';

const createPdfWorker: Worker<PdfRequestedMessageContent> = async (pdfId, content, ack) => {
  // TODO: logging
  console.log(`Generating pdf ${pdfId}...`);

  await pdfGenerateStartedQueue.publish(pdfId, {});

  await new Promise(resolve => {
    setTimeout(resolve, 10000);
  });

  await pdfGeneratedQueue.publish(pdfId, {});

  // TODO: logging
  console.log(`Generated pdf ${pdfId}!`);
  ack();
}

export default createPdfWorker;