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

export interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
}

export interface ChatRoom {
  id: number;
  roomName: string;
  isGroupChat: boolean;
  createdDate: string;
  participants?: User[];
  lastMessage?: Message;
}

export interface Message {
  id: number;
  roomId: number;
  senderId: number;
  sender?: User;
  content: string;
  timestamp: string;
}

interface CreateChatRoomData {
  roomName: string;
  isGroupChat: boolean;
  participantIds?: number[];
}

interface CreateMessageData {
  roomId: number;
  content: string;
}

const ChatService = {
  // Chat Room operations
  getUserChatRooms: async (): Promise<ChatRoom[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch chat rooms');
      return await response.json();
    } catch (error) {
      console.error('Get user chat rooms error:', error);
      throw error;
    }
  },

  getChatRoomsByUserId: async (userId: number): Promise<ChatRoom[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-rooms/user/${userId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch chat rooms');
      return await response.json();
    } catch (error) {
      console.error('Get chat rooms error:', error);
      throw error;
    }
  },

  getChatRoomById: async (roomId: number): Promise<ChatRoom> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/${roomId}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch chat room');
      return await response.json();
    } catch (error) {
      console.error('Get chat room error:', error);
      throw error;
    }
  },  createChatRoom: async (chatRoomData: CreateChatRoomData): Promise<ChatRoom> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/create`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(chatRoomData),
      });
      if (!response.ok) throw new Error('Failed to create chat room');
      return await response.json();
    } catch (error) {
      console.error('Create chat room error:', error);
      throw error;
    }
  },

  findOrCreatePrivateChat: async (otherUserId: number): Promise<ChatRoom> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/private/${otherUserId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to find or create private chat');
      return await response.json();
    } catch (error) {
      console.error('Find or create private chat error:', error);
      throw error;
    }
  },

  updateChatRoom: async (roomId: number, updateData: { roomName?: string }): Promise<ChatRoom> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-rooms/${roomId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error('Failed to update chat room');
      return await response.json();
    } catch (error) {
      console.error('Update chat room error:', error);
      throw error;
    }
  },

  deleteChatRoom: async (roomId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-rooms/${roomId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete chat room');
    } catch (error) {
      console.error('Delete chat room error:', error);
      throw error;
    }
  },

  // Message operations
  getMessagesByRoomId: async (roomId: number, page: number = 0, size: number = 20): Promise<Message[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messages/room/${roomId}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },  sendMessage: async (messageData: CreateMessageData): Promise<Message> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageData.roomId}`, {
        method: 'POST',
        headers: createAuthHeaders(),        body: JSON.stringify({
          content: messageData.content
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  updateMessage: async (messageId: number, content: string): Promise<Message> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to update message');
      return await response.json();
    } catch (error) {
      console.error('Update message error:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete message');
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },
  // Chat room participants
  joinChatRoom: async (roomId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/${roomId}/join`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to join chat room');
    } catch (error) {
      console.error('Join chat room error:', error);
      throw error;
    }
  },

  leaveChatRoom: async (roomId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/${roomId}/leave`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to leave chat room');
    } catch (error) {
      console.error('Leave chat room error:', error);
      throw error;
    }
  },

  getChatRoomMessages: async (roomId: number): Promise<Message[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/${roomId}/messages`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch chat room messages');
      return await response.json();
    } catch (error) {
      console.error('Get chat room messages error:', error);
      throw error;
    }
  },

  sendMessageToRoom: async (roomId: number, content: string, messageType: string = 'TEXT'): Promise<Message> => {
    try {
      const messageData = {
        content,
        messageType,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/chatrooms/${roomId}/messages`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  addUserToChatRoom: async (roomId: number, userId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-rooms/${roomId}/users/${userId}`, {
        method: 'POST',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to add user to chat room');
    } catch (error) {
      console.error('Add user to chat room error:', error);
      throw error;
    }
  },

  removeUserFromChatRoom: async (roomId: number, userId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-rooms/${roomId}/users/${userId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to remove user from chat room');
    } catch (error) {
      console.error('Remove user from chat room error:', error);
      throw error;
    }
  },

  getChatRoomParticipants: async (roomId: number): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat-rooms/${roomId}/users`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch chat room participants');
      return await response.json();
    } catch (error) {
      console.error('Get chat room participants error:', error);
      throw error;
    }
  },  // Legacy method aliases for backward compatibility
  getChatRooms: async (): Promise<ChatRoom[]> => {
    return ChatService.getUserChatRooms();
  },

  getMessages: async (roomId: number, page: number = 0, size: number = 20): Promise<Message[]> => {
    return ChatService.getMessagesByRoomId(roomId, page, size);
  },

  // Legacy sendMessage method for backward compatibility
  sendMessageLegacy: async (roomId: number, content: string, messageType: string = 'TEXT'): Promise<Message> => {
    return ChatService.sendMessageToRoom(roomId, content, messageType);
  },

  joinRoom: async (roomId: number): Promise<void> => {
    return ChatService.joinChatRoom(roomId);
  },

  leaveRoom: async (roomId: number): Promise<void> => {
    return ChatService.leaveChatRoom(roomId);
  },

  getRoomMessages: async (roomId: number): Promise<Message[]> => {
    return ChatService.getChatRoomMessages(roomId);
  },
};

export default ChatService;
