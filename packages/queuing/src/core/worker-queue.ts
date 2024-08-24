import { logger } from '@pdfgen/logging';
import { ConfirmChannel, ConsumeMessage, Options } from 'amqplib';

import { wrapInMonad } from '@pdfgen/utils';
import { AckFunctions, ackFunctions, ackMessageOnChannel, AckResult } from './acknowledgement';
import { AmqpConnection } from './connect';
import { deserializeJsonContent, serializeJsonContent } from './serialization';

interface ConsumeContext<T> {
  queueName: string;
  message: ConsumeMessage;
  jobId: string;
  content: T;
}

export type Worker<T> = (context: ConsumeContext<T>, ack: AckFunctions, isRedelivered: boolean) => Promise<AckResult>;
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

const mapWorkerOptionsToQueueAssertionOptions = (options: WorkerQueueOptions = {}): Options.AssertQueue => {
  const queueOptions: Options.AssertQueue = {durable: true};

  if (options.deadLetter) {
    queueOptions.deadLetterExchange = options.deadLetter.exchange;
    queueOptions.deadLetterRoutingKey = options.deadLetter.routingKey;
  }

  return queueOptions;
}

export const createWorkerQueue = <T>(queueName: string, options?: WorkerQueueOptions): WorkerQueue<T> => {
  let isInitialized = false;
  let channel: ConfirmChannel;

  const assertInitialized = () => {
    if (!isInitialized) {
      throw new Error('Cannot perform operations on a queue before it finished initializing!')
    }
  }

  const assertDeadLetterExchange = async () => {
    const {exchange} = await channel.assertExchange('dead-letter-exchange', 'fanout', {durable: true});
    const {queue} = await channel.assertQueue('errors', {durable: true});

    await channel.bindQueue(queue, exchange, '');

    return exchange;
  }
  

  return {
    async init(connection: AmqpConnection) {
      channel = connection.channel;

      const queueAssertionOptions = mapWorkerOptionsToQueueAssertionOptions(options);

      await Promise.all([
        channel.assertExchange(queueName, 'fanout', {durable: true}),
        channel.assertQueue(queueName, queueAssertionOptions)
      ]);

      await channel.bindQueue(queueName, queueName, '');

      isInitialized = true;
    },
    publish(jobId, content) {
      assertInitialized();
      
      const options: Options.Publish = {
        persistent: true,
        correlationId: jobId,
        contentType: 'application/json'
      }

      return new Promise((resolve, reject) => {
        channel.publish(queueName, '', serializeJsonContent(content), options, error => {
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

      const consumer = await channel.consume(queueName, async message => {
        if (!message) {
          logger.fatal({msg: 'Got empty message from queue, this is probably a bug. Aborting.', context: {queueName, message}});
          
          return;
        }

        const content = deserializeJsonContent<T>(message.content);
        const jobId = message.properties.correlationId;
        const context: ConsumeContext<T> = {queueName, message, content, jobId};
        
        logger.info({msg: 'Got message from rabbit', context});

        const [hasWorkerFailed, error, result] = await wrapInMonad(() => worker(context, ackFunctions, message.fields.redelivered));

        if (hasWorkerFailed) {
          logger.fatal({msg: 'Error while processing message', err: error, context});
          channel.reject(message, false);

          return;
        }

        ackMessageOnChannel(channel, message, result);

        logger.info({msg: 'Finished processing message', context: {...context, result}});
      }, {noAck: false});

      return consumer.consumerTag;
    }
  }
}