import { ConfirmChannel, ConsumeMessage } from 'amqplib';

export enum AckResult {
  Success = 1,
  Failure,
  Requeue
};

export interface AckFunctions {
  success: () => AckResult;
  failure: () => AckResult;
  requeue: () => AckResult;
}

export const ackFunctions: AckFunctions = {
  success: () => AckResult.Success,
  failure: () => AckResult.Failure,
  requeue: () => AckResult.Requeue
};

export const ackMessageOnChannel = (channel: ConfirmChannel, message: ConsumeMessage, result: AckResult) => {
  switch (result) {
    case AckResult.Success:
      channel.ack(message, false);
      break;

    case AckResult.Failure:
      channel.reject(message, false);
      break;

    case AckResult.Requeue:
      channel.reject(message, true);
      break;
  
    default:
      channel.reject(message, false);
      break;
  }
}