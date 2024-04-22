import { Writable } from 'stream';

export const promisifyStream = (stream: Writable) => new Promise((resolve, reject) => {
  stream.on('error', reject);
  stream.on('finish', resolve);
});