"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '@/services/WebSocketService';

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: Set<number>;
  requestOnlineUsers: () => void;
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

  useEffect(() => {
    // Connect to WebSocket when provider mounts
    webSocketService.connect()
      .then(() => {
        console.log('🌐 Global WebSocket connected');
        setIsConnected(true);
        
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

  const value: WebSocketContextType = {
    isConnected,
    onlineUsers,
    requestOnlineUsers
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
