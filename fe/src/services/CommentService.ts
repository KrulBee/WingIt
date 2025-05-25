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

interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  user?: User;
  content: string;
  createdDate: string;
  updatedDate?: string;
  replies?: CommentReply[];
}

interface CommentReply {
  id: number;
  commentId: number;
  userId: number;
  user?: User;
  content: string;
  createdDate: string;
  updatedDate?: string;
}

interface CreateCommentRequest {
  content: string;
}

interface CreateCommentData {
  postId: number;
  content: string;
}

interface UpdateCommentData {
  content: string;
}

interface CreateCommentReplyData {
  commentId: number;
  content: string;
}

const CommentService = {
  getCommentsByPostId: async (postId: number): Promise<Comment[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comments/post/${postId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return await response.json();
    } catch (error) {
      console.error('Get comments error:', error);
      throw error;
    }
  },

  createComment: async (commentData: CreateCommentData): Promise<Comment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comments`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return await response.json();
    } catch (error) {
      console.error('Create comment error:', error);
      throw error;
    }
  },

  updateComment: async (commentId: number, commentData: UpdateCommentData): Promise<Comment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comments/${commentId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error('Failed to update comment');
      return await response.json();
    } catch (error) {
      console.error('Update comment error:', error);
      throw error;
    }
  },

  deleteComment: async (commentId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comments/${commentId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete comment');
    } catch (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  },

  // Comment Replies
  getRepliesByCommentId: async (commentId: number): Promise<CommentReply[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-replies/comment/${commentId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch replies');
      return await response.json();
    } catch (error) {
      console.error('Get replies error:', error);
      throw error;
    }
  },

  createCommentReply: async (replyData: CreateCommentReplyData): Promise<CommentReply> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-replies`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(replyData),
      });
      if (!response.ok) throw new Error('Failed to create reply');
      return await response.json();
    } catch (error) {
      console.error('Create reply error:', error);
      throw error;
    }
  },

  updateCommentReply: async (replyId: number, replyData: UpdateCommentData): Promise<CommentReply> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-replies/${replyId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(replyData),
      });
      if (!response.ok) throw new Error('Failed to update reply');
      return await response.json();
    } catch (error) {
      console.error('Update reply error:', error);
      throw error;
    }
  },

  deleteCommentReply: async (replyId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/comment-replies/${replyId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete reply');
    } catch (error) {
      console.error('Delete reply error:', error);
      throw error;
    }
  },
};

export default CommentService;
