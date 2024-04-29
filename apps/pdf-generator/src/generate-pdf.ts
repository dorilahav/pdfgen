import layoutDocument from '@react-pdf/layout';
import PDFKitContext from '@react-pdf/pdfkit';
import renderPDF from '@react-pdf/render';
import { Font, PdfContainer } from '@react-pdf/renderer';

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

export const generatePdf = async (container: PdfContainer) => {
  const ctx = new PDFKitContext({
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