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

interface MediaUploadResponse {
  urls: string[];
}

interface CreatePostRequest {
  content: string;
  mediaUrls?: string[];
  typeId?: number;
  locationId?: number;
}

interface PostData {
  id: number;
  content: string;
  createdDate: string;
  updatedAt?: string;
  viewCount?: number;
  author: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
    bio?: string;
  };
  type?: {
    id: number;
    typeName: string;
  };
  location?: {
    id: number;
    location: string;
  };
  media?: Array<{
    id: number;
    mediaUrl: string;
    mediaType: string;
  }>;  likesCount: number;
  dislikesCount?: number;
  commentsCount: number;
  liked: boolean;
  disliked?: boolean;
  // Legacy fields for backward compatibility
  userId?: number;
  user?: {
    id: number;
    username: string;
    displayName?: string;
    profilePicture?: string;
  };
  mediaUrls?: string[];
  reactionCount?: number;
  commentCount?: number;
}

const PostService = {
  uploadMedia: async (files: File[]): Promise<MediaUploadResponse> => {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/posts/upload-media`, {
        method: 'POST',
        headers: createFileUploadHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to upload media');
      }

      const result: MediaUploadResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  },

  deleteMedia: async (url: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/delete-media?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Media delete error:', error);
      throw error;
    }
  },
  // Post operations
  getAllPosts: async (): Promise<PostData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const posts: PostData[] = await response.json();
      return posts;
    } catch (error) {
      console.error('Get posts error:', error);
      throw error;
    }
  },

  createPost: async (postData: CreatePostRequest): Promise<PostData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create post');
      }

      const createdPost: PostData = await response.json();
      return createdPost;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  },

  getPostById: async (postId: string | number): Promise<PostData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const post: PostData = await response.json();
      return post;
    } catch (error) {
      console.error('Get post error:', error);
      throw error;
    }
  },

  updatePost: async (postId: string | number, postData: CreatePostRequest): Promise<PostData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update post');
      }

      const updatedPost: PostData = await response.json();
      return updatedPost;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  },

  deletePost: async (postId: string | number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },

  getPostsByUserId: async (userId: number): Promise<PostData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user posts');
      }

      const posts: PostData[] = await response.json();
      return posts;
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  },

  getPostsByLocationId: async (locationId: number): Promise<PostData[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/location/${locationId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts by location');
      }

      const posts: PostData[] = await response.json();
      return posts;
    } catch (error) {
      console.error('Get posts by location error:', error);      throw error;
    }
  },
};

export default PostService;
