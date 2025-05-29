// This file provides reusable hooks for working with media uploads through your backend
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
};

// Helper function to create headers for file upload
const createFileUploadHeaders = () => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Hook to handle media upload for posts and profile pictures
export const useMediaUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload media files to Cloudinary through your backend API
   * @param files - The files to upload
   * @param type - The type of media ('post' or 'profile')
   * @returns The URLs of the uploaded media
   */
  const uploadMedia = async (files: File[], type: 'post' | 'profile'): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      if (type === 'profile') {
        // For profile pictures, we only handle a single file
        formData.append('file', files[0]);
          const response = await fetch(`${API_BASE_URL}/api/v1/users/profile-picture`, {
          method: 'POST',
          headers: createFileUploadHeaders(),
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload profile picture');
        }
        
        const data = await response.json();
        return [data.url];
      } else {
        // For post media, we can handle multiple files
        files.forEach(file => {
          formData.append('files', file);
        });
          const response = await fetch(`${API_BASE_URL}/api/v1/posts/upload-media`, {
          method: 'POST',
          headers: createFileUploadHeaders(),
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload media');
        }
        
        const data = await response.json();
        return data.urls;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete media from Cloudinary through your backend API
   * @param url - The URL of the media to delete
   * @param type - The type of media ('post' or 'profile')
   */
  const deleteMedia = async (url: string, type: 'post' | 'profile'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {      const endpoint = type === 'profile' 
        ? `${API_BASE_URL}/api/v1/users/profile-picture` 
        : `${API_BASE_URL}/api/v1/posts/delete-media`;
        const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: createFileUploadHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${type} media`);
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadMedia, deleteMedia, isLoading, error };
};
