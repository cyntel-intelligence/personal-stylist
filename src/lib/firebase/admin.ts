import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Uses Application Default Credentials in production (Cloud Run, Cloud Functions)
// Or service account key from environment variable in development
if (!admin.apps.length) {
  try {
    // For development: You can use a service account key
    // For production: Use Application Default Credentials or set GOOGLE_APPLICATION_CREDENTIALS
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      // Initialize with service account credentials from environment
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      // Initialize with application default credentials
      // This works in Firebase hosting, Cloud Run, Cloud Functions
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin initialized with application default credentials');
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
export const adminStorage = admin.storage();

export default admin;
