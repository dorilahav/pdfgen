import { Hono } from 'hono';

import { documentsRouter } from './documents';

export const apiRouter = new Hono();

apiRouter.route('/documents', documentsRouter);