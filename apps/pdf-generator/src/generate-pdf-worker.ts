import { Worker, pdfGeneratedQueue } from '@pdfgen/queuing';

const createPdfWorker: Worker<{}> = async (pdfId, content, ack) => {
  // TODO: logging
  console.log(`Generating pdf ${pdfId}...`);

  await new Promise(resolve => {
    setTimeout(resolve, 50000);
  });

  // TODO: logging
  console.log(`Generated pdf ${pdfId}!`);
  ack();

  pdfGeneratedQueue.publish(pdfId, {});
}

export default createPdfWorker;