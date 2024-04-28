import { Stream } from 'stream';

export const promisifyStream = (stream: Stream): Promise<void> => new Promise((resolve, reject) => {
  stream.on('error', reject);
  stream.on('finish', resolve);
});