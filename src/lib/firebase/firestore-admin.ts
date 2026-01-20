import { adminFirestore } from "./admin";
import { UserProfile, Event, ClosetItem, Recommendation } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Server-side Firestore operations using Firebase Admin SDK
 * Use this in API routes and server-side code
 */

/**
 * Generic Firestore CRUD operations (Admin SDK)
 */
export const firestoreAdminService = {
  /**
   * Get a single document by ID
   */
  async getDocument<T = any>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = adminFirestore.collection(collectionName).doc(docId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
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
  async setDocument<T = any>(
    collectionName: string,
    docId: string,
    data: Partial<T>,
    merge = true
  ): Promise<void> {
    try {
      const docRef = adminFirestore.collection(collectionName).doc(docId);
      await docRef.set(data, { merge });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Update a document
   */
  async updateDocument<T = any>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = adminFirestore.collection(collectionName).doc(docId);
      await docRef.update({ ...data, updatedAt: FieldValue.serverTimestamp() });
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
      const docRef = adminFirestore.collection(collectionName).doc(docId);
      await docRef.delete();
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Query documents with filters
   */
  async queryDocuments<T = any>(
    collectionName: string,
    queryFn?: (ref: FirebaseFirestore.CollectionReference) => FirebaseFirestore.Query
  ): Promise<T[]> {
    try {
      const collectionRef = adminFirestore.collection(collectionName);
      const query = queryFn ? queryFn(collectionRef) : collectionRef;
      const querySnapshot = await query.get();

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
 * User profile specific operations (Admin SDK)
 */
export const userAdminService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    return firestoreAdminService.getDocument<UserProfile>("users", userId);
  },

  async createProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const profileData = {
      ...data,
      uid: userId,
      onboardingCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await firestoreAdminService.setDocument("users", userId, profileData);
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    await firestoreAdminService.updateDocument("users", userId, data);
  },

  async completeOnboarding(userId: string): Promise<void> {
    await firestoreAdminService.updateDocument("users", userId, {
      onboardingCompleted: true,
    });
  },
};

/**
 * Event specific operations (Admin SDK)
 */
export const eventAdminService = {
  async getEvent(eventId: string): Promise<Event | null> {
    return firestoreAdminService.getDocument<Event>("events", eventId);
  },

  async getUserEvents(userId: string): Promise<Event[]> {
    return firestoreAdminService.queryDocuments<Event>("events", (ref) =>
      ref.where("userId", "==", userId).orderBy("dateTime", "desc")
    );
  },

  async createEvent(eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const eventRef = adminFirestore.collection("events").doc();
    const eventWithTimestamps = {
      ...eventData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await eventRef.set(eventWithTimestamps);
    return eventRef.id;
  },

  async updateEvent(eventId: string, data: Partial<Event>): Promise<void> {
    await firestoreAdminService.updateDocument("events", eventId, data);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await firestoreAdminService.deleteDocument("events", eventId);
  },
};

/**
 * Closet item specific operations (Admin SDK)
 */
export const closetAdminService = {
  async getItem(itemId: string): Promise<ClosetItem | null> {
    return firestoreAdminService.getDocument<ClosetItem>("closet_items", itemId);
  },

  async getUserCloset(userId: string): Promise<ClosetItem[]> {
    return firestoreAdminService.queryDocuments<ClosetItem>("closet_items", (ref) =>
      ref.where("userId", "==", userId).orderBy("createdAt", "desc")
    );
  },

  async createItem(itemData: Omit<ClosetItem, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const itemRef = adminFirestore.collection("closet_items").doc();
    const itemWithTimestamps = {
      ...itemData,
      wornCount: 0,
      associatedEvents: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await itemRef.set(itemWithTimestamps);
    return itemRef.id;
  },

  async updateItem(itemId: string, data: Partial<ClosetItem>): Promise<void> {
    await firestoreAdminService.updateDocument("closet_items", itemId, data);
  },

  async deleteItem(itemId: string): Promise<void> {
    await firestoreAdminService.deleteDocument("closet_items", itemId);
  },

  async incrementWornCount(itemId: string): Promise<void> {
    const item = await this.getItem(itemId);
    if (item) {
      await this.updateItem(itemId, {
        wornCount: item.wornCount + 1,
        lastWorn: FieldValue.serverTimestamp() as any,
      });
    }
  },
};

/**
 * Recommendation specific operations (Admin SDK)
 */
export const recommendationAdminService = {
  async getRecommendation(recommendationId: string): Promise<Recommendation | null> {
    return firestoreAdminService.getDocument<Recommendation>("recommendations", recommendationId);
  },

  async getEventRecommendations(eventId: string): Promise<Recommendation[]> {
    return firestoreAdminService.queryDocuments<Recommendation>("recommendations", (ref) =>
      ref.where("eventId", "==", eventId).orderBy("aiReasoning.confidenceScore", "desc")
    );
  },

  async createRecommendation(
    recData: Omit<Recommendation, "id" | "createdAt">
  ): Promise<string> {
    const recRef = adminFirestore.collection("recommendations").doc();
    const recWithTimestamp = {
      ...recData,
      createdAt: FieldValue.serverTimestamp(),
    };

    await recRef.set(recWithTimestamp);
    return recRef.id;
  },

  async updateRecommendation(
    recommendationId: string,
    data: Partial<Recommendation>
  ): Promise<void> {
    await firestoreAdminService.updateDocument("recommendations", recommendationId, data);
  },

  async saveFeedback(recommendationId: string, feedback: any): Promise<void> {
    await this.updateRecommendation(recommendationId, {
      userFeedback: {
        ...feedback,
        timestamp: FieldValue.serverTimestamp(),
      },
    });
  },
};
