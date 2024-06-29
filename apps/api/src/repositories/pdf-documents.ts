import { PdfDocument, PdfDocumentStatus } from '../models';

export const createPdfDocument = async (ownerApplicationId: string) => {
  return await new PdfDocument({
    ownerApplication: ownerApplicationId
  }).save();
}

export const getPdfDocumentById = async (pdfDocumentId: string) => {
  return await PdfDocument.findById(pdfDocumentId);
}

export const markPdfDocumentAsReady = async (pdfDocumentId: string, fileId: string) => {
  return await PdfDocument.findByIdAndUpdate(pdfDocumentId, {
    $set: {
      fileId,
      status: PdfDocumentStatus.Ready
    }
  }, {new: true});
}