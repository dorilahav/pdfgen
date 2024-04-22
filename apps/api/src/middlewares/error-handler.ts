import { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (error, c) => {
  // TODO: logging
  console.error(error);

  return c.json({
    message: 'Internal error!'
  }, {
    status: 500
  });
}