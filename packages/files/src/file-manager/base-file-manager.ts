import { Readable } from 'stream';

export interface PersistedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: Date;
}

export interface FileManager {
  getById: (id: string) => Promise<PersistedFile | null>;
  upload: (fileName: string, fileStream: Readable) => Promise<PersistedFile>;
  downloadAsStream: (idOrFile: string | PersistedFile) => Readable;
}

export const getIdFromIdOrFile = (idOrFile: string | PersistedFile): string => (
  typeof idOrFile === 'string' ? idOrFile : idOrFile.id
);