import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./config";

// Helper to check if Firebase is configured
function ensureAuth() {
  if (!auth) {
    throw new Error("Firebase is not configured. Please add your Firebase credentials to .env.local");
  }
  return auth;
}

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(ensureAuth(), email, password);

      // Update display name
      await updateProfile(userCredential.user, { displayName });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return userCredential.user;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(error.message || "Failed to create account");
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(ensureAuth(), email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(ensureAuth());
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error(error.message || "Failed to sign out");
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(ensureAuth(), email);
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Failed to send password reset email");
    }
  },

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    if (!auth) return null;
    return auth.currentUser;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (!auth) {
      // Return a no-op unsubscribe function
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!auth) return false;
    return !!auth.currentUser;
  },

  /**
   * Get the current user's ID token
   */
  async getIdToken(): Promise<string | null> {
    if (!auth) return null;
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  },
};

// Error codes mapping for better user messages
export const authErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/operation-not-allowed": "Email/password accounts are not enabled.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Please check your connection.",
};

/**
 * Get a user-friendly error message from Firebase auth error
 */
export function getAuthErrorMessage(error: any): string {
  if (error.code && authErrorMessages[error.code]) {
    return authErrorMessages[error.code];
  }
  return error.message || "An unexpected error occurred. Please try again.";
}
