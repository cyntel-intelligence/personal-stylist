import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed in the time window
  windowMs: number; // Time window in milliseconds
  message?: string; // Custom error message
}

interface RateLimitRecord {
  count: number;
  resetAt: number; // Timestamp when the counter resets
}

/**
 * Rate limiting middleware using Firestore
 * Tracks API usage per user and enforces limits
 *
 * Example usage:
 * const rateLimitResult = await checkRateLimit(userId, 'recommendations', { maxRequests: 10, windowMs: 60000 });
 * if (rateLimitResult.error) return rateLimitResult.error;
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ success: true; error?: never } | { error: NextResponse; success?: never }> {
  try {
    const now = Date.now();
    const rateLimitRef = adminFirestore
      .collection('rate_limits')
      .doc(`${userId}_${endpoint}`);

    // Use Firestore transaction to ensure atomic read-update
    const result = await adminFirestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const data = doc.data() as RateLimitRecord | undefined;

      // If no record exists or the window has expired, create a new one
      if (!data || now >= data.resetAt) {
        transaction.set(rateLimitRef, {
          count: 1,
          resetAt: now + config.windowMs,
        });
        return { allowed: true };
      }

      // Check if rate limit is exceeded
      if (data.count >= config.maxRequests) {
        const resetIn = Math.ceil((data.resetAt - now) / 1000); // Seconds until reset
        return {
          allowed: false,
          resetIn,
          current: data.count,
          limit: config.maxRequests,
        };
      }

      // Increment the counter
      transaction.update(rateLimitRef, {
        count: FieldValue.increment(1),
      });

      return { allowed: true };
    });

    if (!result.allowed) {
      const resetIn = result.resetIn ?? 0;
      const limit = result.limit ?? config.maxRequests;
      const current = result.current ?? 0;

      return {
        error: NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message:
              config.message ||
              `You have exceeded the rate limit for this endpoint. Please try again in ${resetIn} seconds.`,
            retryAfter: resetIn,
            limit: limit,
            current: current,
          },
          {
            status: 429,
            headers: {
              'Retry-After': resetIn.toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + resetIn).toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request to proceed (fail open)
    // Log this for monitoring
    return { success: true };
  }
}

/**
 * Preset rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // AI-powered endpoints (expensive)
  AI_RECOMMENDATIONS: {
    maxRequests: 10, // 10 generations per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'You have reached your hourly limit for AI outfit recommendations.',
  },
  AI_CLOSET_ANALYSIS: {
    maxRequests: 20, // 20 analyses per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'You have reached your hourly limit for AI closet analysis.',
  },

  // General API endpoints
  CLOSET_UPLOAD: {
    maxRequests: 50, // 50 uploads per day
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    message: 'You have reached your daily upload limit.',
  },
  EVENT_CREATE: {
    maxRequests: 100, // 100 events per day
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Weather API (to avoid hitting external API limits)
  WEATHER_API: {
    maxRequests: 100, // 100 requests per hour
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Check user's current usage across all AI endpoints
 * Useful for displaying quota information in the UI
 */
export async function getUserUsageStats(userId: string) {
  try {
    const rateLimitsSnapshot = await adminFirestore
      .collection('rate_limits')
      .where('__name__', '>=', `${userId}_`)
      .where('__name__', '<', `${userId}_\uf8ff`)
      .get();

    const usage: Record<string, { count: number; limit: number; resetAt: number }> = {};

    rateLimitsSnapshot.forEach((doc) => {
      const endpoint = doc.id.replace(`${userId}_`, '');
      const data = doc.data() as RateLimitRecord;

      // Find the limit config for this endpoint
      let limit = 0;
      if (endpoint === 'recommendations') limit = RATE_LIMITS.AI_RECOMMENDATIONS.maxRequests;
      else if (endpoint === 'closet_analysis') limit = RATE_LIMITS.AI_CLOSET_ANALYSIS.maxRequests;
      else if (endpoint === 'closet_upload') limit = RATE_LIMITS.CLOSET_UPLOAD.maxRequests;

      usage[endpoint] = {
        count: data.count,
        limit,
        resetAt: data.resetAt,
      };
    });

    return usage;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return {};
  }
}
