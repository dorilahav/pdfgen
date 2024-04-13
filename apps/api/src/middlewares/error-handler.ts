import { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (error, c) => {
  console.error(error);

  return c.json({
    message: 'Internal error!'
  }, {
    status: 500
  });
}