import { logger } from '@pdfgen/logging';
import { ConfirmChannel, Options } from 'amqplib';

import { wrapMonad } from '@pdfgen/utils';
import { AmqpConnection } from './connect';

enum AckResult {
  Success = 1,
  Failure,
  Requeue
};

interface AckFunctions {
  success: () => AckResult;
  failure: () => AckResult;
  requeue: () => AckResult;
}

const ack: AckFunctions = {
  success: () => AckResult.Success,
  failure: () => AckResult.Failure,
  requeue: () => AckResult.Requeue
};

export type Worker<T> = (jobId: string, content: T, ack: AckFunctions, isRedelivered: boolean) => Promise<AckResult>;
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
        const context = {queueName, message};
        
        if (!message) {
          logger.fatal({msg: 'Got empty message from queue', context});
          
          return;
        }

        logger.debug({msg: 'Got message from rabbit', context});

        const content = deserializeJsonContent<T>(message.content);
        const jobId = message.properties.correlationId;

        const [hasWorkerFailed, error, result] = await wrapMonad(() => worker(jobId, content, ack, message.fields.redelivered));

        if (hasWorkerFailed) {
          channel.reject(message);
          logger.fatal({err: error, context: {jobId}});

          return;
        }

        switch (result) {
          case AckResult.Success:
            channel.ack(message);
            break;

          case AckResult.Failure:
            channel.reject(message);
            break;

          case AckResult.Requeue:
            channel.nack(message);
            break;
        
          default:
            channel.reject(message);
            break;
        }
      }, consumeOptions);

      return consumer.consumerTag;
    }
  }
}