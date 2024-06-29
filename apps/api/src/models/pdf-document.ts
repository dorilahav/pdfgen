import { model, Schema, Types } from 'mongoose';
import { Application } from './application';

export enum PdfDocumentStatus {
  // This status represents that a document is being generated and is not yet ready for download.
  Generating = 1,

  // This status represents that the document has finished generating and it can be accessed.
  Ready
}

interface BasePdfDocument {
  ownerApplication: Types.ObjectId;
  createdAt: Date;
  status: Exclude<PdfDocumentStatus, PdfDocumentStatus.Ready>;
  fileId?: never;
}

export type PdfDocument = BasePdfDocument | {
  ownerApplication: Types.ObjectId;
  createdAt: Date;
  status: PdfDocumentStatus.Ready;
  fileId: string;
}

const PdfDocumentSchema = new Schema<PdfDocument>({
  ownerApplication: {
    type: Schema.Types.ObjectId,
    ref: Application.modelName
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: Number,
    required: true,
    default: PdfDocumentStatus.Generating
  },
  fileId: {
    type: Types.ObjectId,
    required() {
      return this.status === PdfDocumentStatus.Ready;
    }
  }
}, {virtuals: true});

PdfDocumentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret, _options) {
    delete ret._id;
    delete ret.ownerApplication;
    delete ret.fileId;
  },
});

export const PdfDocument = model('PdfDocument', PdfDocumentSchema, 'pdf-documents');