import { logger } from '@pdfgen/logging';
import { PdfGeneratedMessageContent, Worker } from '@pdfgen/queuing';
import { wrapMonad } from '@pdfgen/utils';
import { markPdfDocumentAsReady } from '../repositories/pdf-documents';

const markPdfReady: Worker<PdfGeneratedMessageContent> = async (pdfId, content, ack, isRetry) => {
  const context = {pdfId, fileId: content.fileId};

  logger.info({msg: 'Updating pdf status to ready...', context});

  const [isRejected, error, pdfDocument] = await wrapMonad(() => markPdfDocumentAsReady(pdfId, content.fileId));
  
  if (isRejected) {
    logger.error({msg: `Cannot mark Pdf as ready because an error has occurred.`, context, err: error});

    // TODO: pass to error queue.

    return ack.failure();
  }

  if (!pdfDocument) {
    if (isRetry) {
      logger.error({msg: 'Cannot mark pdf as ready because it was not found in the DB! This might be caused because of a bug.', context});

      return ack.failure();
    }

    logger.warn({msg: 'Cannot mark pdf as ready because it was not found in the DB! Retrying...', context});

    return ack.requeue();
  }

  logger.info({msg: 'Marked pdf as ready!', context});

  return ack.success();
}

export default markPdfReady;