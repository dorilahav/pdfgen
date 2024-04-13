import { Hono } from 'hono';

export const documentsRouter = new Hono();

documentsRouter.get('/', c => {
  return c.json({hello: 'world'})
})