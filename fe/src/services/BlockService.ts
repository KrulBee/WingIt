
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

class BlockService {
  private baseURL = `${API_BASE_URL}/api/v1/blocks`;

  /**
   * Block a user
   */
  async blockUser(blockedUserId: number): Promise<Block> {
    try {
      const response = await fetch(`${this.baseURL}/${blockedUserId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to block user: ${response.status}`);
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
      const response = await fetch(`${this.baseURL}/${blockedUserId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to unblock user: ${response.status}`);
      }
    } catch (error) {
      console.error('Error unblocking user by ID:', error);
      throw error;
    }
  }





  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/check/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        return false; // If error, assume not blocked
      }

      const result = await response.json();
      return result.isBlocked || false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
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

  /**
   * Validate block request
   */
  validateBlockRequest(blockedUserId: number): string[] {
    const errors: string[] = [];

    if (!blockedUserId || blockedUserId <= 0) {
      errors.push('Valid blocked user ID is required');
    }

    return errors;
  }
}

export default new BlockService();
