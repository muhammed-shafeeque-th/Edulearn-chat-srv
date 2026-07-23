export abstract class ICacheService {
  client: any;

  /**
   * Set a key with a value (any type), optionally with a TTL (in seconds).
   * Values are automatically stringified to JSON.
   */
  abstract set<T = any>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Get a value by key. Automatically parses JSON to the provided type.
   */
  abstract get<T = any>(key: string): Promise<T | null>;

  /**
   * Delete a key.
   */
  abstract del(key: string): Promise<void>;
  /**
   * Check whether a key exists.
   */
  abstract exists(key: string): Promise<boolean>;

  /**
   * Set a field in a hash with value (any type), stringifying it.
   */
  abstract hSet<T = any>(key: string, field: string, value: T): Promise<void>;

  /**
   * Get a field from a hash. Attempts to parse it as JSON.
   */
  abstract hGet<T = any>(key: string, field: string): Promise<T | null>;

  /**
   * Get all fields and values in a hash, parsing values as JSON.
   */
  abstract hGetAll<T = any>(key: string): Promise<Record<string, T>>;

  /**
   * Delete a hash field.
   */
  abstract hDel(key: string, field: string): Promise<void>;

  abstract ping(): Promise<void>;
}
