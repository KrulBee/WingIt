"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
};

// Helper function to create headers with auth
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
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

// TypeScript interfaces
interface MediaUploadResponse {
  url: string;
}

interface MediaDeleteResponse {
  message: string;
}

export type MediaType = 'post' | 'profile' | 'chat' | 'comment';

const MediaService = {
  // Upload media file
  uploadMedia: async (file: File, type: MediaType = 'post'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: createFileUploadHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload media: ${errorText}`);
      }

      const result: MediaUploadResponse = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload media error:', error);
      throw error;
    }
  },

  // Delete media file
  deleteMedia: async (url: string): Promise<MediaDeleteResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media/delete?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete media: ${errorText}`);
      }

      const result: MediaDeleteResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    }
  },

  // Upload multiple media files
  uploadMultipleMedia: async (files: File[], type: MediaType = 'post'): Promise<string[]> => {
    try {
      const uploadPromises = files.map(file => MediaService.uploadMedia(file, type));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Upload multiple media error:', error);
      throw error;
    }
  },

  // Delete multiple media files
  deleteMultipleMedia: async (urls: string[]): Promise<MediaDeleteResponse[]> => {
    try {
      const deletePromises = urls.map(url => MediaService.deleteMedia(url));
      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      console.error('Delete multiple media error:', error);
      throw error;
    }
  },

  // Validate file before upload
  validateFile: (file: File, maxSizeMB: number = 10, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']): boolean => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return true;
  },

  // Get file extension from URL
  getFileExtension: (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      return lastDot !== -1 ? pathname.substring(lastDot + 1) : '';
    } catch (error) {
      console.error('Get file extension error:', error);
      return '';
    }
  },

  // Check if URL is an image
  isImageUrl: (url: string): boolean => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = MediaService.getFileExtension(url).toLowerCase();
    return imageExtensions.includes(extension);
  },

  // Check if URL is a video
  isVideoUrl: (url: string): boolean => {
    if (!url) return false;

    const videoExtensions = ['mp4', 'webm', 'avi', 'mov', 'wmv', 'flv', 'ogg'];
    const extension = MediaService.getFileExtension(url).toLowerCase();

    // Check file extension
    if (videoExtensions.includes(extension)) {
      return true;
    }

    // Check Cloudinary video URLs (they often contain 'video' in the path)
    const urlLower = url.toLowerCase();
    if (urlLower.includes('cloudinary') && urlLower.includes('/video/')) {
      return true;
    }

    // Check for video MIME types in URL parameters
    if (urlLower.includes('video/')) {
      return true;
    }

    return false;
  },

  // Generate thumbnail URL for Cloudinary images
  generateThumbnailUrl: (url: string, width: number = 150, height: number = 150): string => {
    try {
      // Check if it's a Cloudinary URL
      if (url.includes('cloudinary.com')) {
        // Insert transformation parameters
        const transformationParams = `w_${width},h_${height},c_fill`;
        return url.replace('/upload/', `/upload/${transformationParams}/`);
      }
      // Return original URL if not Cloudinary
      return url;
    } catch (error) {
      console.error('Generate thumbnail URL error:', error);
      return url;
    }
  },
};

export default MediaService;
