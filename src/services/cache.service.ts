import NodeCache from 'node-cache';
import { logger } from '../config/deps';

class CacheService {
    private readonly cache: NodeCache;
    private static instance: CacheService;

    private constructor() {
        this.cache = new NodeCache({
            stdTTL: 3600,
            checkperiod: 600,
            useClones: false
        });
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    public async get<T = any>(key: string): Promise<T | null> {
        const value = this.cache.get<T>(key);
        if (value) {
            logger.debug({ key }, 'Cache hit');
            return value;
        }
        logger.debug({ key }, 'Cache miss');
        return null;
    }

    public async set<T>(key: string, value: T): Promise<boolean> {
        const success = this.cache.set(key, value);
        if (success) {
            logger.debug({ key }, 'Cache set');
        } else {
            logger.warn({ key }, 'Failed to set cache');
        }
        return success;
    }

    public async del(key: string): Promise<number> {
        const deleted = this.cache.del(key);
        logger.debug({ key, deleted }, 'Cache deleted');
        return deleted;
    }

    public async flush(): Promise<void> {
        this.cache.flushAll();
        logger.info('Cache flushed');
    }
}

export const cacheService = CacheService.getInstance();
