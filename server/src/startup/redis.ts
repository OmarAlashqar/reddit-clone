import connectRedis from "connect-redis";
import session from "express-session";
import Redis from "ioredis";

export interface RedisConnection {
  RedisStore: connectRedis.RedisStore;
  redisClient: Redis.Redis;
}

export const redis = (): RedisConnection => {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  return { RedisStore, redisClient };
};
