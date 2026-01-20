import { z } from 'zod';

/**
 * Validation schemas for API requests and data models
 * Using Zod for runtime type checking and validation
 */

// ============================================================================
// User Profile Schemas
// ============================================================================

export const SizesSchema = z.object({
  tops: z.string().min(1).max(10),
  bottoms: z.number().int().min(0).max(50),
  dresses: z.number().int().min(0).max(30),
  shoes: z.number().min(0).max(20),
  bras: z.string().optional(),
});

export const ColorPreferencesSchema = z.object({
  favoriteColors: z.array(z.string()).max(10),
  avoidColors: z.array(z.string()).max(10),
});

export const StyleDNASchema = z.object({
  styleWords: z.array(z.string().max(50)).min(1).max(10),
  neverAgainList: z.array(z.string().max(100)).max(20),
  inspirationImages: z.array(z.string().url()).max(10),
});

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1).max(100).optional(),
  photoURL: z.string().url().optional(),
  profile: z.object({
    height: z.number().int().min(48).max(96), // inches: 4ft to 8ft
    sizes: SizesSchema,
    budget: z.enum(['low', 'medium', 'high', 'luxury']),
    colorPreferences: ColorPreferencesSchema,
    styleDNA: StyleDNASchema,
  }),
  onboardingCompleted: z.boolean(),
  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(), // Firestore Timestamp
});

// ============================================================================
// Event Schemas
// ============================================================================

export const LocationSchema = z.object({
  city: z.string().min(1).max(100),
  state: z.string().length(2).regex(/^[A-Z]{2}$/),
  country: z.string().min(2).max(2).default('US'),
  zipCode: z.string().optional(),
});

export const WeatherDataSchema = z.object({
  temperature: z.number(),
  condition: z.string(),
  humidity: z.number().optional(),
  windSpeed: z.number().optional(),
  precipitation: z.number().optional(),
});

export const CreateEventSchema = z.object({
  userId: z.string().min(1),
  eventType: z.string().min(1).max(50),
  dateTime: z.date().or(z.string().datetime()),
  location: LocationSchema,
  dressCodes: z.array(z.string()).max(10),
  activities: z.array(z.string()).max(20),
  weatherData: WeatherDataSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial().omit({ userId: true });

// ============================================================================
// Closet Item Schemas
// ============================================================================

export const ClosetCategorySchema = z.enum([
  'dress',
  'shoes',
  'bag',
  'outerwear',
  'jewelry',
]);

export const AIAnalysisSchema = z.object({
  category: z.string().optional(),
  colors: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  style: z.array(z.string()).optional(),
  material: z.string().optional(),
  formality: z.enum(['casual', 'business-casual', 'business', 'formal', 'black-tie']).optional(),
  seasonality: z.array(z.enum(['spring', 'summer', 'fall', 'winter'])).optional(),
  occasion: z.array(z.string()).optional(),
});

export const CreateClosetItemSchema = z.object({
  userId: z.string().min(1),
  category: ClosetCategorySchema,
  imageUrl: z.string().url(),
  brand: z.string().max(100).optional(),
  price: z.number().min(0).optional(),
  purchaseDate: z.date().or(z.string()).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  aiAnalysis: AIAnalysisSchema.optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateClosetItemSchema = CreateClosetItemSchema.partial().omit({ userId: true });

// ============================================================================
// Recommendation Schemas
// ============================================================================

export const OutfitItemSchema = z.object({
  itemId: z.string().min(1),
  category: ClosetCategorySchema,
  imageUrl: z.string().url(),
  reasoning: z.string().max(500).optional(),
});

export const AIReasoningSchema = z.object({
  weatherConsideration: z.string().max(500),
  styleAlignment: z.string().max(500),
  occasionMatch: z.string().max(500),
  confidenceScore: z.number().min(0).max(100),
});

export const CreateRecommendationSchema = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
  outfitItems: z.array(OutfitItemSchema).min(1).max(10),
  aiReasoning: AIReasoningSchema,
  alternatives: z.array(z.string()).max(10).optional(),
});

// ============================================================================
// API Request Schemas
// ============================================================================

export const GenerateRecommendationRequestSchema = z.object({
  eventId: z.string().min(1),
  userId: z.string().min(1),
  preferences: z
    .object({
      excludeItems: z.array(z.string()).optional(),
      prioritizeComfort: z.boolean().optional(),
      includeAccessories: z.boolean().optional(),
    })
    .optional(),
});

export const AnalyzeClosetItemRequestSchema = z.object({
  userId: z.string().min(1),
  imageUrl: z.string().url(),
  category: ClosetCategorySchema.optional(),
});

export const FeedbackSchema = z.object({
  userId: z.string().min(1),
  recommendationId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  liked: z.array(z.string()).optional(),
  disliked: z.array(z.string()).optional(),
  comments: z.string().max(1000).optional(),
});

// ============================================================================
// Image Upload Schemas
// ============================================================================

export const ImageUploadSchema = z.object({
  file: z.any(), // File object from multipart form
  userId: z.string().min(1),
  category: ClosetCategorySchema,
});

// Validation for image file properties
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' };
  }

  // Check file name length
  if (file.name.length > 200) {
    return { valid: false, error: 'File name is too long' };
  }

  // Basic check for file extension match with MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
}

// ============================================================================
// Sanitization Utilities
// ============================================================================

/**
 * Sanitize user input to prevent prompt injection attacks
 */
export function sanitizeUserInput(input: string | undefined | null): string {
  // Handle undefined, null, or empty string
  if (!input) return '';

  // Remove or escape characters that could be used for prompt injection
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\{|\}/g, '') // Remove curly braces
    .replace(/\[|\]/g, '') // Remove square brackets
    .replace(/\\n/g, ' ') // Replace escaped newlines with spaces
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize array of strings (e.g., style words, tags)
 */
export function sanitizeStringArray(arr: string[]): string[] {
  return arr.map(sanitizeUserInput).filter((s) => s.length > 0);
}

/**
 * Validate and sanitize URL to prevent SSRF attacks
 */
export function validateFirebaseStorageUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);

    // Must be HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS protocol' };
    }

    // Must be from Firebase Storage
    if (!parsedUrl.hostname.includes('firebasestorage.googleapis.com')) {
      return { valid: false, error: 'URL must be from Firebase Storage' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
