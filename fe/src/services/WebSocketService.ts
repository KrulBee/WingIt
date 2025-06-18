"use client";

/**
 * WebSocket Service for real-time communication
 * Provides live updates for notifications, messages, and other real-time features
 */

interface WebSocketMessage {
  type: 'notification' | 'message' | 'user_status' | 'post_update' | 'reaction' | 'comment' | 'status_request' | 'status_response';
  data: any;
  timestamp: string;
}

interface WebSocketListener {
  id: string;
  type: string;
  callback: (data: any) => void;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private isConnecting = false;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws';
  }
  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        // Connect without token in URL - we'll authenticate after connection
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Authenticate after connection is established
          this.authenticateConnection();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.handleDisconnection();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners = [];
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribe(type: string, callback: (data: any) => void): string {
    const id = this.generateId();
    this.listeners.push({ id, type, callback });
    return id;
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(id: string): void {
    this.listeners = this.listeners.filter(listener => listener.id !== id);
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(callback: (notification: any) => void): string {
    return this.subscribe('notification', callback);
  }

  /**
   * Subscribe to messages
   */
  subscribeToMessages(callback: (message: any) => void): string {
    return this.subscribe('message', callback);
  }

  /**
   * Subscribe to user status updates
   */
  subscribeToUserStatus(callback: (status: any) => void): string {
    return this.subscribe('user_status', callback);
  }

  /**
   * Subscribe to post updates
   */
  subscribeToPostUpdates(callback: (update: any) => void): string {
    return this.subscribe('post_update', callback);
  }

  /**
   * Subscribe to reactions
   */
  subscribeToReactions(callback: (reaction: any) => void): string {
    return this.subscribe('reaction', callback);
  }
  /**
   * Send typing indicator
   */
  sendTypingIndicator(roomId: number, isTyping: boolean, recipient?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        isTyping,
        roomId: roomId.toString(),
        recipient
      }));
    }
  }

  /**
   * Send chat message via WebSocket
   */
  sendChatMessage(roomId: number, content: string, recipient?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        content,
        roomId: roomId.toString(),
        recipient
      }));
    }
  }

  /**
   * Send notification via WebSocket
   */
  sendNotification(notificationType: string, content: string, targetUser?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'notification',
        notificationType,
        content,
        targetUser
      }));
    }
  }

  /**
   * Send message read receipt
   */
  sendMessageReadReceipt(messageId: number, roomId: number): void {
    this.send({
      type: 'message',
      data: {
        action: 'message_read',
        messageId,
        roomId
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send message delivery confirmation
   */
  sendMessageDelivered(messageId: number, roomId: number): void {
    this.send({
      type: 'message',
      data: {
        action: 'message_delivered',
        messageId,
        roomId
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Subscribe to message status updates (delivered, read)
   */
  subscribeToMessageStatus(callback: (status: any) => void): string {
    return this.subscribe('message_status', callback);
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(callback: (typing: any) => void): string {
    return this.subscribe('typing', callback);
  }

  /**
   * Join chat room for real-time messages
   */
  joinRoom(roomId: number): void {
    this.send({
      type: 'message',
      data: {
        action: 'join_room',
        roomId
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Leave chat room
   */
  leaveRoom(roomId: number): void {
    this.send({
      type: 'message',
      data: {
        action: 'leave_room',
        roomId
      },
      timestamp: new Date().toISOString()
    });
  }
  /**
   * Request current online users status via WebSocket
   */
  requestOnlineUsers(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'status_request'
      }));
    }  }

  /**
   * Subscribe to status response (list of currently online users)
   */
  subscribeToStatusResponse(callback: (onlineUsers: any[]) => void): string {
    return this.subscribe('status_response', callback);
  }

  /**
   * Send presence update
   */
  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.send({
      type: 'user_status',
      data: {
        action: 'presence_update',
        status
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      // Handle authentication response
      if (message.type === 'auth') {
        if (message.status === 'success') {
          console.log('WebSocket authentication successful');
        } else {
          console.error('WebSocket authentication failed:', message.data);
        }
        return;
      }

      // Handle connection confirmation
      if (message.type === 'connection') {
        console.log('WebSocket connection confirmed:', message.data);
        return;
      }

      // Handle error messages
      if (message.type === 'error') {
        console.error('WebSocket error from server:', message.data);
        return;
      }

      // Handle ping/pong
      if (message.type === 'pong') {
        console.log('WebSocket pong received');
        return;
      }      // Map backend message types to frontend expected types
      let messageType = message.type;
      if (message.type === 'userStatus') {
        console.log('🔴 Raw WebSocket userStatus message:', message);
        messageType = 'user_status';
      }
      
      // Notify all listeners for this message type
      this.listeners
        .filter(listener => listener.type === messageType)
        .forEach(listener => {
          if (messageType === 'user_status') {
            console.log('🔴 Forwarding user_status to listener:', message.data || message);
          }
          try {
            listener.callback(message.data || message);
          } catch (error) {
            console.error('Error in WebSocket listener callback:', error);
          }
        });

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('WebSocket reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max WebSocket reconnection attempts reached');
    }
  }
  /**
   * Get auth token for WebSocket authentication
   */
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  /**
   * Authenticate WebSocket connection after it's established
   */
  private authenticateConnection(): void {
    const token = this.getAuthToken();
    if (token && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'authenticate',
        token: token
      }));
      console.log('Sent authentication message to WebSocket server');
    }
  }

  /**
   * Generate unique ID for listeners
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
