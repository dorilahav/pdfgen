import { Id } from './types';

export interface GetDownloadUrlOptions {
  documentId: Id;
}

export type GetDownloadUrl = (options: GetDownloadUrlOptions) => string;

export const getDownloadUrl = (apiPath: string): GetDownloadUrl => (
  ({documentId}) => `${apiPath}/documents/${documentId}/download`
);