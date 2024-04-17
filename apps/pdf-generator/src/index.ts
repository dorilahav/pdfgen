import { connectToAmqp, pdfGenerationJobsQueue } from '@pdfgen/queuing';

const initQueuing = async () => {
  const connection = await connectToAmqp('amqp://localhost');

  await pdfGenerationJobsQueue.init(connection);
}

const startListening = async () => {
  await pdfGenerationJobsQueue.subscribe((jobId) => {
    console.log(`Processing job ${jobId}`);

    return new Promise(resolve => {
      setTimeout(resolve, 5000);
    }).then(() => {
      console.log(`Finished job ${jobId}`);
    })
  })
}

initQueuing()
  .then(startListening)
  .then(() => {
    console.log('Done!');
  });