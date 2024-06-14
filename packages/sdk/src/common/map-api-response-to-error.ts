import { RateLimitError, UnauthorizedError, UnexpectedError } from './errors';
import { ErrorApiResponse } from './http-client';

export const mapApiResponseToError = (response: ErrorApiResponse): Error => {
  if (response.status === 401) {
    return new UnauthorizedError();
  }

  if (response.status === 429) {
    return new RateLimitError(response);
  }

  return new UnexpectedError(response.data);
}