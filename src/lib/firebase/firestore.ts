import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import { UserProfile, Event, ClosetItem, Recommendation } from "@/types";

// Helper to check if Firestore is configured
function ensureDb() {
  if (!db) {
    throw new Error("Firebase is not configured. Please add your Firebase credentials to .env.local");
  }
  return db;
}

/**
 * Generic Firestore CRUD operations
 */
export const firestoreService = {
  /**
   * Get a single document by ID
   */
  async getDocument<T = DocumentData>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(ensureDb(), collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }

      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Create or update a document
   */
  async setDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    merge = true
  ): Promise<void> {
    try {
      const docRef = doc(ensureDb(), collectionName, docId);
      await setDoc(docRef, data, { merge });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Update a document
   */
  async updateDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(ensureDb(), collectionName, docId);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(ensureDb(), collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Query documents with filters
   */
  async queryDocuments<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> {
    try {
      const collectionRef = collection(ensureDb(), collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error querying documents from ${collectionName}:`, error);
      throw error;
    }
  },
};

/**
 * User profile specific operations
 */
export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    return firestoreService.getDocument<UserProfile>("users", userId);
  },

  async createProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const profileData = {
      ...data,
      uid: userId,
      onboardingCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await firestoreService.setDocument("users", userId, profileData);
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    await firestoreService.updateDocument("users", userId, data);
  },

  async completeOnboarding(userId: string): Promise<void> {
    await firestoreService.updateDocument("users", userId, {
      onboardingCompleted: true,
    });
  },
};

/**
 * Event specific operations
 */
export const eventService = {
  async getEvent(eventId: string): Promise<Event | null> {
    return firestoreService.getDocument<Event>("events", eventId);
  },

  async getUserEvents(userId: string): Promise<Event[]> {
    return firestoreService.queryDocuments<Event>("events", [
      where("userId", "==", userId),
      orderBy("dateTime", "desc"),
    ]);
  },

  async createEvent(eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const eventRef = doc(collection(ensureDb(), "events"));
    const eventWithTimestamps = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(eventRef, eventWithTimestamps);
    return eventRef.id;
  },

  async updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
    await firestoreService.updateDocument("events", eventId, data);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await firestoreService.deleteDocument("events", eventId);
  },
};

/**
 * Closet item specific operations
 */
export const closetService = {
  async getItem(itemId: string): Promise<ClosetItem | null> {
    return firestoreService.getDocument<ClosetItem>("closet_items", itemId);
  },

  async getUserCloset(userId: string): Promise<ClosetItem[]> {
    return firestoreService.queryDocuments<ClosetItem>("closet_items", [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ]);
  },

  async createItem(itemData: Omit<ClosetItem, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const itemRef = doc(collection(ensureDb(), "closet_items"));
    const itemWithTimestamps = {
      ...itemData,
      wornCount: 0,
      associatedEvents: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(itemRef, itemWithTimestamps);
    return itemRef.id;
  },

  async updateItem(itemId: string, data: Partial<ClosetItem>): Promise<void> {
    await firestoreService.updateDocument("closet_items", itemId, data);
  },

  async deleteItem(itemId: string): Promise<void> {
    await firestoreService.deleteDocument("closet_items", itemId);
  },

  async incrementWornCount(itemId: string): Promise<void> {
    const item = await this.getItem(itemId);
    if (item) {
      await this.updateItem(itemId, {
        wornCount: item.wornCount + 1,
        lastWorn: Timestamp.now(),
      });
    }
  },
};

/**
 * Recommendation specific operations
 */
export const recommendationService = {
  async getRecommendation(recommendationId: string): Promise<Recommendation | null> {
    return firestoreService.getDocument<Recommendation>("recommendations", recommendationId);
  },

  async getEventRecommendations(eventId: string): Promise<Recommendation[]> {
    return firestoreService.queryDocuments<Recommendation>("recommendations", [
      where("eventId", "==", eventId),
      orderBy("aiReasoning.confidenceScore", "desc"),
    ]);
  },

  async createRecommendation(
    recData: Omit<Recommendation, "id" | "createdAt">
  ): Promise<string> {
    const recRef = doc(collection(ensureDb(), "recommendations"));
    const recWithTimestamp = {
      ...recData,
      createdAt: serverTimestamp(),
    };

    await setDoc(recRef, recWithTimestamp);
    return recRef.id;
  },

  async updateRecommendation(
    recommendationId: string,
    data: Partial<Recommendation>
  ): Promise<void> {
    await firestoreService.updateDocument("recommendations", recommendationId, data);
  },

  async saveFeedback(recommendationId: string, feedback: any): Promise<void> {
    await this.updateRecommendation(recommendationId, {
      userFeedback: {
        ...feedback,
        timestamp: serverTimestamp(),
      },
    });
  },
};

// Export Firestore utilities
export { serverTimestamp, Timestamp, where, orderBy, limit };
