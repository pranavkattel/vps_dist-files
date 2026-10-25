"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const env_1 = require("./env");
const logger_util_1 = require("../utils/logger.util");
const initRedis = async () => {
    try {
        exports.redisClient = (0, redis_1.createClient)({
            url: env_1.env.REDIS_URL,
        });
        exports.redisClient.on('error', (err) => {
            logger_util_1.logger.error('Redis Client Error:', err);
        });
        exports.redisClient.on('connect', () => {
            logger_util_1.logger.info('Redis client connected');
        });
        exports.redisClient.on('ready', () => {
            logger_util_1.logger.info('Redis client ready');
        });
        exports.redisClient.on('end', () => {
            logger_util_1.logger.info('Redis client disconnected');
        });
        await exports.redisClient.connect();
        await exports.redisClient.ping();
        logger_util_1.logger.info('Redis connection successful');
    }
    catch (error) {
        logger_util_1.logger.error('Failed to connect to Redis:', error);
        if (env_1.env.IS_DEVELOPMENT) {
            logger_util_1.logger.warn('Using mock Redis client for development');
            exports.redisClient = createMockRedisClient();
        }
        else {
            throw error;
        }
    }
};
exports.initRedis = initRedis;
function createMockRedisClient() {
    const mockStorage = new Map();
    return {
        get: async (key) => mockStorage.get(key) || null,
        set: async (key, value, options) => {
            mockStorage.set(key, value);
            return 'OK';
        },
        setEx: async (key, seconds, value) => {
            mockStorage.set(key, value);
            setTimeout(() => mockStorage.delete(key), seconds * 1000);
            return 'OK';
        },
        del: async (key) => {
            const deleted = mockStorage.delete(key);
            return deleted ? 1 : 0;
        },
        exists: async (key) => {
            return mockStorage.has(key) ? 1 : 0;
        },
        incr: async (key) => {
            const current = parseInt(mockStorage.get(key) || '0');
            const newValue = current + 1;
            mockStorage.set(key, newValue.toString());
            return newValue;
        },
        expire: async (key, seconds) => {
            if (mockStorage.has(key)) {
                setTimeout(() => mockStorage.delete(key), seconds * 1000);
                return 1;
            }
            return 0;
        },
        flushAll: async () => {
            mockStorage.clear();
            return 'OK';
        },
        quit: async () => 'OK',
        disconnect: () => Promise.resolve(),
    };
}
process.on('SIGINT', async () => {
    logger_util_1.logger.info('Closing Redis connection...');
    if (exports.redisClient && typeof exports.redisClient.quit === 'function') {
        await exports.redisClient.quit();
    }
    logger_util_1.logger.info('Redis connection closed');
});
//# sourceMappingURL=redis.js.map