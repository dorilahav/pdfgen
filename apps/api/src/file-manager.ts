import { createGridFsFileManager, FileManager } from '@pdfgen/files';
import {connection} from 'mongoose';

export let fileManager: FileManager;

export const initializeFileManager = async (): Promise<FileManager> => {
  fileManager = createGridFsFileManager(connection.db);

  return fileManager;
}