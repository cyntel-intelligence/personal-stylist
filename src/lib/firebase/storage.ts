import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadResult,
} from "firebase/storage";
import { storage } from "./config";

// Helper to check if Storage is configured
function ensureStorage() {
  if (!storage) {
    throw new Error("Firebase Storage is not configured. Please add your Firebase credentials to .env.local");
  }
  return storage;
}

export const storageService = {
  /**
   * Upload a file to Firebase Storage
   * @param file - The file to upload
   * @param path - The storage path (e.g., "images/userId/category/filename")
   * @returns The download URL of the uploaded file
   */
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(ensureStorage(), path);
      const snapshot: UploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  /**
   * Upload a Blob to Firebase Storage
   * @param blob - The blob to upload
   * @param path - The storage path
   * @returns The download URL
   */
  async uploadBlob(blob: Blob, path: string): Promise<string> {
    try {
      const storageRef = ref(ensureStorage(), path);
      const snapshot: UploadResult = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading blob:", error);
      throw error;
    }
  },

  /**
   * Get the download URL for a file
   * @param path - The storage path
   * @returns The download URL
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(ensureStorage(), path);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error getting download URL:", error);
      throw error;
    }
  },

  /**
   * Delete a file from Firebase Storage
   * @param path - The storage path
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(ensureStorage(), path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  /**
   * List all files in a directory
   * @param path - The directory path
   * @returns Array of file paths
   */
  async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(ensureStorage(), path);
      const result = await listAll(storageRef);
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          return await getDownloadURL(itemRef);
        })
      );
      return files;
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  },

  /**
   * Upload multiple image versions (original, thumbnail, optimized)
   * This is a client-side function that creates the images and uploads them
   */
  async uploadImageVersions(
    file: File,
    userId: string,
    category: string
  ): Promise<{
    original: string;
    thumbnail: string;
    optimized: string;
  }> {
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const basePath = `images/${userId}/${category}`;

      // Upload original
      const originalPath = `${basePath}/${filename}`;
      const originalUrl = await this.uploadFile(file, originalPath);

      // Create and upload thumbnail (handled client-side)
      const thumbnail = await this.createThumbnail(file, 600, 600);
      const thumbnailPath = `${basePath}/thumbnails/${filename}`;
      const thumbnailUrl = await this.uploadBlob(thumbnail, thumbnailPath);

      // Create and upload optimized version for AI
      const optimized = await this.createOptimized(file, 1024, 1024);
      const optimizedPath = `${basePath}/optimized/${filename}`;
      const optimizedUrl = await this.uploadBlob(optimized, optimizedPath);

      return {
        original: originalUrl,
        thumbnail: thumbnailUrl,
        optimized: optimizedUrl,
      };
    } catch (error) {
      console.error("Error uploading image versions:", error);
      throw error;
    }
  },

  /**
   * Create a thumbnail from an image file
   */
  async createThumbnail(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Calculate dimensions
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create thumbnail"));
            }
          },
          "image/jpeg",
          0.8
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Create an optimized version of the image
   */
  async createOptimized(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return this.createThumbnail(file, maxWidth, maxHeight);
  },

  /**
   * Generate a storage path for a user's image
   */
  generateImagePath(userId: string, category: string, filename?: string): string {
    const timestamp = Date.now();
    const fname = filename || `${timestamp}.jpg`;
    return `images/${userId}/${category}/${fname}`;
  },
};
