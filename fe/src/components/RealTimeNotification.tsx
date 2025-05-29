"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Avatar, Button } from '@nextui-org/react';
import { X, MessageCircle, UserPlus, Heart } from 'react-feather';
import { webSocketService } from '@/services/WebSocketService';

export interface NotificationData {
  id: number;
  type: 'message' | 'friend_request' | 'post_reaction' | 'comment' | 'mention';
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  isRead: boolean;
  actionData?: {
    userId?: number;
    postId?: number;
    messageId?: number;
    roomId?: number;
  };
}

interface RealTimeNotificationProps {
  onNotificationClick?: (notification: NotificationData) => void;
  maxNotifications?: number;
}

export default function RealTimeNotification({ 
  onNotificationClick, 
  maxNotifications = 5 
}: RealTimeNotificationProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to real-time notifications
    const unsubscribe = webSocketService.subscribeToNotifications((notificationData: any) => {
      const newNotification: NotificationData = {
        id: Date.now(),
        type: notificationData.type || 'message',
        title: notificationData.title || 'New Notification',
        message: notificationData.message || '',
        avatar: notificationData.avatar,
        timestamp: new Date().toISOString(),
        isRead: false,
        actionData: notificationData.actionData
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, maxNotifications);
        setIsVisible(true);
        
        // Auto-hide after 5 seconds for non-important notifications
        if (notificationData.type !== 'friend_request') {
          setTimeout(() => {
            setNotifications(current => 
              current.filter(n => n.id !== newNotification.id)
            );
          }, 5000);
        }
        
        return updated;
      });
    });

    return () => {
      webSocketService.unsubscribe(unsubscribe);
    };
  }, [maxNotifications]);

  const handleNotificationClick = (notification: NotificationData) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );

    // Call the provided click handler
    onNotificationClick?.(notification);

    // Remove from list after click
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 300);
  };

  const handleDismiss = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'friend_request':
        return <UserPlus size={16} className="text-green-500" />;
      case 'post_reaction':
      case 'comment':
        return <Heart size={16} className="text-red-500" />;
      default:
        return <MessageCircle size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ trước`;
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card 
          key={notification.id}
          className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
            notification.isRead ? 'opacity-75' : 'shadow-lg'
          }`}
          isPressable
          onPress={() => handleNotificationClick(notification)}
        >
          <CardBody className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.avatar ? (
                  <Avatar src={notification.avatar} size="sm" />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {notification.title}
                  </h4>                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 -mt-1 -mr-1"
                    onPress={() => {
                      handleDismiss(notification.id);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
