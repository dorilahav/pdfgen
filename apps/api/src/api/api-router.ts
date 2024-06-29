import { Hono } from 'hono';

import { applicationsRouter } from './applications';
import { documentsRouter } from './documents';

export const apiRouter = new Hono();

apiRouter.route('/documents', documentsRouter);
apiRouter.route('/applications', applicationsRouter);