import { AxiosError, AxiosInstance, isAxiosError } from 'axios';
import { CancelledError, InternalServiceError, NetworkError, TimeoutError, UnexpectedError } from '../errors';

export type OkApiResponse<T> = {
  ok: true;
  status: number;
  data: T;
};

export type ErrorApiResponse = {
  ok: false;
  status: number;
  data?: object;
}

export type ApiResponse<T> = OkApiResponse<T> | ErrorApiResponse;

export type SendApiRequest = <T>(method: string, url: string, signal?: AbortSignal, body?: unknown) => Promise<ApiResponse<T>>;

const rethrowAxiosErrorAsApiError = (error: AxiosError) => {
  if (error.code === AxiosError.ERR_BAD_RESPONSE) {
    throw new InternalServiceError();
  }

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    throw new TimeoutError();
  }

  if (error.code === AxiosError.ERR_CANCELED) {
    throw new CancelledError();
  }

  if (error.code === AxiosError.ERR_NETWORK) {
    throw new NetworkError();
  }
}

export const sendApiRequest = (axiosClient: AxiosInstance): SendApiRequest => (
  async (method, url, signal, body) => {
    try {
      const response = await axiosClient({
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: body,
        signal,
        timeout: 30 * 1000 // TODO: Change this and maybe make configurable.
      });

      return {
        ok: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.code)
        if (error.code === AxiosError.ERR_BAD_REQUEST) {
          return {
            ok: false,
            status: error.response!.status,
            data: error.response?.data
          }
        }

        rethrowAxiosErrorAsApiError(error);
      }

      throw new UnexpectedError(error);
    }
  }
)