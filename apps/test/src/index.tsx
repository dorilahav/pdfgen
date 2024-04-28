import { initLogging } from '@pdfgen/logging';
import { promisifyStream } from '@pdfgen/utils';
import layoutDocument from '@react-pdf/layout';
import PDFDocument from '@react-pdf/pdfkit';
import renderPDF from '@react-pdf/render';
import { Font, pdf } from '@react-pdf/renderer';
import { createWriteStream } from 'fs';
import * as path from 'path';
import * as React from 'react';
import { Writable } from 'stream';
import Resume from './resume';

initLogging({
  logFilePath: path.join('logs', 'app.log'),
  dev: true,
  debug: true
});

const element = <Resume/>;

const pdfDocument = pdf(element);

const container = pdfDocument.container;

interface ReactPdfContainer {
  type: 'ROOT';
  document: any;
}

const createPdf = async (container: ReactPdfContainer) => {
  const ctx = new PDFDocument({
    compress: true,
    displayTitle: true,
    autoFirstPage: false
  });

  const layout = await layoutDocument(container.document, Font);
  const pdfReadStream = renderPDF(ctx, layout);

  return {
    pipeToWritable(writeStream: Writable): Promise<void> {
      pdfReadStream.pipe(writeStream);

      return promisifyStream(writeStream);
    }
  }
}

const writeStream = createWriteStream('./shit.pdf');

createPdf(container)
  .then(x => x.pipeToWritable(writeStream))
  .then(() => console.log('Done Generating Pdf!'));