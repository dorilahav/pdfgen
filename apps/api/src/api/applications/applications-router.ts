import { zValidator } from '@hono/zod-validator';
import { createToken } from '@pdfgen/application-token';
import { Hono } from 'hono';
import { z } from 'zod';
import { createApplication } from '../../repositories/application';

export default () => {
  return new Hono()
    .post('/',
      zValidator('json', z.object({name: z.string().min(3).max(120)})),
      async c => {
        const applicationName = c.req.valid('json').name;

        const application = await createApplication(applicationName);
        const token = createToken(application.id, application.secret);
        
        const response = {
          ...application.toJSON(),
          token
        }

        return c.json(response);
      }
    );
};