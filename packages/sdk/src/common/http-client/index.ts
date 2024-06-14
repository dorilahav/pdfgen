import axios from 'axios';
import { SendApiRequest, sendApiRequest } from './send-api-request';

export interface HttpClient {
  sendApiRequest: SendApiRequest;
}

export const createHttpClient = (baseUrl: string, token: string): HttpClient => {
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return {
    sendApiRequest: sendApiRequest(axiosInstance)
  };
}

export type { ApiResponse, ErrorApiResponse, OkApiResponse } from './send-api-request';
