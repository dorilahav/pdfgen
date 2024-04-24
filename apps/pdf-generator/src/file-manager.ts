import { createGridFsFileManager, FileManager } from '@pdfgen/files';
import { MongoClient } from 'mongodb';

export let fileManager: FileManager;

export const initializeFileManager = async (): Promise<FileManager> => {
  const client = new MongoClient('mongodb://localhost:27017/pdf-gen');

  await client.connect();
  
  fileManager = createGridFsFileManager(client.db());

  return fileManager;
}