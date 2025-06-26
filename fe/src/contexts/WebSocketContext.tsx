"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService } from '@/services/WebSocketService';
import { notificationSoundService } from '@/services/NotificationSoundService';

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: Set<number>;
  currentUserId: number | null;
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
    // Check if we're on setup page - if so, skip authentication attempts
    const isSetupPage = typeof window !== 'undefined' && window.location.pathname.includes('/auth/setup');
    
    // Connect to WebSocket when provider mounts
    webSocketService.connect()
      .then(() => {
        console.log('🌐 Global WebSocket connected');
        setIsConnected(true);        // Initialize current user ID for notifications
        const initCurrentUser = async () => {
          // Skip authentication during setup flow
          if (isSetupPage) {
            console.log('ℹ️ On setup page, skipping user authentication');
            return;
          }
          
          try {
            console.log('🔍 Attempting to get current user for notifications...');
            
            // Try multiple approaches to get the current user
            let user = null;
            
            // Method 1: AuthService.getCurrentUser()
            try {
              const { AuthService } = await import('@/services');
              user = await AuthService.getCurrentUser();
              console.log('👤 Retrieved user data from AuthService:', user);
            } catch (authError) {
              console.log('⚠️ AuthService.getCurrentUser() failed:', authError);
            }
            
            // Method 2: UserService.getCurrentUserProfile() if AuthService failed
            if (!user) {
              try {
                console.log('🔍 Trying UserService.getCurrentUserProfile()...');
                const { UserService } = await import('@/services');
                user = await UserService.getCurrentUserProfile();
                console.log('👤 Retrieved user data from UserService:', user);
              } catch (userError) {
                console.log('⚠️ UserService.getCurrentUserProfile() failed:', userError);
              }
            }
              if (user && user.id) {
              setCurrentUserId(user.id);
              console.log('👤 Current user ID set for notifications:', user.id);
              
              // Also initialize notification settings for this user
              await initNotificationSettings(user.id);
            } else {
              console.log('❌ No user ID found in user data:', user);
            }
            
          } catch (error) {
            console.error('❌ Failed to get current user for notifications:', error);
            console.log('ℹ️ User not logged in, notifications will be disabled');          }
        };

        // Initialize notification settings from user preferences
        const initNotificationSettings = async (userId: number) => {
          try {
            console.log('🔊 Loading notification settings for user:', userId);
            // Import settings service
            const settingsService = (await import('@/services/settingsService')).default;
            const userSettings = await settingsService.getUserSettings(userId);
              // The notification sound setting is stored in enableNotifications
            const notificationEnabled = userSettings.enableNotifications;
            console.log('🔊 User notification setting loaded:', notificationEnabled);
            
            // Apply the setting
            notificationSoundService.setEnabled(notificationEnabled);
            console.log('🔊 Notification sound service updated:', notificationEnabled ? 'enabled' : 'disabled');
            
          } catch (error) {
            console.error('❌ Failed to load notification settings:', error);
            // Default to enabled if we can't load settings
            console.log('🔊 Defaulting to notification sounds enabled');
            notificationSoundService.setEnabled(true);
          }
        };
        
        initCurrentUser();
        
        // Retry getting user ID after a delay if it failed initially
        setTimeout(() => {
          if (!currentUserId) {
            console.log('🔄 Retrying to get current user ID...');
            initCurrentUser();
          }
        }, 2000);
        
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
        webSocketService.subscribeToMessages(async (messageData: any) => {
          console.log('📨 Global message received for notification:', messageData);
          
          // If currentUserId is still null, try to get it now
          let effectiveCurrentUserId = currentUserId;
          if (!effectiveCurrentUserId) {
            console.log('🔄 Current user ID is null, attempting to retrieve it...');
            try {
              const { AuthService } = await import('@/services');
              const user = await AuthService.getCurrentUser();
              effectiveCurrentUserId = user.id;
              setCurrentUserId(user.id);
              console.log('👤 Retrieved current user ID just-in-time:', user.id);
            } catch (error) {
              try {
                const { UserService } = await import('@/services');
                const profile = await UserService.getCurrentUserProfile();
                effectiveCurrentUserId = profile.id;
                setCurrentUserId(profile.id);
                console.log('👤 Retrieved current user ID from profile just-in-time:', profile.id);
              } catch (profileError) {
                console.error('❌ Still unable to get current user ID:', profileError);
              }
            }
          }
          
          console.log('🔍 Notification check - Current user ID:', effectiveCurrentUserId, 'Message sender ID:', messageData.senderId, 'Type check:', typeof effectiveCurrentUserId, typeof messageData.senderId);
          
          // Only play notification sound if the message is not from the current user
          // Convert both to numbers for comparison to handle type mismatches
          const currentUserIdNum = effectiveCurrentUserId ? Number(effectiveCurrentUserId) : null;
          const senderIdNum = messageData.senderId ? Number(messageData.senderId) : null;
          
          if (currentUserIdNum && senderIdNum && senderIdNum !== currentUserIdNum) {
            console.log('🔊 Playing notification sound for message from user:', messageData.senderId, '(current user:', effectiveCurrentUserId, ')');
            notificationSoundService.playMessageNotification();
          } else {
            console.log('🔇 Skipping notification - message from current user or invalid data');
            console.log('🔍 Skip reason - currentUserId:', effectiveCurrentUserId, '(' + typeof effectiveCurrentUserId + ')', 'senderId:', messageData.senderId, '(' + typeof messageData.senderId + ')', 'Numbers equal:', currentUserIdNum === senderIdNum);
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
  };  const setCurrentUserIdForNotifications = (userId: number | null) => {
    console.log('🆔 Setting current user ID for notifications:', userId);
    setCurrentUserId(userId);
    console.log('✅ Current user ID updated to:', userId);
  };
  const value: WebSocketContextType = {
    isConnected,
    onlineUsers,
    currentUserId,
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
