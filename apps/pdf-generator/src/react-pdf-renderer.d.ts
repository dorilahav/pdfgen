import '@react-pdf/renderer';

declare module '@react-pdf/renderer' {
  export interface PdfContainer {
    type: 'ROOT';
    document: any;
  }
}