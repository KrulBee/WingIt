
import { createAuthHeaders } from './AuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Interface for CommentReply entity
export interface CommentReply {
  id: number;
  commentId: number;
  parentReplyId?: number;
  userId: number;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
  };
  parentReply?: CommentReply;
  childReplies?: CommentReply[];
  replyCount?: number;
  userReaction?: {
    id: number;
    reactionType: string;
  };
  reactionCounts?: {
    [key: string]: number;
  };
}

export interface CommentReplyCreateRequest {
  commentId: number;
  parentReplyId?: number;
  content: string;
}

export interface CommentReplyUpdateRequest {
  content?: string;
  isActive?: boolean;
}

export interface CommentReplyListResponse {
  replies: CommentReply[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class CommentReplyService {
  private baseURL = `${API_BASE_URL}/api/v1/comment-replies`;

  /**
   * Create a new reply to a comment
   */
  async createReply(request: CommentReplyCreateRequest): Promise<CommentReply> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create reply: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating reply:', error);
      throw error;
    }
  }

  /**
   * Get replies for a comment
   */
  async getCommentReplies(commentId: number, page: number = 0, size: number = 20): Promise<CommentReplyListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/comment/${commentId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get comment replies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting comment replies:', error);
      throw error;
    }
  }

  /**
   * Get replies to a specific reply (nested replies)
   */
  async getReplyReplies(parentReplyId: number, page: number = 0, size: number = 20): Promise<CommentReplyListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/reply/${parentReplyId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get reply replies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting reply replies:', error);
      throw error;
    }
  }

  /**
   * Get reply by ID
   */
  async getReplyById(replyId: number): Promise<CommentReply> {
    try {
      const response = await fetch(`${this.baseURL}/${replyId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get reply: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting reply by ID:', error);
      throw error;
    }
  }

  /**
   * Update a reply
   */
  async updateReply(replyId: number, request: CommentReplyUpdateRequest): Promise<CommentReply> {
    try {
      const response = await fetch(`${this.baseURL}/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update reply: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating reply:', error);
      throw error;
    }
  }

  /**
   * Delete a reply
   */
  async deleteReply(replyId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${replyId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete reply: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }

  /**
   * Get replies by user
   */
  async getRepliesByUser(userId: number, page: number = 0, size: number = 20): Promise<CommentReplyListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/user/${userId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get user replies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user replies:', error);
      throw error;
    }
  }

  /**
   * Get reply count for a comment
   */
  async getCommentReplyCount(commentId: number): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/comment/${commentId}/count`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get reply count: ${response.status}`);
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Error getting reply count:', error);
      throw error;
    }
  }

  /**
   * Get nested reply count for a reply
   */
  async getNestedReplyCount(parentReplyId: number): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/reply/${parentReplyId}/count`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get nested reply count: ${response.status}`);
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Error getting nested reply count:', error);
      throw error;
    }
  }

  /**
   * Toggle reply status (active/inactive)
   */
  async toggleReplyStatus(replyId: number): Promise<CommentReply> {
    try {
      const reply = await this.getReplyById(replyId);
      return await this.updateReply(replyId, { isActive: !reply.isActive });
    } catch (error) {
      console.error('Error toggling reply status:', error);
      throw error;
    }
  }

  /**
   * Search replies by content
   */
  async searchReplies(query: string, page: number = 0, size: number = 20): Promise<CommentReplyListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to search replies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching replies:', error);
      throw error;
    }
  }

  /**
   * Get recent replies
   */
  async getRecentReplies(page: number = 0, size: number = 20): Promise<CommentReplyListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/recent?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get recent replies: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recent replies:', error);
      throw error;
    }
  }

  /**
   * Validate reply content
   */
  validateReplyContent(content: string): string[] {
    const errors: string[] = [];
    
    if (!content || content.trim().length === 0) {
      errors.push('Reply content is required');
    }
    
    if (content.length > 1000) {
      errors.push('Reply content must be less than 1000 characters');
    }
    
    if (content.trim().length < 1) {
      errors.push('Reply content cannot be empty');
    }
    
    return errors;
  }

  /**
   * Validate reply creation request
   */
  validateCreateRequest(request: CommentReplyCreateRequest): string[] {
    const errors: string[] = [];
    
    if (!request.commentId || request.commentId <= 0) {
      errors.push('Valid comment ID is required');
    }
    
    if (request.parentReplyId !== undefined && request.parentReplyId <= 0) {
      errors.push('Valid parent reply ID is required if provided');
    }
    
    errors.push(...this.validateReplyContent(request.content));
    
    return errors;
  }

  /**
   * Format reply for display
   */
  formatReplyForDisplay(reply: CommentReply): string {
    const user = reply.user?.username || 'Unknown User';
    const date = new Date(reply.createdAt).toLocaleDateString();
    const preview = reply.content.length > 50 ? 
      reply.content.substring(0, 50) + '...' : 
      reply.content;
    
    return `${user} replied on ${date}: ${preview}`;
  }

  /**
   * Get reply depth level
   */
  getReplyDepth(reply: CommentReply): number {
    let depth = 0;
    let current = reply.parentReply;
    
    while (current) {
      depth++;
      current = current.parentReply;
    }
    
    return depth;
  }

  /**
   * Check if user can reply to comment
   */
  canReplyToComment(commentId: number): boolean {
    // Add business logic here
    return commentId > 0;
  }

  /**
   * Check if user can edit reply
   */
  canEditReply(reply: CommentReply, currentUserId: number): boolean {
    return reply.userId === currentUserId && reply.isActive;
  }

  /**
   * Check if user can delete reply
   */
  canDeleteReply(reply: CommentReply, currentUserId: number): boolean {
    return reply.userId === currentUserId;
  }

  /**
   * Build reply tree structure
   */
  buildReplyTree(replies: CommentReply[]): CommentReply[] {
    const replyMap = new Map<number, CommentReply>();
    const rootReplies: CommentReply[] = [];

    // First pass: create map of all replies
    replies.forEach(reply => {
      replyMap.set(reply.id, { ...reply, childReplies: [] });
    });

    // Second pass: build tree structure
    replies.forEach(reply => {
      const replyNode = replyMap.get(reply.id)!;
      
      if (reply.parentReplyId) {
        const parent = replyMap.get(reply.parentReplyId);
        if (parent) {
          parent.childReplies = parent.childReplies || [];
          parent.childReplies.push(replyNode);
        }
      } else {
        rootReplies.push(replyNode);
      }
    });

    return rootReplies;
  }
}

export default new CommentReplyService();
