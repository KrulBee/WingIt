
import { createAuthHeaders } from './AuthService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Interface for RoomUser entity
export interface RoomUser {
  id: number;
  roomId: number;
  userId: number;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  lastSeenAt?: string;
  isActive: boolean;
  isMuted: boolean;
  mutedUntil?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
    isOnline?: boolean;
  };
  room?: {
    id: number;
    name: string;
    description?: string;
    roomType: 'PUBLIC' | 'PRIVATE' | 'GROUP';
  };
}

export interface RoomUserCreateRequest {
  roomId: number;
  userId: number;
  role?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
}

export interface RoomUserUpdateRequest {
  role?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  isActive?: boolean;
  isMuted?: boolean;
  mutedUntil?: string;
}

export interface RoomUserListResponse {
  roomUsers: RoomUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface RoomUserInviteRequest {
  roomId: number;
  userIds: number[];
  role?: 'MEMBER' | 'MODERATOR';
  inviteMessage?: string;
}

class RoomUserService {
  private baseURL = `${API_BASE_URL}/api/v1/room-users`;

  /**
   * Add user to room
   */
  async addUserToRoom(request: RoomUserCreateRequest): Promise<RoomUser> {
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
        throw new Error(errorData.message || `Failed to add user to room: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding user to room:', error);
      throw error;
    }
  }

  /**
   * Invite multiple users to room
   */
  async inviteUsersToRoom(request: RoomUserInviteRequest): Promise<RoomUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to invite users to room: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error inviting users to room:', error);
      throw error;
    }
  }

  /**
   * Get users in a room
   */
  async getRoomUsers(roomId: number, page: number = 0, size: number = 20): Promise<RoomUserListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get room users: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room users:', error);
      throw error;
    }
  }

  /**
   * Get rooms for a user
   */
  async getUserRooms(userId: number, page: number = 0, size: number = 20): Promise<RoomUserListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/user/${userId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get user rooms: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user rooms:', error);
      throw error;
    }
  }

  /**
   * Get current user's rooms
   */
  async getMyRooms(page: number = 0, size: number = 20): Promise<RoomUserListResponse> {
    try {
      const response = await fetch(`${this.baseURL}/my-rooms?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get my rooms: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting my rooms:', error);
      throw error;
    }
  }

  /**
   * Get room user by ID
   */
  async getRoomUserById(roomUserId: number): Promise<RoomUser> {
    try {
      const response = await fetch(`${this.baseURL}/${roomUserId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get room user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room user by ID:', error);
      throw error;
    }
  }

  /**
   * Get room user by room and user ID
   */
  async getRoomUserByRoomAndUser(roomId: number, userId: number): Promise<RoomUser | null> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // User not in room
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get room user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room user by room and user:', error);
      throw error;
    }
  }

  /**
   * Update room user
   */
  async updateRoomUser(roomUserId: number, request: RoomUserUpdateRequest): Promise<RoomUser> {
    try {
      const response = await fetch(`${this.baseURL}/${roomUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update room user: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating room user:', error);
      throw error;
    }
  }

  /**
   * Remove user from room
   */
  async removeUserFromRoom(roomUserId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${roomUserId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to remove user from room: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing user from room:', error);
      throw error;
    }
  }

  /**
   * Leave room (current user)
   */
  async leaveRoom(roomId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/leave`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to leave room: ${response.status}`);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  /**
   * Promote user to admin
   */
  async promoteToAdmin(roomUserId: number): Promise<RoomUser> {
    try {
      return await this.updateRoomUser(roomUserId, { role: 'ADMIN' });
    } catch (error) {
      console.error('Error promoting to admin:', error);
      throw error;
    }
  }

  /**
   * Promote user to moderator
   */
  async promoteToModerator(roomUserId: number): Promise<RoomUser> {
    try {
      return await this.updateRoomUser(roomUserId, { role: 'MODERATOR' });
    } catch (error) {
      console.error('Error promoting to moderator:', error);
      throw error;
    }
  }

  /**
   * Demote user to member
   */
  async demoteToMember(roomUserId: number): Promise<RoomUser> {
    try {
      return await this.updateRoomUser(roomUserId, { role: 'MEMBER' });
    } catch (error) {
      console.error('Error demoting to member:', error);
      throw error;
    }
  }

  /**
   * Mute user in room
   */
  async muteUser(roomUserId: number, mutedUntil?: string): Promise<RoomUser> {
    try {
      return await this.updateRoomUser(roomUserId, { 
        isMuted: true, 
        mutedUntil 
      });
    } catch (error) {
      console.error('Error muting user:', error);
      throw error;
    }
  }

  /**
   * Unmute user in room
   */
  async unmuteUser(roomUserId: number): Promise<RoomUser> {
    try {
      return await this.updateRoomUser(roomUserId, { 
        isMuted: false, 
        mutedUntil: undefined 
      });
    } catch (error) {
      console.error('Error unmuting user:', error);
      throw error;
    }
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(roomId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/last-seen`, {
        method: 'PUT',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update last seen: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating last seen:', error);
      throw error;
    }
  }

  /**
   * Get online users in room
   */
  async getOnlineUsersInRoom(roomId: number): Promise<RoomUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/online`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get online users: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting online users:', error);
      throw error;
    }
  }

  /**
   * Get room admins
   */
  async getRoomAdmins(roomId: number): Promise<RoomUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/admins`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get room admins: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room admins:', error);
      throw error;
    }
  }

  /**
   * Get room moderators
   */
  async getRoomModerators(roomId: number): Promise<RoomUser[]> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/moderators`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to get room moderators: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room moderators:', error);
      throw error;
    }
  }

