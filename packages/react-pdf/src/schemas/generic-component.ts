import { z } from 'zod';

const genericComponentTypes = [
  'G', 'SVG', 'VIEW', 'LINK', 'PAGE', 'NOTE', 'PATH', 'RECT', 'LINE',
  'STOP', 'DEFS', 'TSPAN', 'CANVAS', 'CIRCLE', 'ELLIPSE', 'POLYGON',
  'POLYLINE', 'CLIP_PATH', 'LINEAR_GRADIENT', 'RADIAL_GRADIENT'
] as const;

export const baseGenericComponentSchema = z.object({
  type: z.enum(genericComponentTypes),
  box: z.object({}).optional(),
  style: z.object({}).passthrough().optional(),
  props: z.object({}).passthrough().optional(),
});

export type BaseGenericComponentSchema = z.infer<typeof baseGenericComponentSchema>;