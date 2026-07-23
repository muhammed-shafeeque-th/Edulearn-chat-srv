import { Injectable } from '@nestjs/common';
import { CacheService } from '@edulearn/nest';
import { ICacheService } from '@/application/ports/cache.service';
import { ILoggerService } from '@/application/ports/logger.service';

@Injectable()
export class RedisClientImpl implements ICacheService {
  constructor(
    private readonly _cache: CacheService,
    private readonly _logger: ILoggerService,
  ) {}

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    return this._cache.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    return this._cache.get(key);
  }

  async ping(): Promise<void> {
    this._cache.ping();
  }

  async del(key: string): Promise<void> {
    return this._cache.delete(key);
  }

  get client() {
    return this._cache.getClient();
  }

  async exists(key: string): Promise<boolean> {
    return this._cache.exists(key);
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return this._cache.getMultiple(keys);
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const stream = this._cache.getClient().scanStream({
        match: pattern,
        count: 100, // adjust batch size depending on key volume
      });

      let deletedCount = 0;
      const pipeline = this._cache.getClient().pipeline();

      for await (const keys of stream) {
        if (Array.isArray(keys) && keys.length) {
          keys.forEach((key: string) => pipeline.del(key));
          const results = await pipeline.exec();
          deletedCount += Array.isArray(results) ? results.length : 0;
        }
      }

      this._logger.debug(
        `Deleted ${deletedCount} keys matching pattern "${pattern}"`,
        { ctx: 'RedisClient' },
      );
    } catch (error: any) {
      this._logger.warn(
        `Failed to delete keys by pattern "${pattern}": ${error.message}`,
        { error, ctx: 'RedisClient' },
      );
      throw error;
    }
  }

  /**
   * Set a field in a hash with value (any type), stringifying it.
   */
  async hSet<T = any>(key: string, field: string, value: T): Promise<void> {
    const strValue = JSON.stringify(value);
    await this._cache.getClient().hset(key, field, strValue);
  }

  /**
   * Get a field from a hash. Attempts to parse it as JSON.
   */
  async hGet<T = any>(key: string, field: string): Promise<T | null> {
    const raw = await this._cache.getClient().hget(key, field);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  /**
   * Get all fields and values in a hash, parsing values as JSON.
   */
  async hGetAll<T = any>(key: string): Promise<Record<string, T>> {
    const result = await this._cache.getClient().hgetall(key);
    Object.keys(result).forEach((field) => {
      try {
        result[field] = JSON.parse(result[field]);
      } catch {
        // Leave as is if not JSON
      }
    });
    return result as Record<string, T>;
  }

  /**
   * Delete a hash field.
   */
  async hDel(key: string, field: string): Promise<void> {
    await this._cache.getClient().hdel(key, field);
  }
}