  /**
   * Check if user is in room
   */
  async isUserInRoom(roomId: number, userId: number): Promise<boolean> {
    try {
      const roomUser = await this.getRoomUserByRoomAndUser(roomId, userId);
      return roomUser !== null && roomUser.isActive;
    } catch (error) {
      console.error('Error checking if user is in room:', error);
      return false;
    }
  }

  /**
   * Check if current user is in room
   */
  async isInRoom(roomId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/room/${roomId}/is-member`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.isMember || false;
    } catch (error) {
      console.error('Error checking if in room:', error);
      return false;
    }
  }

  /**
   * Get user's role in room
   */
  async getUserRoleInRoom(roomId: number, userId: number): Promise<string | null> {
    try {
      const roomUser = await this.getRoomUserByRoomAndUser(roomId, userId);
      return roomUser?.role || null;
    } catch (error) {
      console.error('Error getting user role in room:', error);
      return null;
    }
  }

  /**
   * Check if user has admin privileges
   */
  async isAdmin(roomId: number, userId: number): Promise<boolean> {
    try {
      const role = await this.getUserRoleInRoom(roomId, userId);
      return role === 'ADMIN';
    } catch (error) {
      console.error('Error checking admin privileges:', error);
      return false;
    }
  }

  /**
   * Check if user has moderator privileges
   */
  async isModerator(roomId: number, userId: number): Promise<boolean> {
    try {
      const role = await this.getUserRoleInRoom(roomId, userId);
      return role === 'ADMIN' || role === 'MODERATOR';
    } catch (error) {
      console.error('Error checking moderator privileges:', error);
      return false;
    }
  }

  /**
   * Validate role assignment
   */
  validateRoleAssignment(currentUserRole: string, targetRole: string): boolean {
    // Admins can assign any role
    if (currentUserRole === 'ADMIN') {
      return true;
    }
    
    // Moderators can only assign member role
    if (currentUserRole === 'MODERATOR') {
      return targetRole === 'MEMBER';
    }
    
    // Members cannot assign roles
    return false;
  }

  /**
   * Format room user for display
   */
  formatRoomUserForDisplay(roomUser: RoomUser): string {
    const user = roomUser.user?.username || 'Người dùng không xác định';
    const role = roomUser.role.toLowerCase();
    const joinedDate = new Date(roomUser.joinedAt).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `${user} (${role}) - tham gia ${joinedDate}`;
  }

  /**
   * Check if user is muted
   */
  isUserMuted(roomUser: RoomUser): boolean {
    if (!roomUser.isMuted) {
      return false;
    }
    
    if (!roomUser.mutedUntil) {
      return true; // Permanently muted
    }
    
    return new Date(roomUser.mutedUntil) > new Date();
  }

  /**
   * Get mute duration remaining
   */
  getMuteTimeRemaining(roomUser: RoomUser): number {
    if (!roomUser.isMuted || !roomUser.mutedUntil) {
      return 0;
    }
    
    const muteEnd = new Date(roomUser.mutedUntil);
    const now = new Date();
    
    return Math.max(0, muteEnd.getTime() - now.getTime());
  }
}

export default new RoomUserService();
