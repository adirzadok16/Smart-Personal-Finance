import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
    private static instance: RedisClientType<any, any> | null = null;
    private static connecting: Promise<RedisClientType<any, any>> | null = null;

    // Private constructor to prevent instantiation
    private constructor() { }

    // ------------------ CONNECT ------------------
    /**
     * Connects to Redis if not already connected.
     * Returns the Redis client instance.
     */
    public static async connect() {
        if (this.instance?.isOpen) {
            console.log('[REDIS] Already connected');
            return this.instance;
        }

        if (!this.connecting) {
            console.log('[REDIS] Connecting to Redis...');
            this.connecting = (async () => {
                const client: RedisClientType<any, any> = createClient({
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                });

                // Handle connection errors
                client.on('error', (err) => console.error('❌ [REDIS] Client Error:', err));

                await client.connect();
                console.log('✅ [REDIS] Connected successfully');

                RedisService.instance = client;
                this.connecting = null;
                return client;
            })();
        }

        return this.connecting;
    }

    // ------------------ GET CLIENT ------------------
    /**
     * Returns the active Redis client.
     * Connects automatically if not connected.
     */
    private static async getClient(): Promise<RedisClientType<any, any>> {
        if (!RedisService.instance || !RedisService.instance.isOpen) {
            console.log('[REDIS] Client not connected, connecting...');
            await RedisService.connect();
        }
        return RedisService.instance!;
    }

    // ------------------ SET ------------------
    /**
     * Set a key-value pair in Redis.
     * @param key - Redis key
     * @param value - Value to store
     * @param ttlSeconds - Optional time-to-live in seconds
     */
    public static async set(key: string, value: string, ttlSeconds?: number) {
        const client = await RedisService.getClient();
        if (ttlSeconds) {
            console.log(`[REDIS] Setting key: ${key} with TTL: ${ttlSeconds}s`);
            await client.setEx(key, ttlSeconds, value);
        } else {
            console.log(`[REDIS] Setting key: ${key} without TTL`);
            await client.set(key, value);
        }
    }

    // ------------------ GET ------------------
    /**
     * Get a value by key from Redis
     * @param key - Redis key
     * @returns Value or null if not found
     */
    public static async get(key: string) {
        const client = await RedisService.getClient();
        const value = await client.get(key);
        console.log(`[REDIS] Retrieved key: ${key} ->`, value);
        return value;
    }

    // ------------------ DEL ------------------
    /**
     * Delete a key from Redis
     * @param key - Redis key
     */
    public static async del(key: string) {
        const client = await RedisService.getClient();
        console.log(`[REDIS] Deleting key: ${key}`);
        return await client.del(key);
    }

    // ------------------ DEL PATTERN ------------------
    /**
     * Delete all keys matching a pattern
     * @param pattern - Redis key pattern (e.g., "dashboard:*")
     */
    public static async delPattern(pattern: string) {
        const client = await RedisService.getClient();
        console.log(`[REDIS] Deleting keys with pattern: ${pattern}`);
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            console.log(`[REDIS] Keys to delete:`, keys);
            await client.del(keys);
        } else {
            console.log('[REDIS] No keys found for pattern');
        }
    }

    // ------------------ SHUTDOWN ------------------
    /**
     * Gracefully close Redis connection
     */
    public static async shutdown() {
        if (RedisService.instance) {
            console.log('[REDIS] Closing Redis connection...');
            await RedisService.instance.quit();
            RedisService.instance = null;
            console.log('✅ [REDIS] Disconnected successfully');
        }
    }
}

export default RedisService;
