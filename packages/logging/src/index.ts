import pino, { TransportTargetOptions } from 'pino';

interface StructuredMessage {
  msg?: string;
  data?: object;
  err?: unknown;
  context?: object;
}

type MessageContent = Error | string | StructuredMessage;

type LogFunction = (content: MessageContent) => void;

interface Logger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
  fatal: LogFunction;
}

export let logger: Logger;

interface LoggerOptions {
  /**
   * The destination logging file.
   */
  logFilePath: string;

  /**
   * The current environment to display in logs
   */
  environment: string;

  /**
   * Turns on some development features like pretty logging to console.
   */
  dev?: boolean;

  /**
   * This enables debug logs.
   */
  debug?: boolean;
}

export const initLogging = (options: LoggerOptions) => {
  const minimumLevel = 'info';
  
  const targets: TransportTargetOptions[] = [
    {
      target: 'pino/file',
      options: {destination: options.logFilePath},
      level: minimumLevel
    }
  ];


  if (options.dev) {
    targets.push({
      target: 'pino-pretty',
      level: options.debug ? 'debug' : minimumLevel,
      options: {
        ignore: 'environment'
      }
    });
  }

  logger = pino({
    transport: {
      targets
    },
    level: options.debug ? 'debug' : minimumLevel,
    base: {
      environment: options.environment
    }
  });
}