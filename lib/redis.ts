import Redis from "ioredis";
import { logger } from "./logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 0,
    lazyConnect: true,
    connectTimeout: 500, // 500ms timeout
    retryStrategy: () => null, // Stop reconnecting if server is down
  });

  redis.on("error", (err) => {
    // Log at debug level to avoid spamming console during tests or local dev without Redis
    logger.debug(`Redis connection error: ${err.message}`);
  });

  redis.on("connect", () => {
    logger.info("Connected to Redis server successfully.");
  });
} catch (err: any) {
  logger.error(`Failed to initialize Redis client: ${err.message}`);
}

/**
 * Get data from cache, parsing it from JSON
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err: any) {
    logger.debug(`Error reading key "${key}" from Redis cache: ${err.message}`);
    return null;
  }
}

/**
 * Set data in cache, stringifying it to JSON, with an optional TTL in seconds
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<void> {
  if (!redis) return;
  try {
    const serialized = JSON.stringify(data);
    await redis.set(key, serialized, "EX", ttlSeconds);
  } catch (err: any) {
    logger.debug(`Error writing key "${key}" to Redis cache: ${err.message}`);
  }
}

/**
 * Invalidate cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err: any) {
    logger.debug(`Error invalidating key "${key}" from Redis cache: ${err.message}`);
  }
}

/**
 * Flush cache using a pattern (useful for wildcard invalidations, e.g. "dashboard:company:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err: any) {
    logger.debug(`Error invalidating pattern "${pattern}" from Redis cache: ${err.message}`);
  }
}

export { redis };
