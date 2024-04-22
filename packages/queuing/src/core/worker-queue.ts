import { ConfirmChannel, Options } from 'amqplib';

import { AmqpConnection } from './connect';

type AckFunction = () => void;
export type Worker<T> = (jobId: string, content: T, ack: AckFunction) => Promise<void>;
type SubscriptionId = string;

export interface WorkerQueue<T> {
  init: (connection: AmqpConnection) => Promise<void>;
  publish: (jobId: string, content: T) => Promise<void>;
  subscribe: (worker: Worker<T>) => Promise<SubscriptionId>;
}

interface DeadLetterOptions {
  exchange: string;
  routingKey?: string;
}

export interface WorkerQueueOptions {
  deadLetter?: DeadLetterOptions;
}

const mapWorkerOptionsToAssertionOptions = (options: WorkerQueueOptions = {}): Options.AssertQueue => {
  const queueOptions: Options.AssertQueue = {durable: true};

  if (options.deadLetter) {
    queueOptions.deadLetterExchange = options.deadLetter.exchange;
    queueOptions.deadLetterRoutingKey = options.deadLetter.routingKey;
  }

  return queueOptions;
}

const serializeJsonContent = (content: unknown): Buffer => {
  const contentAsString = JSON.stringify(content);

  return Buffer.from(contentAsString);
}

const deserializeJsonContent = <T>(buffer: Buffer): T => {
  const contentAsString = buffer.toString();

  return JSON.parse(contentAsString);
}

export const createWorkerQueue = <T>(queueName: string, options?: WorkerQueueOptions): WorkerQueue<T> => {
  let isInitialized = false;
  let channel: ConfirmChannel;

  const assertInitialized = () => {
    if (!isInitialized) {
      throw new Error('Cannot perform operations on a queue before it finished initializing!')
    }
  }

  return {
    async init(connection: AmqpConnection) {
      channel = connection.channel;

      const assertionOptions = mapWorkerOptionsToAssertionOptions(options);

      await channel.assertQueue(queueName, assertionOptions);

      isInitialized = true;
    },
    publish(jobId, content) {
      assertInitialized();
      
      const options: Options.Publish = {
        persistent: true,
        correlationId: jobId,
        contentType: 'application/json'
      };

      return new Promise((resolve, reject) => {
        channel.sendToQueue(queueName, serializeJsonContent(content), options, error => {
          if (error) {
            reject(error);
          } {
            resolve();
          }
        });
      });
    },
    async subscribe(worker) {
      assertInitialized();

      const consumeOptions: Options.Consume = {
        noAck: false
      };
        
      const consumer = await channel.consume(queueName, async message => {
        if (!message) {
          // TODO: logging
          console.error(`Got empty message from queue: ${queueName}`);
          return;
        }

        // TODO: logging
        console.log('Got message from rabbit:');
        console.log(message);

        const content = deserializeJsonContent<T>(message.content);
        const jobId = message.properties.correlationId;

        const ack = () => channel.ack(message);

        await worker(jobId, content, ack);
      }, consumeOptions);

      return consumer.consumerTag;
    }
  }
}