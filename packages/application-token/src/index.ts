import crypto from 'crypto';

type Token = string;

const toBase64 = (content: string) => Buffer.from(content).toString('base64url');
const fromBase64 = (content: string) => Buffer.from(content, 'base64url').toString('ascii');

const createHmac = (applicationId: string, secret: string) => crypto.createHmac('sha1', secret).update(applicationId).digest('base64url');

export const createToken = (applicationId: string, secret: string): Token => {
  const hmac = createHmac(applicationId, secret);
  
  return `${toBase64(applicationId)}.${hmac}`;
}

export const getApplicationIdFromToken = (token: Token): string => fromBase64(token.split('.')[0]);

export const isValidToken = (token: Token, applicationId: string, secret: string): boolean => (
  token === createToken(applicationId, secret)
);