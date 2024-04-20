import { model, Schema } from 'mongoose';

export enum PdfDocumentStatus {
  Pending = 1,
  Processing,
  Created
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

export const PdfDocument = model('PdfDocument', PdfDocumentSchema, 'pdf-documents');