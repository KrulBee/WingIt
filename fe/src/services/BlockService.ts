
import { createAuthHeaders } from './AuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Interface for Block entity
export interface Block {
  id: number;
  blockerId: number;
  blockedId: number;
  blockerUser?: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
  };
  blockedUser?: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
}

export interface BlockCreateRequest {
  blockedUserId: number;
  reason?: string;
}

export interface BlockListResponse {
  blocks: Block[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class BlockService {
  private baseURL = `${API_BASE_URL}/api/v1/blocks`;

  /**
   * Block a user
   */
  async blockUser(request: BlockCreateRequest): Promise<Block> {
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
        throw new Error(errorData.message || `Failed to block user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${blockId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to unblock user: ${response.status}`);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user by their user ID
   */
  async unblockUserById(blockedUserId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/user/${blockedUserId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to unblock user: ${response.status}`);
      }
    } catch (error) {
      console.error('Error unblocking user by ID:', error);
      throw error;
    }
  }

  /**
   * Get all blocked users for the current user
   */
  async getBlockedUsers(page: number = 0, size: number = 20): Promise<BlockListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/my-blocks?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get blocked users: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }

  /**
   * Get users who have blocked the current user
   */
  async getUsersWhoBlockedMe(page: number = 0, size: number = 20): Promise<BlockListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/blocked-by?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get users who blocked me: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting users who blocked me:', error);
      throw error;
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/is-blocked/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to check if user is blocked: ${response.status}`);
      }

      const result = await response.json();
      return result.isBlocked || false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      throw error;
    }
  }

  /**
   * Check if current user is blocked by another user
   */
  async isBlockedBy(userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/is-blocked-by/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to check if blocked by user: ${response.status}`);
      }

      const result = await response.json();
      return result.isBlockedBy || false;
    } catch (error) {
      console.error('Error checking if blocked by user:', error);
      throw error;
    }
  }

  /**
   * Get block details by ID
   */
  async getBlockById(blockId: number): Promise<Block> {
    try {
      const response = await fetch(`${this.baseURL}/${blockId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get block details: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting block details:', error);
      throw error;
    }
  }

  /**
   * Get block relationship between two users
   */
  async getBlockBetweenUsers(userId1: number, userId2: number): Promise<Block | null> {
    try {
      const response = await fetch(`${this.baseURL}/between/${userId1}/${userId2}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // No block relationship exists
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get block relationship: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting block relationship:', error);
      throw error;
    }
  }

  /**
   * Check if two users have any block relationship
   */
  async hasBlockRelationship(userId1: number, userId2: number): Promise<boolean> {
    try {
      const block = await this.getBlockBetweenUsers(userId1, userId2);
      return block !== null;
    } catch (error) {
      console.error('Error checking block relationship:', error);
      return false;
    }
  }

  /**
   * Get count of blocked users
   */
  async getBlockedUsersCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/my-blocks/count`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get blocked users count: ${response.status}`);
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Error getting blocked users count:', error);
      throw error;
    }
  }

  /**
   * Validate block request
   */
  validateBlockRequest(request: BlockCreateRequest): string[] {
    const errors: string[] = [];

    if (!request.blockedUserId || request.blockedUserId <= 0) {
      errors.push('Valid blocked user ID is required');
    }

    if (request.reason && request.reason.length > 500) {
      errors.push('Reason must be less than 500 characters');
    }

    return errors;
  }

  /**
   * Format block for display
   */  formatBlockForDisplay(block: Block): string {
    const blockedUser = block.blockedUser?.username || 'Người dùng không xác định';
    const date = new Date(block.createdAt).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `Đã chặn ${blockedUser} vào ${date}`;
  }

  /**
   * Check if user can be blocked (business logic)
   */
  canBlockUser(currentUserId: number, targetUserId: number): boolean {
    // Users cannot block themselves
    if (currentUserId === targetUserId) {
      return false;
    }

    // Add additional business logic here if needed
    return true;
  }
}

export default new BlockService();
