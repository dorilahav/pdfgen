import { connectToAmqp, pdfGenerationJobsQueue } from '@pdfgen/queuing';

export const initQueuing = async (connectionString: string) => {
  const connection = await connectToAmqp(connectionString);

  await pdfGenerationJobsQueue.init(connection);
}