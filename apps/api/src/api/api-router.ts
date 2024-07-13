import { Hono } from 'hono';

import applicationsRouter from './applications';
import documentsRouter from './documents';

export default () => {
  return new Hono()
    .route('/documents', documentsRouter())
    .route('/applications', applicationsRouter());
}