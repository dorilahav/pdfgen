declare module '@react-pdf/pdfkit' {
  import { Context, PageLayout, PageMode, PDFVersion } from '@react-pdf/types';

  interface PDFKitContextOptions {
    compress?: boolean;
    pdfVersion?: PDFVersion;
    lang?: string;
    displayTitle?: boolean;
    autoFirstPage?: boolean;
    pageLayout?: PageLayout;
    pageMode?: PageMode;
  }

  export interface PDFKitContext extends Context {
    new (options: PDFKitContextOptions): PDFKitContext;
  }

  const ctx: PDFKitContext;

  export default ctx;
}

declare module '@react-pdf/layout' {
  import { PdfComponent } from '@react-pdf/renderer';
  import { FontStore } from '@react-pdf/types';

  export interface PdfLayout {}

  type LayoutDocument = (container: PdfComponent, fontStore: FontStore) => PdfLayout;

  const layoutDocument: LayoutDocument;

  export default layoutDocument;
}

declare module '@react-pdf/render' {
  import { PdfLayout } from '@react-pdf/layout';
  import { PDFKitContext } from '@react-pdf/pdfkit';
  import { Readable } from 'stream';

  type RenderPdf = (ctx: PDFKitContext, layout: PdfLayout) => Readable;

  const renderPdf: RenderPdf;

  export default renderPdf;
}