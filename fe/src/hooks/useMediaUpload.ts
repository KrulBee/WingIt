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
   * @param type - The type of media ('post', 'profile', or 'cover')
   * @returns The URLs of the uploaded media
   */
  const uploadMedia = async (files: File[], type: 'post' | 'profile' | 'cover'): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file sizes before upload (50MB limit)
      const maxFileSize = 50 * 1024 * 1024; // 50MB

      for (const file of files) {
        const fileSizeMB = Math.round(file.size / 1024 / 1024);

        if (file.size > maxFileSize) {
          if (file.type.startsWith('video/')) {
            throw new Error(`Video "${file.name}" quá lớn (${fileSizeMB}MB). Hãy gửi video dưới 50MB.`);
          } else {
            throw new Error(`Ảnh "${file.name}" quá lớn (${fileSizeMB}MB). Hãy gửi ảnh dưới 50MB.`);
          }
        }
      }
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
      } else if (type === 'cover') {
        // For cover photos, we only handle a single file
        formData.append('file', files[0]);
        const response = await fetch(`${API_BASE_URL}/api/v1/users/cover-photo`, {
          method: 'POST',
          headers: createFileUploadHeaders(),
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload cover photo');
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
      // Enhanced Vietnamese error messages
      let errorMessage = 'Đã xảy ra lỗi trong quá trình tải lên';

      if (err.message?.includes('quá lớn')) {
        // File size error - use the specific message
        errorMessage = err.message;
      } else if (err.message?.includes('413') || err.message?.includes('Payload Too Large')) {
        errorMessage = 'File quá lớn! Hãy gửi video dưới 50MB.';
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_CONNECTION_RESET')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.';
      }

      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete media from Cloudinary through your backend API
   * @param url - The URL of the media to delete
   * @param type - The type of media ('post', 'profile', or 'cover')
   */
  const deleteMedia = async (url: string, type: 'post' | 'profile' | 'cover'): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint: string;
      if (type === 'profile') {
        endpoint = `${API_BASE_URL}/api/v1/users/profile-picture`;
      } else if (type === 'cover') {
        endpoint = `${API_BASE_URL}/api/v1/users/cover-photo`;
      } else {
        endpoint = `${API_BASE_URL}/api/v1/posts/delete-media`;
      }
      
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
