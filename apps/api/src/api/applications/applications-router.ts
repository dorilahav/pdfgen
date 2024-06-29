import { zValidator } from '@hono/zod-validator';
import { createToken } from '@pdfgen/application-token';
import { randomUUID } from 'crypto';
import { Hono } from 'hono';
import { z } from 'zod';
import { Application } from '../../models';

export const applicationsRouter = new Hono();

applicationsRouter.post('/',
  zValidator('json', z.object({name: z.string().min(3).max(120)})),
  async c => {
    const name = c.req.valid('json').name;

    const application = new Application({
      name,
      secret: randomUUID()
    });

    await application.save();

    const token = createToken(application.id, application.secret);
    const response = {
      ...application.toJSON(),
      token
    }

    return c.json(response);
  }
)