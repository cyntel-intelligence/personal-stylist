import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken;
}

/**
 * Middleware to verify Firebase ID token from Authorization header
 * Usage in API routes:
 *
 * const authResult = await verifyAuth(request);
 * if (authResult.error) return authResult.error;
 * const userId = authResult.user.uid;
 */
export async function verifyAuth(
  request: NextRequest
): Promise<{ user: DecodedIdToken; error?: never } | { error: NextResponse; user?: never }> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
          { status: 401 }
        ),
      };
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'No token provided' },
          { status: 401 }
        ),
      };
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    return { user: decodedToken };
  } catch (error: any) {
    console.error('Auth verification error:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Token has expired' },
          { status: 401 }
        ),
      };
    }

    if (error.code === 'auth/argument-error') {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid token format' },
          { status: 401 }
        ),
      };
    }

    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Token verification failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Verify that the authenticated user owns the resource
 */
export function verifyOwnership(
  authenticatedUserId: string,
  resourceUserId: string
): { error?: NextResponse } {
  if (authenticatedUserId !== resourceUserId) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this resource' },
        { status: 403 }
      ),
    };
  }
  return {};
}
