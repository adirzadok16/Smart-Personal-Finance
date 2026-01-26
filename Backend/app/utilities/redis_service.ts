import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisService {
    private static instance: RedisClientType<any, any> | null = null;
    private static connecting: Promise<RedisClientType<any, any>> | null = null;

    private constructor() { }

    // ------------------ connect ------------------
    public static async connectRedis() {
        if (this.instance?.isOpen) return this.instance;

        if (!this.connecting) {
            this.connecting = (async () => {
                const client: RedisClientType<any, any> = createClient({
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                });

                client.on('error', (err) => console.error('Redis Client Error', err));

                await client.connect();
                console.log('Redis connected');

                RedisService.instance = client;
                this.connecting = null;
                return client;
            })();
        }

        return this.connecting;
    }

    // ------------------ getClient ------------------
    private static async getClient(): Promise<RedisClientType<any, any>> {
        if (!RedisService.instance || !RedisService.instance.isOpen) {
            await RedisService.connectRedis();
        }
        return RedisService.instance!;
    }

    // ------------------ set ------------------
    public static async set(key: string, value: string, ttlSeconds?: number) {
        const client = await RedisService.getClient();
        if (ttlSeconds) {
            await client.setEx(key, ttlSeconds, value);
        } else {
            await client.set(key, value);
        }
    }

    // ------------------ get ------------------
    public static async get(key: string) {
        const client = await RedisService.getClient();
        return await client.get(key);
    }

    // ------------------ del ------------------
    public static async del(key: string) {
        const client = await RedisService.getClient();
        return await client.del(key);
    }

    // ------------------ delPattern ------------------
    public static async delPattern(pattern: string) {
        const client = await RedisService.getClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(keys);
        }
    }

    // ------------------ shutdown ------------------
    public static async shutdown() {
        if (RedisService.instance) {
            console.log('Closing Redis connection...');
            await RedisService.instance.quit();
            RedisService.instance = null;
            console.log('Redis disconnected');
        }
    }
}

export default RedisService;



