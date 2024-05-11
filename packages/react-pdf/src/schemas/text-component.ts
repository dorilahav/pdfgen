import { z } from 'zod';

const textInstanceComponentSchema = z.object({
  type: z.literal('TEXT_INSTANCE'),
  value: z.string().min(1) // Add regex check
});

// TODO: text component can also include a render function, we need to take care of that before sending data to the server.

const textComponentChildren = z.array(textInstanceComponentSchema).length(1);

export const textComponentSchema = z.object({
  type: z.literal('TEXT'),
  box: z.object({}),
  style: z.object({}).passthrough(), // TODO: make this more specific
  props: z.object({}).passthrough(),
  children: textComponentChildren
});

export type TextComponent = z.infer<typeof textComponentSchema>;