import { Db, GridFSBucket, GridFSBucketOptions, GridFSFile, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { promisifyStream } from '../utils';
import { FileManager, getIdFromIdOrFile, PersistedFile } from './base-file-manager';

const mapGridFsFileToFile = (gridFsFile: GridFSFile): PersistedFile => ({
  id: gridFsFile._id.toString(),
  name: gridFsFile.filename,
  size: gridFsFile.length,
  uploadDate: gridFsFile.uploadDate,
  ownerId: gridFsFile.metadata!.ownerId
});

export const createGridFsFileManager = (mongoDatabase: Db, options?: GridFSBucketOptions): FileManager => {
  const bucket = new GridFSBucket(mongoDatabase, options);

  const getById = async (id: string): Promise<PersistedFile | null> => {
    // TODO: check if objectid is valid
    const _id = new ObjectId(id);
    const arrayWithFile = await bucket.find({_id}, {limit: 1}).toArray();

    if (!arrayWithFile.length) {
      return null;
    }

    return mapGridFsFileToFile(arrayWithFile[0]);
  }

  const upload = async (fileName: string, fileStream: Readable, ownerId: string): Promise<PersistedFile> => {
    const uploadStream = bucket.openUploadStream(fileName, {metadata: {ownerId}});

    fileStream.pipe(uploadStream);
    
    await promisifyStream(uploadStream);

    return mapGridFsFileToFile(uploadStream.gridFSFile!);
  }

  const downloadAsStream = (idOrFile: string | PersistedFile): Readable => {
    // TODO: check if objectid is valid
    const id = getIdFromIdOrFile(idOrFile);
    const _id = new ObjectId(id);

    return bucket.openDownloadStream(_id);
  }

  return {
    getById,
    upload,
    downloadAsStream
  }
}