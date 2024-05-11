import { z } from 'zod';
import { baseGenericComponentSchema, BaseGenericComponentSchema, ImageComponent, imageComponentSchema, TextComponent, textComponentSchema } from './schemas';

type ReactPdfComponent = ReactPdfGenericComponent | ImageComponent | TextComponent;

interface ReactPdfGenericComponent extends BaseGenericComponentSchema {
  children?: ReactPdfComponent[];
};

let anyComponentSchema: z.ZodType<ReactPdfComponent>;

const genericComponentSchema: z.ZodType<ReactPdfGenericComponent> = baseGenericComponentSchema.extend({
  children: z.lazy(() => anyComponentSchema.array()).optional()
});

anyComponentSchema = genericComponentSchema.or(imageComponentSchema).or(textComponentSchema);

interface ReactPdfDocumentComponent extends Omit<ReactPdfComponent, 'type'> {
  type: 'DOCUMENT';
}

const reactPdfDocumentComponentSchema = z.object({
  type: z.literal('DOCUMENT'),
  children: z.lazy(() => anyComponentSchema.array()).optional(),
  box: z.object({}).optional(),
  style: z.object({}).passthrough().optional(),
  props: z.object({}).passthrough().optional(),
}) satisfies z.ZodType<ReactPdfDocumentComponent>;

export interface ReactPdfContainer {
  type: 'ROOT';
  document: ReactPdfDocumentComponent;
}

export const reactPdfContainerSchema = z.object({
  type: z.literal('ROOT'),
  document: reactPdfDocumentComponentSchema
}) satisfies z.ZodType<ReactPdfContainer>;