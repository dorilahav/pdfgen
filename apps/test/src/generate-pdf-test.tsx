import layoutDocument from '@react-pdf/layout';
import PDFDocument from '@react-pdf/pdfkit';
import renderPDF from '@react-pdf/render';
import { Font, pdf } from '@react-pdf/renderer';
import * as React from 'react';
import { Pdf } from './shit';

export const generatePdf = async (container: any) => {
  const ctx = new PDFDocument({
    compress: true,
    displayTitle: true,
    autoFirstPage: false
  });

  const layout = await layoutDocument(container.document, Font);
  const pdfReadStream = renderPDF(ctx, layout);

  return {
    pdfReadStream
  }
}

const element = (
  <Pdf/>
);

const pdfDocument = pdf(element);

const container = pdfDocument.container;

console.log(container.document.children[0].children);