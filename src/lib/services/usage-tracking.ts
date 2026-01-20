import { adminFirestore } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Types of AI operations we track
 */
export enum AIOperationType {
  OUTFIT_RECOMMENDATION = 'outfit_recommendation',
  CLOSET_ANALYSIS = 'closet_analysis',
  STYLE_ADVICE = 'style_advice',
}

/**
 * API usage record structure
 */
export interface APIUsageRecord {
  userId: string;
  operationType: AIOperationType;
  timestamp: Timestamp;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
  model: string;
  success: boolean;
  errorMessage?: string;
  metadata?: {
    eventId?: string;
    itemId?: string;
    requestDuration?: number; // in milliseconds
  };
}

/**
 * Monthly usage summary for a user
 */
export interface MonthlyUsageSummary {
  userId: string;
  month: string; // Format: "YYYY-MM"
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  operationBreakdown: Record<
    AIOperationType,
    {
      count: number;
      tokens: number;
      cost: number;
    }
  >;
  lastUpdated: Timestamp;
}

/**
 * Cost estimates per 1M tokens (as of Jan 2025)
 * Update these if Anthropic changes pricing
 */
const TOKEN_COSTS = {
  'claude-3-5-sonnet-20241022': {
    input: 3.0, // $3 per 1M input tokens
    output: 15.0, // $15 per 1M output tokens
  },
  'claude-3-5-haiku-20241022': {
    input: 0.8, // $0.8 per 1M input tokens
    output: 4.0, // $4 per 1M output tokens
  },
} as const;

/**
 * Calculate estimated cost for token usage
 */
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const costs = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] || TOKEN_COSTS['claude-3-5-sonnet-20241022'];

  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;

  return inputCost + outputCost;
}

/**
 * Track an API call in Firestore
 */
export async function trackAPIUsage(
  userId: string,
  operationType: AIOperationType,
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  },
  success: boolean,
  metadata?: APIUsageRecord['metadata'],
  errorMessage?: string
): Promise<void> {
  try {
    const totalTokens = tokenUsage.inputTokens + tokenUsage.outputTokens;
    const estimatedCost = calculateCost(
      tokenUsage.inputTokens,
      tokenUsage.outputTokens,
      tokenUsage.model
    );

    const usageRecord: any = {
      userId,
      operationType,
      timestamp: Timestamp.now(),
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      totalTokens,
      estimatedCost,
      model: tokenUsage.model,
      success,
    };

    // Only add optional fields if they have values
    if (errorMessage !== undefined) {
      usageRecord.errorMessage = errorMessage;
    }
    if (metadata !== undefined && Object.keys(metadata).length > 0) {
      usageRecord.metadata = metadata;
    }

    // Store detailed usage record
    await adminFirestore.collection('api_usage').add(usageRecord);

    // Update monthly summary atomically
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const summaryRef = adminFirestore.collection('monthly_usage').doc(`${userId}_${monthKey}`);

    await adminFirestore.runTransaction(async (transaction) => {
      const summaryDoc = await transaction.get(summaryRef);

      if (!summaryDoc.exists) {
        // Create new monthly summary
        const newSummary: MonthlyUsageSummary = {
          userId,
          month: monthKey,
          totalRequests: 1,
          successfulRequests: success ? 1 : 0,
          failedRequests: success ? 0 : 1,
          totalInputTokens: tokenUsage.inputTokens,
          totalOutputTokens: tokenUsage.outputTokens,
          totalTokens,
          estimatedCost,
          operationBreakdown: {
            [operationType]: {
              count: 1,
              tokens: totalTokens,
              cost: estimatedCost,
            },
          } as any,
          lastUpdated: Timestamp.now(),
        };
        transaction.set(summaryRef, newSummary);
      } else {
        // Update existing summary
        const currentData = summaryDoc.data() as MonthlyUsageSummary;
        const operationBreakdown = currentData.operationBreakdown || {};
        const currentOp = operationBreakdown[operationType] || { count: 0, tokens: 0, cost: 0 };

        transaction.update(summaryRef, {
          totalRequests: FieldValue.increment(1),
          successfulRequests: success ? FieldValue.increment(1) : currentData.successfulRequests,
          failedRequests: !success ? FieldValue.increment(1) : currentData.failedRequests,
          totalInputTokens: FieldValue.increment(tokenUsage.inputTokens),
          totalOutputTokens: FieldValue.increment(tokenUsage.outputTokens),
          totalTokens: FieldValue.increment(totalTokens),
          estimatedCost: FieldValue.increment(estimatedCost),
          [`operationBreakdown.${operationType}`]: {
            count: currentOp.count + 1,
            tokens: currentOp.tokens + totalTokens,
            cost: currentOp.cost + estimatedCost,
          },
          lastUpdated: Timestamp.now(),
        });
      }
    });

    console.log(`Tracked API usage for user ${userId}: ${operationType}, cost: $${estimatedCost.toFixed(4)}`);
  } catch (error) {
    console.error('Error tracking API usage:', error);
    // Don't throw - tracking failures shouldn't break the main flow
  }
}

/**
 * Get user's current month usage summary
 */
export async function getCurrentMonthUsage(userId: string): Promise<MonthlyUsageSummary | null> {
  try {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const summaryRef = adminFirestore.collection('monthly_usage').doc(`${userId}_${monthKey}`);

    const doc = await summaryRef.get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as MonthlyUsageSummary;
  } catch (error) {
    console.error('Error fetching monthly usage:', error);
    return null;
  }
}

/**
 * Check if user has exceeded cost threshold
 */
export async function checkCostThreshold(
  userId: string,
  thresholdUSD: number = 10.0
): Promise<{ exceeded: boolean; currentCost: number; threshold: number }> {
  try {
    const usage = await getCurrentMonthUsage(userId);

    if (!usage) {
      return { exceeded: false, currentCost: 0, threshold: thresholdUSD };
    }

    return {
      exceeded: usage.estimatedCost >= thresholdUSD,
      currentCost: usage.estimatedCost,
      threshold: thresholdUSD,
    };
  } catch (error) {
    console.error('Error checking cost threshold:', error);
    return { exceeded: false, currentCost: 0, threshold: thresholdUSD };
  }
}

/**
 * Get detailed usage history for a user
 */
export async function getUserUsageHistory(
  userId: string,
  limit: number = 50
): Promise<APIUsageRecord[]> {
  try {
    const snapshot = await adminFirestore
      .collection('api_usage')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as APIUsageRecord);
  } catch (error) {
    console.error('Error fetching usage history:', error);
    return [];
  }
}
