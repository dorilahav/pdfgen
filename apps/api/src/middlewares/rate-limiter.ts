import { Context } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { ApplicationEnvironment } from './verify-application';

const client = createClient({
  name: 'rate-limiter'
});

export const initRateLimit = async () => {
  await client.connect();
}

const prefixKey = (prefix: string, key: string) => `${prefix}:${key}`;

const userIpKeyGenerator = (prefix: string) => (c: Context): string => {
  const ip = c.env?.incoming?.socket?.remoteAddress ?? 'unknown-ip';

  return prefixKey(prefix, ip);
}

const applicationIdKeyGenerator = (prefix: string) => (c: Context<ApplicationEnvironment>): string => {
  const application = c.get('application');

  return prefixKey(prefix, application.id);
}

interface AuthorizedApplicationRateLimiterConfig {
  prefix: string;
  limit: number;
}

export const createAuthorizedApplicationRateLimiter = (config: AuthorizedApplicationRateLimiterConfig) => (
  rateLimiter<ApplicationEnvironment>({
    windowMs: 60 * 1000,
    limit: config.limit,
    keyGenerator: applicationIdKeyGenerator(config.prefix),
    store: new RedisStore({
      sendCommand: (...args: string[]) => client.sendCommand(args)
    }) as any
  })
);

export const globalRateLimiter = () => rateLimiter({
  windowMs: 1000,
  limit: 10,
  keyGenerator: userIpKeyGenerator('global'),
  store: new RedisStore({
    sendCommand: (...args: string[]) => client.sendCommand(args)
  }) as any
});