"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardBody, Avatar, Tabs, Tab, Button, Spinner } from "@nextui-org/react";
import { NotificationService } from "@/services";
import { webSocketService } from "@/services/WebSocketService";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";

interface NotificationProps {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  time: string;
  read: boolean;
  postId?: number;
  commentId?: number;
}

// Mock data for fallback
const MOCK_NOTIFICATIONS: NotificationProps[] = [
  {
    id: "n1",
    type: "like",
    user: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: avatarBase64,
    },
    content: "liked your post",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    user: {
      name: "Alice Johnson",
      username: "alicej",
      avatar: avatarBase64,
    },
    content: "commented on your post: \"Great article, thanks for sharing!\"",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    type: "follow",
    user: {
      name: "Robert Wilson",
      username: "robertw",
      avatar: avatarBase64,
    },
    content: "started following you",
    time: "3 hours ago",
    read: true,
  },  {
    id: "n4",
    type: "mention",
    user: {
      name: "Emily Davis",
      username: "emilyd",
      avatar: avatarBase64,
    },
    content: "mentioned you in a comment: \"@johndoe what do you think about this?\"",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n5",
    type: "like",
    user: {
      name: "Michael Brown",
      username: "michaelb",
      avatar: avatarBase64,
    },
    content: "liked your photo",
    time: "2 days ago",
    read: true,
  },
];

// Helper function to transform backend NotificationDTO to UI format
const transformNotification = (backendNotification: any): NotificationProps => {
  const getNotificationType = (type: string): "like" | "comment" | "follow" | "mention" => {
    switch (type.toLowerCase()) {
      case 'like':
      case 'reaction':
        return 'like';
      case 'comment':
        return 'comment';
      case 'friend_post':
      case 'follow':
        return 'follow';
      case 'mention':
        return 'mention';
      default:
        return 'like';
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };  return {
    id: backendNotification.id.toString(),
    type: getNotificationType(backendNotification.type),
    user: {
      name: backendNotification.actorDisplayName || backendNotification.actorUserName || 'Unknown User',
      username: backendNotification.actorUserName || 'unknown',
      avatar: backendNotification.actorProfilePicture || avatarBase64,
    },
    content: backendNotification.content || '',
    time: formatTime(backendNotification.createdAt),
    read: backendNotification.readStatus || false,
    postId: backendNotification.postId || undefined,
    commentId: backendNotification.commentId || undefined,
  };
};

const NotificationItem = ({ 
  notification, 
  onMarkAsRead,
  currentUser,
  navigateToProfile
}: { 
  notification: NotificationProps;
  onMarkAsRead?: (id: string) => void;
  currentUser: any;
  navigateToProfile: (username: string) => void;
}) => {
  const router = useRouter();

  const handleClick = () => {
    // Mark as read first
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.postId) {
      // Navigate to home page with post highlight
      router.push(`/home?postId=${notification.postId}&highlight=true`);
    } else if (notification.type === 'follow') {
      // Navigate to the user's profile who followed
      navigateToProfile(notification.user.username);
    } else {
      // Default fallback - just mark as read
      console.log('Notification clicked but no specific action defined');
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the notification click
    // Don't navigate if clicking on own avatar
    if (currentUser && currentUser.username === notification.user.username) {
      return;
    }
    navigateToProfile(notification.user.username);
  };

  return (
    <div 
      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <Avatar 
          src={notification.user.avatar} 
          className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
          onClick={handleAvatarClick}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-medium">{notification.user.name}</span> {notification.content}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { navigateToProfile } = useProfileNavigation();

  // Real-time notification handler
  const handleNewNotification = useCallback((notificationData: any) => {
    try {
      const newNotification = transformNotification(notificationData);
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      console.error('Error processing new notification:', err);
    }
  }, []);
  useEffect(() => {
    fetchNotifications();
    getCurrentUser();
    
    // Initialize WebSocket connection for real-time notifications
    const wsService = webSocketService;
    
    wsService.connect()
      .then(() => {
        console.log('WebSocket connected for notifications');
        setWsConnected(true);
        
        // Subscribe to real-time notifications
        wsService.subscribeToNotifications(handleNewNotification);
      })
      .catch((err: any) => {
        console.error('WebSocket connection failed:', err);
        setWsConnected(false);
      });

    // Cleanup WebSocket on unmount
    return () => {
      if (wsService.isConnected()) {
        wsService.disconnect();
      }
    };  }, [handleNewNotification]);

  const getCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await NotificationService.getAllNotifications();
      const transformedNotifications = response.map(transformNotification);
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      // Fallback to mock data
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(parseInt(notificationId));
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true);
      await NotificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const handleRetry = () => {
    fetchNotifications();
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  if (loading) {
    return (
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="text-center text-red-500 p-4">
              <p>{error}</p>              <button 
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Thử Lại
              </button>
            </div>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
        <div className="max-w-2xl mx-auto">          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Thông Báo</h1>
              {wsConnected && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span>Trực tuyến</span>
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              variant="light"
              onClick={handleMarkAllAsRead}
              isLoading={markingAllAsRead}
              isDisabled={unreadNotifications.length === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
            <Tabs aria-label="Notification options">
            <Tab key="all" title={`Tất Cả (${notifications.length})`}>
              <Card>
                <CardBody className="p-0">                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        currentUser={currentUser}
                        navigateToProfile={navigateToProfile}
                      />
                    ))) : (
                    <div className="p-8 text-center text-gray-500">
                      Chưa có thông báo nào
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>            <Tab key="unread" title={`Chưa Đọc (${unreadNotifications.length})`}>
              <Card>
                <CardBody className="p-0">                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        currentUser={currentUser}
                        navigateToProfile={navigateToProfile}
                      />
                    ))) : (
                    <div className="p-8 text-center text-gray-500">
                      Không có thông báo chưa đọc
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
