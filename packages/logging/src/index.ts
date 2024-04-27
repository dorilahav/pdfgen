import pino, { TransportTargetOptions } from 'pino';

interface MessageWithData {
  msg: string;
  data: object;
}

type LogFunction = (content: Error | string | MessageWithData) => void;

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
      level: options.debug ? 'debug' : minimumLevel
    });
  }

  logger = pino({
    transport: {
      targets
    },
    level: options.debug ? 'debug' : minimumLevel
  });
}