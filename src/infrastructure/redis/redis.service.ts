import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './constants';

/**
 * Best-practice, generic Redis service that serializes/deserializes
 * complex values and returns correctly typed objects.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly _client: RedisClientType,
  ) {}

  get client(): RedisClientType {
    return this._client;
  }

  /**
   * Graceful connection shutdown.
   */
  async onModuleDestroy() {
    await this._client.quit();
  }

  /**
   * Set a key with a value (any type), optionally with a TTL (in seconds).
   * Values are automatically stringified to JSON.
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const strValue = JSON.stringify(value);
    if (ttl) {
      await this._client.setEx(key, ttl, strValue);
    } else {
      await this._client.set(key, strValue);
    }
  }

  /**
   * Get a value by key. Automatically parses JSON to the provided type.
   */
  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this._client.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // fallback if value is not JSON
      return raw as unknown as T;
    }
  }

  /**
   * Delete a key.
   */
  async del(key: string): Promise<void> {
    await this._client.del(key);
  }

  /**
   * Check whether a key exists.
   */
  async exists(key: string): Promise<boolean> {
    const result = await this._client.exists(key);
    return result === 1;
  }

  /**
   * Set a field in a hash with value (any type), stringifying it.
   */
  async hSet<T = any>(key: string, field: string, value: T): Promise<void> {
    const strValue = JSON.stringify(value);
    await this._client.hSet(key, field, strValue);
  }

  /**
   * Get a field from a hash. Attempts to parse it as JSON.
   */
  async hGet<T = any>(key: string, field: string): Promise<T | null> {
    const raw = await this._client.hGet(key, field);
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
    const result = await this._client.hGetAll(key);
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
    await this._client.hDel(key, field);
  }
}
