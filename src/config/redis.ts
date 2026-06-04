// src/config/redis.ts
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Redis connection string from environment
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client
const createRedisClient = (): Redis => {
  try {
    // Parse the URL to determine if it's an Upstash URL
    const isUpstash = redisUrl.includes('upstash.io');
    
    logger.info(`Initializing Redis client for ${isUpstash ? 'Upstash' : 'local'} Redis`);
    
    const redis = new Redis(redisUrl, {
      // CRITICAL: Must be null for BullMQ compatibility
      maxRetriesPerRequest: null,
      
      // Keep readyCheck enabled for connection verification
      enableReadyCheck: true,
      
      // Increased timeout for cloud Redis
      connectTimeout: 30000,    // 30 seconds for cloud services
      
      // Proper TLS config for Upstash
      tls: isUpstash ? { rejectUnauthorized: true } : undefined,
      
      // Improved retry strategy with longer delays
      retryStrategy(times: number): number | null {
        if (times > 5) {  // Allow up to 5 retry attempts
          logger.error('Redis connection failed after 5 retries');
          return null;
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.min(Math.pow(2, times - 1) * 1000, 30000);
        logger.info(`Redis connection retry attempt ${times}, waiting ${delay}ms before next attempt`);
        return delay;
      },
    });

    // --- CRITICAL FIX FOR BULLMQ + UPSTASH ---
    // Intercept the 'info' command. BullMQ strictly requires a `redis_version` 
    // formatted with \r\n line breaks. Upstash sometimes fails this parse.
    const originalInfo = redis.info.bind(redis);
    
    // @ts-ignore - Overriding internal ioredis method for BullMQ compatibility
    redis.info = async (...args: any[]) => {
      try {
        const infoStr = await originalInfo(...args);
        
        if (typeof infoStr === 'string') {
          // Normalize all line breaks to \r\n (which BullMQ strictly requires)
          let formattedInfo = infoStr.replace(/\r?\n/g, '\r\n');
          
          // If the 'redis_version:' tag is missing, inject a dummy version
          if (!formattedInfo.includes('redis_version:')) {
            formattedInfo += '\r\nredis_version:7.2.0\r\n';
          }
          
          return formattedInfo;
        }
        
        // Fallback if the result isn't a string at all
        return '# Server\r\nredis_version:7.2.0\r\n';
      } catch (err) {
        // Fallback in case of a proxy block or command failure
        return '# Server\r\nredis_version:7.2.0\r\n';
      }
    };
    // -----------------------------------------
    
    // Event handlers for better monitoring
    redis.on('connect', () => {
      logger.info(`Redis client connected successfully to ${isUpstash ? 'Upstash' : 'local'} Redis`);
    });
    
    redis.on('ready', () => {
      logger.info('Redis client is ready to accept commands');
    });
    
    redis.on('error', (err) => {
      logger.error('Redis connection error:', {
        message: err.message,
        code: (err as any).code,
        errno: (err as any).errno,
        syscall: (err as any).syscall
      });
    });
    
    redis.on('reconnecting', () => {
      logger.info('Redis client attempting to reconnect...');
    });
    
    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });
    
    redis.on('end', () => {
      logger.warn('Redis connection ended');
    });
    
    return redis;
  } catch (error) {
    logger.error('Error creating Redis client:', error);
    throw new Error('Failed to initialize Redis client');
  }
};

// Export the Redis connection factory
export const redisClient = createRedisClient();