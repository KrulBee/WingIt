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

// TypeScript interfaces matching backend DTOs
interface NotificationDTO {
  id: number;
  userId: number;
  userName: string;
  userDisplayName: string;
  userProfilePicture: string;
  postId: number;
  type: string;
  content: string;
  readStatus: boolean;
  createdAt: string; // ISO date string
}

// Backward compatibility interface
interface Notification {
  id?: number;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
}

const NotificationService = {
  // Get current user's notifications
  getAllNotifications: async (): Promise<NotificationDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const notifications: NotificationDTO[] = await response.json();
      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  // Get notifications by user ID
  getUserNotifications: async (userId: number): Promise<NotificationDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user notifications');
      }

      const notifications: NotificationDTO[] = await response.json();
      return notifications;
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<NotificationDTO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/unread`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread notifications');
      }

      const notifications: NotificationDTO[] = await response.json();
      return notifications;
    } catch (error) {
      console.error('Get unread notifications error:', error);
      throw error;
    }
  },

  // Create notification
  createNotification: async (userId: number, postId: number, type: string): Promise<NotificationDTO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/create?userId=${userId}&postId=${postId}&type=${encodeURIComponent(type)}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const notification: NotificationDTO = await response.json();
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/mark-all-read`, {
        method: 'PUT',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  // Backward compatibility method
  getNotificationById: async (id: number): Promise<NotificationDTO> => {
    try {
      // Note: This specific endpoint might need to be implemented on the backend
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification');
      }

      const notification: NotificationDTO = await response.json();
      return notification;
    } catch (error) {
      console.error('Get notification error:', error);
      throw error;
    }
  },
};

export default NotificationService;
