import { logger } from '@pdfgen/logging';
import { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (error, c) => {
  logger.error(error);

  return c.json({
    message: 'Internal error!'
  }, {
    status: 500
  });
}