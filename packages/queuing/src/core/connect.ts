import amqp, { ConfirmChannel, Connection } from 'amqplib';

export interface AmqpConnection {
  channel: ConfirmChannel;
  connection: Connection;
  close: () => Promise<void>;
}

export const connect = async (connectionString: string): Promise<AmqpConnection>  => {
  const connection = await amqp.connect(connectionString);
  const channel = await connection.createConfirmChannel();

  return {
    channel,
    connection,
    async close() {
      await channel.close();
      await connection.close();
    }
  }
}

