
import { createAuthHeaders } from './AuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Interface for PostMedia entity
export interface PostMedia {
  id: number;
  postId: number;
  mediaId: number;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  mediaUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  displayOrder: number;
  caption?: string;
  altText?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostMediaCreateRequest {
  postId: number;
  mediaFile: File;
  displayOrder?: number;
  caption?: string;
  altText?: string;
}

export interface PostMediaUpdateRequest {
  displayOrder?: number;
  caption?: string;
  altText?: string;
  isActive?: boolean;
}

export interface PostMediaListResponse {
  media: PostMedia[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class PostMediaService {
  private baseURL = `${API_BASE_URL}/api/v1/post-media`;

  /**
   * Add media to a post
   */
  async addMediaToPost(request: PostMediaCreateRequest): Promise<PostMedia> {
    try {
      const formData = new FormData();
      formData.append('postId', request.postId.toString());
      formData.append('mediaFile', request.mediaFile);
      
      if (request.displayOrder !== undefined) {
        formData.append('displayOrder', request.displayOrder.toString());
      }
      if (request.caption) {
        formData.append('caption', request.caption);
      }
      if (request.altText) {
        formData.append('altText', request.altText);
      }

      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add media to post: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding media to post:', error);
      throw error;
    }
  }

  /**
   * Add multiple media files to a post
   */
  async addMultipleMediaToPost(postId: number, files: File[], captions?: string[]): Promise<PostMedia[]> {
    try {
      const promises = files.map((file, index) => {
        const request: PostMediaCreateRequest = {
          postId,
          mediaFile: file,
          displayOrder: index,
          caption: captions?.[index],
        };
        return this.addMediaToPost(request);
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error adding multiple media to post:', error);
      throw error;
    }
  }

  /**
   * Get all media for a post
   */
  async getPostMedia(postId: number, page: number = 0, size: number = 20): Promise<PostMediaListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/post/${postId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get post media: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting post media:', error);
      throw error;
    }
  }

  /**
   * Get media by ID
   */
  async getMediaById(mediaId: number): Promise<PostMedia> {
    try {
      const response = await fetch(`${this.baseURL}/${mediaId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get media: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting media by ID:', error);
      throw error;
    }
  }

  /**
   * Update media details
   */
  async updateMedia(mediaId: number, request: PostMediaUpdateRequest): Promise<PostMedia> {
    try {
      const response = await fetch(`${this.baseURL}/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update media: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating media:', error);
      throw error;
    }
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${mediaId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete media: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }

  /**
   * Reorder media in a post
   */
  async reorderPostMedia(postId: number, mediaOrders: { mediaId: number; displayOrder: number }[]): Promise<PostMedia[]> {
    try {
      const response = await fetch(`${this.baseURL}/post/${postId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify({ mediaOrders }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to reorder media: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reordering media:', error);
      throw error;
    }
  }

  /**
   * Get media by type for a post
   */
  async getPostMediaByType(postId: number, mediaType: string): Promise<PostMedia[]> {
    try {
      const response = await fetch(`${this.baseURL}/post/${postId}/type/${mediaType}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get media by type: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting media by type:', error);
      throw error;
    }
  }

  /**
   * Get total media count for a post
   */
  async getPostMediaCount(postId: number): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/post/${postId}/count`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get media count: ${response.status}`);
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Error getting media count:', error);
      throw error;
    }
  }

  /**
   * Activate/deactivate media
   */
  async toggleMediaStatus(mediaId: number, isActive: boolean): Promise<PostMedia> {
    try {
      return await this.updateMedia(mediaId, { isActive });
    } catch (error) {
      console.error('Error toggling media status:', error);
      throw error;
    }
  }

  /**
   * Validate media file
   */
  validateMediaFile(file: File): string[] {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
    ];

    if (!file) {
      errors.push('File is required');
      return errors;
    }

    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    return errors;
  }

  /**
   * Get media type from file
   */
  getMediaTypeFromFile(file: File): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' {
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('image/')) {
      return 'IMAGE';
    } else if (mimeType.startsWith('video/')) {
      return 'VIDEO';
    } else if (mimeType.startsWith('audio/')) {
      return 'AUDIO';
    } else {
      return 'DOCUMENT';
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file is image
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Check if file is video
   */
  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  /**
   * Check if file is audio
   */
  isAudioFile(file: File): boolean {
    return file.type.startsWith('audio/');
  }

  /**
   * Generate thumbnail URL for media
   */
  generateThumbnailUrl(media: PostMedia): string {
    if (media.thumbnailUrl) {
      return media.thumbnailUrl;
    }
    
    // Return placeholder thumbnail based on media type
    switch (media.mediaType) {
      case 'VIDEO':
        return '/images/video-thumbnail.png';
      case 'AUDIO':
        return '/images/audio-thumbnail.png';
      case 'DOCUMENT':
        return '/images/document-thumbnail.png';
      default:
        return media.mediaUrl;
    }
  }

  /**
   * Sort media by display order
   */
  sortMediaByOrder(media: PostMedia[]): PostMedia[] {
    return [...media].sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

export default new PostMediaService();
