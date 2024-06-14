import { ErrorApiResponse } from '.';

export enum PdfGenErrorCode {
  Unknown = 100,
  Unauthorized = 101,
  RateLimited = 102,
  Validation = 103,
  Timeout = 104,
  Cancelled = 105,
  Network = 106,
  NotFound=107,

  Reconciliation = 200,

  InternalService = 999
}

export abstract class PdfGenApiError extends Error {
  code: PdfGenErrorCode;

  constructor(code: PdfGenErrorCode, message: string, cause?: unknown) {
    super(message, {cause});
    this.code = code;
  }
}

export class UnexpectedError extends PdfGenApiError {
  constructor(cause: unknown) {
    super(PdfGenErrorCode.Unknown, "An unexpected error has occurred.", cause);
  }
}

export class UnauthorizedError extends PdfGenApiError {
  constructor() {
    super(PdfGenErrorCode.Unauthorized, "The pdfgenapi.com api could not have authorized your request. Make sure you provided the right token to the api client.");
  }
}

export class ValidationError extends PdfGenApiError {
  details?: object;

  constructor(message: string, details?: object) {
    super(PdfGenErrorCode.Validation, message);
    this.details = details;
  }
}

export class RateLimitError extends PdfGenApiError {
  constructor(response: ErrorApiResponse) {
    super(PdfGenErrorCode.RateLimited, 'A rate limit has been hit. Try again later or consider upgrading your api plan.');
    // TODO: Expose a rate limit info object
  }
}

export class InternalServiceError extends PdfGenApiError {
  constructor() {
    super(PdfGenErrorCode.InternalService, 'The pdfgenapi.com api is not available. This error is in our end, we will fix it asap.')
  }
}

export class TimeoutError extends PdfGenApiError {
  constructor() {
    super(PdfGenErrorCode.Timeout, "Request to pdfgenapi.com api took too long and hit a client timeout. This could happen due to slow internet connection or a problem in our end. Please try again later.");
  }
}

export class CancelledError extends PdfGenApiError {
  constructor() {
    super(PdfGenErrorCode.Cancelled, "Request was cancelled.");
  }
}

export class NetworkError extends PdfGenApiError {
  constructor() {
    super(PdfGenErrorCode.Network, "Request didn't hit the pdfgenapi.com api. Please make sure you have a working internet connection and the provided hostname is correct.");
  }
}

export class PdfNotFoundError extends PdfGenApiError {
  constructor(idAsString: string) {
    super(PdfGenErrorCode.NotFound, `Couldn\'t find a pdf with id=${idAsString}`)
  }
}