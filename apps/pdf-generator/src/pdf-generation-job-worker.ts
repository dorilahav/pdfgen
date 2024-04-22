import { Worker } from '@pdfgen/queuing';

const worker: Worker<{}> = async (jobId, content, ack) => {
  console.log(`Processing job ${jobId}`);

  await new Promise(resolve => {
    setTimeout(resolve, 5000);
  });

  console.log(`Finished job ${jobId}`);
  ack();
}

export default worker;