import { z } from 'zod';

const imagePropsSchema = z.object({
  src: z.string() // TODO: make this more specific
})

export const imageComponentSchema = z.object({
  type: z.literal('IMAGE'),
  box: z.object({}),
  style: z.object({}).passthrough(),
  props: imagePropsSchema.passthrough(),
  children: z.array(z.any()).length(0)
});

export type ImageComponent = z.infer<typeof imageComponentSchema>;