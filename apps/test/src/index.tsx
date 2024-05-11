import { initLogging } from '@pdfgen/logging';
import layoutDocument from '@react-pdf/layout';
import PDFDocument from '@react-pdf/pdfkit';
import renderPDF from '@react-pdf/render';
import { Font, pdf } from '@react-pdf/renderer';
import * as path from 'path';
import * as React from 'react';
import { Pdf } from './shit';

// TODO: update fields based on environment
initLogging({
  logFilePath: path.join('logs', 'app.log'),
  dev: true,
  debug: true,
  environment: 'development'
});

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

// const writeStream = createWriteStream('./shit.pdf');

// generatePdf(container)
//   .then(x => {
//     x.pdfReadStream.pipe(writeStream);

//     return promisifyStream(writeStream);
//   })
//   .then(() => console.log('Done Generating Pdf!'));