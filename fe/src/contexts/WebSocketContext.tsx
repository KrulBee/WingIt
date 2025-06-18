"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '@/services/WebSocketService';
import { notificationSoundService } from '@/services/NotificationSoundService';

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: Set<number>;
  requestOnlineUsers: () => void;
  updateNotificationSettings: (enabled: boolean) => void;
  setCurrentUserId: (userId: number | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);  useEffect(() => {
    // Connect to WebSocket when provider mounts
    webSocketService.connect()
      .then(() => {
        console.log('🌐 Global WebSocket connected');
        setIsConnected(true);
        
        // Initialize current user ID for notifications
        const initCurrentUser = async () => {
          try {
            const { AuthService } = await import('@/services');
            const user = await AuthService.getCurrentUser();
            setCurrentUserId(user.id);
            console.log('👤 Current user ID set for notifications:', user.id);
          } catch (error) {
            console.log('ℹ️ User not logged in, notifications will be disabled');
          }
        };
        initCurrentUser();
        
        // Subscribe to user status updates globally
        webSocketService.subscribeToUserStatus((statusData: any) => {
          console.log('🔴 Global user status update:', statusData);
          const { userId, isOnline } = statusData;
          
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (isOnline) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });
        });
        
        // Subscribe to status response for initial online users
        webSocketService.subscribeToStatusResponse((onlineUsersData: any) => {
          console.log('📡 Global initial online users received:', onlineUsersData);
          
          if (Array.isArray(onlineUsersData)) {
            const userIds = onlineUsersData.map(user => user.userId || user.id);
            setOnlineUsers(new Set(userIds));
            console.log('✅ Global online users set:', userIds);
          }
        });        // Subscribe to messages globally for notification sounds
        // Note: Only subscribe for notifications, let pages handle their own message display
        webSocketService.subscribeToMessages((messageData: any) => {
          console.log('📨 Global message received for notification:', messageData);
          console.log('🔍 Notification check - Current user ID:', currentUserId, 'Message sender ID:', messageData.senderId, 'Type check:', typeof currentUserId, typeof messageData.senderId);
          
          // Only play notification sound if the message is not from the current user
          // Convert both to numbers for comparison to handle type mismatches
          const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
          const senderIdNum = messageData.senderId ? Number(messageData.senderId) : null;
          
          if (currentUserIdNum && senderIdNum && senderIdNum !== currentUserIdNum) {
            console.log('🔊 Playing notification sound for message from user:', messageData.senderId, '(current user:', currentUserId, ')');
            notificationSoundService.playMessageNotification();
          } else {
            console.log('🔇 Skipping notification - message from current user or invalid data');
            console.log('🔍 Skip reason - currentUserId:', currentUserId, '(' + typeof currentUserId + ')', 'senderId:', messageData.senderId, '(' + typeof messageData.senderId + ')', 'Numbers equal:', currentUserIdNum === senderIdNum);
          }
        });
        
        // Request initial online users after connection
        setTimeout(() => {
          webSocketService.requestOnlineUsers();
          console.log('🔍 Requested initial online users globally');
        }, 500);
      })
      .catch((err: any) => {
        console.error('🚫 Global WebSocket connection failed:', err);
        setIsConnected(false);
      });

    // Cleanup on unmount (though this provider should rarely unmount)
    return () => {
      if (webSocketService.isConnected()) {
        webSocketService.disconnect();
      }
    };
  }, []);
  const requestOnlineUsers = () => {
    if (isConnected) {
      webSocketService.requestOnlineUsers();
    }
  };

  const updateNotificationSettings = (enabled: boolean) => {
    notificationSoundService.setEnabled(enabled);
    console.log('🔊 Notification sounds', enabled ? 'enabled' : 'disabled');
  };
  const setCurrentUserIdForNotifications = (userId: number | null) => {
    setCurrentUserId(userId);
  };

  const value: WebSocketContextType = {
    isConnected,
    onlineUsers,
    requestOnlineUsers,
    updateNotificationSettings,
    setCurrentUserId: setCurrentUserIdForNotifications
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
