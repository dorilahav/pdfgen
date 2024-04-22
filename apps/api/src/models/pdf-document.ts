import { model, Schema } from 'mongoose';

export enum PdfDocumentStatus {
  // This status represents that a document is waiting to be processed. Before it was picked up by an agent.
  Pending = 1,
  // This status represents that an agent is currently generating the document.
  Generating,
  // This status represents that the document has finished generating and it can be accessed.
  Ready
}

export interface PdfDocument {
  createdAt: Date;
  status: PdfDocumentStatus;
}

const PdfDocumentSchema = new Schema<PdfDocument>({
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: Number,
    required: true,
    default: PdfDocumentStatus.Pending
  }
}, {virtuals: true});

PdfDocumentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret, options) {
    delete ret._id;
  },
});

export const PdfDocument = model('PdfDocument', PdfDocumentSchema, 'pdf-documents');