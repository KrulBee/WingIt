"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, Avatar, Divider, Input, Button } from "@nextui-org/react";
import { Search, Send, Plus, Settings } from "react-feather";
import ChatService from "@/services/ChatService";
import type { User, ChatRoom, Message } from "@/services/ChatService";
import { webSocketService } from "@/services/WebSocketService";
import FriendChatModal from "@/components/FriendChatModal";
import ChatManagementModal from "@/components/ChatManagementModal";
import RealTimeNotification, { NotificationData } from "@/components/RealTimeNotification";
import TypingIndicator from "@/components/TypingIndicator";
import OnlineStatusIndicator, { OnlineStatus } from "@/components/OnlineStatusIndicator";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";
import { avatarBase64 } from "@/static/images/avatarDefault";

// Interface for the UI component
interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  online: boolean;
  unread: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  originalSenderId: number; // Keep original numeric senderId for comparison
  senderName: string;
  text: string;
  timestamp: string;
  fullTimestamp?: string; // Add full timestamp for hover display
}

export default function MessagesPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(0); // Will be set from auth context
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [typingUserNames, setTypingUserNames] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [userPresence, setUserPresence] = useState<Map<number, OnlineStatus>>(new Map());
  const [showFriendChatModal, setShowFriendChatModal] = useState(false);
  const [showChatManagementModal, setShowChatManagementModal] = useState(false);
  const [messageDeliveryStatus, setMessageDeliveryStatus] = useState<Map<number, 'sending' | 'delivered' | 'read'>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { navigateToProfile } = useProfileNavigation();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Real-time message handler
  const handleNewMessage = useCallback((messageData: any) => {
    try {
      // Transform the WebSocket message to our Message format
      const newMessage: Message = {
        id: messageData.id,
        roomId: messageData.roomId,
        senderId: messageData.senderId,
        content: messageData.content,
        messageType: messageData.messageType || 'TEXT',
        timestamp: messageData.timestamp || new Date().toISOString(),
        sender: messageData.sender
      };
      
      // Only add message if it's for the active chat
      if (newMessage.roomId === activeChat) {
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error('Error processing new message:', err);
    }
  }, [activeChat]);

    // Handle typing indicators
  const handleTypingUpdate = useCallback((typingData: any) => {
    const { userId, roomId, isTyping, userName } = typingData;
    
    if (roomId === activeChat && userId !== currentUserId) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });

      setTypingUserNames(prev => {
        if (isTyping && userName) {
          return [...prev.filter(name => name !== userName), userName];
        } else {
          return prev.filter(name => name !== userName);
        }
      });
    }
  }, [activeChat, currentUserId]);

  // Handle user status updates
  const handleUserStatusUpdate = useCallback((statusData: any) => {
    const { userId, isOnline, presence } = statusData;
    
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (isOnline) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });

    if (presence) {
      setUserPresence(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, presence as OnlineStatus);
        return newMap;
      });
    }
  }, []);

  // Handle message status updates
  const handleMessageStatusUpdate = useCallback((statusData: any) => {
    const { messageId, status } = statusData;
    setMessageDeliveryStatus(prev => {
      const newMap = new Map(prev);
      newMap.set(messageId, status);
      return newMap;
    });
  }, []);

  // Handle notifications
  const handleNotificationClick = useCallback((notification: NotificationData) => {
    if (notification.type === 'message' && notification.actionData?.roomId) {
      setActiveChat(notification.actionData.roomId);
    }
  }, []);  // Fetch chat rooms on component mount
  useEffect(() => {
    fetchChatRooms();
    getCurrentUser();
    
    // Initialize WebSocket connection for real-time chat
    const wsService = webSocketService;
    
    wsService.connect()
      .then(() => {
        console.log('WebSocket connected for chat');
        setWsConnected(true);
        
        // Subscribe to real-time messages
        wsService.subscribeToMessages(handleNewMessage);
        
        // Subscribe to typing indicators
        wsService.subscribeToTyping(handleTypingUpdate);
        
        // Subscribe to user status updates
        wsService.subscribeToUserStatus(handleUserStatusUpdate);

        // Subscribe to message status updates
        wsService.subscribeToMessageStatus(handleMessageStatusUpdate);
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
    };
  }, [handleNewMessage, handleTypingUpdate, handleUserStatusUpdate, handleMessageStatusUpdate]);
  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);      // Join the chat room for real-time messages
      const wsService = webSocketService;
      if (wsService.isConnected()) {
        wsService.joinRoom(activeChat);
      }
    }  }, [activeChat]);
  const getCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      setCurrentUserId(user.id); // Set the actual user ID from auth
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await ChatService.getUserChatRooms();
      setChatRooms(rooms);
      
      // Set first room as active if available
      if (rooms.length > 0) {
        setActiveChat(rooms[0].id);
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError('Failed to load chat rooms. Please try again.');
      
      // Fallback to mock data
      const mockRooms: ChatRoom[] = [
        {
          id: 1,
          roomName: "Jane Smith",
          isGroupChat: false,
          createdDate: new Date().toISOString(),
          participants: [
            { id: 2, username: "janesmith", displayName: "Jane Smith", profilePicture: "https://i.pravatar.cc/150?u=janesmith" }
          ]
        },
        {
          id: 2,
          roomName: "Project Team",
          isGroupChat: true,
          createdDate: new Date().toISOString(),
          participants: [
            { id: 3, username: "alice", displayName: "Alice Johnson", profilePicture: "https://i.pravatar.cc/150?u=alicej" },
            { id: 4, username: "bob", displayName: "Bob Wilson", profilePicture: "https://i.pravatar.cc/150?u=bobw" }
          ]
        }
      ];
      setChatRooms(mockRooms);
      if (mockRooms.length > 0) {
        setActiveChat(mockRooms[0].id);
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchMessages = async (roomId: number) => {
    try {
      const roomMessages = await ChatService.getMessagesByRoomId(roomId);
      setMessages(roomMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages.');
      
      // Fallback to mock messages
      const mockMessages: Message[] = [
        {
          id: 1,
          roomId: roomId,
          senderId: 2,
          content: "Hey, how are you?",
          messageType: "TEXT",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          sender: { id: 2, username: "janesmith", displayName: "Jane Smith" }
        },
        {
          id: 2,
          roomId: roomId,
          senderId: currentUserId,
          content: "I'm good! Just working on the new project",
          messageType: "TEXT",
          timestamp: new Date(Date.now() - 3000000).toISOString()
        }
      ];
      setMessages(mockMessages);
    }
  };const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    
    const tempMessageId = Date.now(); // Temporary ID for tracking
    
    try {
      setSendingMessage(true);
      
      // Set initial status as sending
      setMessageDeliveryStatus(prev => {
        const newMap = new Map(prev);
        newMap.set(tempMessageId, 'sending');
        return newMap;
      });
      
      const message = await ChatService.sendMessage({
        roomId: activeChat,
        content: newMessage.trim(),
        messageType: 'TEXT'
      });
      
      // Update status to delivered once sent successfully
      setMessageDeliveryStatus(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempMessageId); // Remove temp ID
        newMap.set(message.id, 'delivered');
        return newMap;
      });
      
      // Add the new message to the messages list
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      // Send via WebSocket for real-time delivery
      const wsService = webSocketService;
      if (wsService.isConnected()) {
        wsService.send({
          type: 'message',
          data: {
            action: 'send_message',
            roomId: activeChat,
            messageId: message.id,
            content: newMessage.trim()
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the failed message status
      setMessageDeliveryStatus(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempMessageId);
        return newMap;
      });
    } finally {
      setSendingMessage(false);
    }
  };// Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    if (!activeChat) return;
    
    const wsService = webSocketService;
    if (wsService.isConnected()) {
      wsService.sendTypingIndicator(activeChat, isTyping);
    }
  };

  // Handle chat creation from FriendChatModal
  const handleChatCreated = (chatRoom: ChatRoom) => {
    setChatRooms(prev => [chatRoom, ...prev]);
    setActiveChat(chatRoom.id);
    setShowFriendChatModal(false);
  };

  // Handle chat updates from ChatManagementModal
  const handleChatUpdated = (updatedRoom: ChatRoom) => {
    setChatRooms(prev => prev.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
    setShowChatManagementModal(false);
  };

  // Handle chat deletion from ChatManagementModal
  const handleChatDeleted = (roomId: number) => {
    setChatRooms(prev => prev.filter(room => room.id !== roomId));
    if (activeChat === roomId) {
      setActiveChat(null);
    }
    setShowChatManagementModal(false);  };
  
  // Generate a consistent avatar src with fallback
  const getAvatarSrc = (avatar?: string, username?: string) => {
    if (avatar && avatar.trim() !== '') {
      return avatar;
    }
    // Use the default avatar as fallback
    return avatarBase64;
  };
  
  // Transform ChatRoom to ChatUser for UI compatibility
  const transformRoomToUser = (room: ChatRoom): ChatUser => {
    if (!room.isGroupChat && room.participants && room.participants.length > 0) {
      const otherUser = room.participants[0];
      const isOnline = onlineUsers.has(otherUser.id);
      return {
        id: room.id.toString(),
        name: otherUser.displayName || otherUser.username,
        avatar: getAvatarSrc(otherUser.profilePicture, otherUser.username),
        lastMessage: getLastMessageForRoom(room.id),
        timestamp: formatTimestamp(room.updatedDate || room.createdDate),
        online: isOnline,
        unread: 0 // Could be implemented with unread message API
      };
    } else {
      return {
        id: room.id.toString(),
        name: room.roomName,
        avatar: getAvatarSrc(undefined, `group${room.id}`),
        lastMessage: getLastMessageForRoom(room.id),
        timestamp: formatTimestamp(room.updatedDate || room.createdDate),
        online: true,
        unread: 0
      };
    }
  };

  const getLastMessageForRoom = (roomId: number): string => {
    // In a real app, this would come from the API
    return "No messages yet";
  };
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) return "Now";
    if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();  };

  // Transform Message to ChatMessage for UI compatibility
  const transformMessage = (message: Message): ChatMessage => {
    const isCurrentUser = message.senderId === currentUserId;
    let senderName = 'Unknown';
    
    if (isCurrentUser) {
      senderName = 'tôi'; // Show "tôi" for current user messages
    } else if (message.sender) {
      senderName = message.sender.displayName || message.sender.username || 'Unknown';
    } else {
      // Try to find sender info from chat room participants
      const sender = activeChatRoom?.participants?.find(p => p.id === message.senderId);
      if (sender) {
        senderName = sender.displayName || sender.username || 'Unknown';
      }
    }
    
    // Format timestamp properly
    const messageDate = message.timestamp ? new Date(message.timestamp) : new Date();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    let shortTimestamp: string;
    let fullTimestamp: string;
    
    if (messageDay.getTime() === today.getTime()) {
      // Today - show only time
      shortTimestamp = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      fullTimestamp = `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (messageDay.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      // Yesterday
      shortTimestamp = "Yesterday";
      fullTimestamp = `Yesterday at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older - show date
      shortTimestamp = messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      fullTimestamp = messageDate.toLocaleString([], { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return {
      id: message.id?.toString() || '0',
      senderId: message.senderId?.toString() || 'unknown',
      originalSenderId: message.senderId || 0, // Store original numeric senderId
      senderName: senderName,
      text: message.content || '',
      timestamp: shortTimestamp,
      fullTimestamp: fullTimestamp
    };  };

  const filteredRooms = chatRooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    if (!room.isGroupChat && room.participants && room.participants.length > 0) {
      const otherUser = room.participants[0];
      return (otherUser.displayName || otherUser.username).toLowerCase().includes(searchLower);
    }
    return room.roomName.toLowerCase().includes(searchLower);
  });
  
  const activeChatRoom = chatRooms.find(room => room.id === activeChat);
  const transformedMessages = messages.filter(message => message && message.id != null).map(transformMessage);

  if (loading) {
    return (
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
          </div>
        </main>
      </div>
    );
  }  const ChatListItem = ({ user, active, onClick }: { user: ChatUser, active: boolean, onClick: () => void }) => {
    const handleAvatarClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering the chat selection
      // Don't navigate if clicking on own avatar
      if (currentUser && currentUser.username === user.name.toLowerCase()) {
        return;
      }
      // Extract username from user data - this might need adjustment based on your data structure
      const username = user.name.toLowerCase().replace(/\s+/g, ''); // Simple conversion, adjust as needed
      navigateToProfile(username);
    };

    return (
      <div 
        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${active ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        onClick={onClick}
      >
        <div className="relative">
          <Avatar 
            src={user.avatar} 
            className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
            onClick={handleAvatarClick}
          />
          <div className="absolute bottom-0 right-0">
            <OnlineStatusIndicator 
              status={user.online ? 'online' : 'offline'} 
              size="sm"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.timestamp}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.lastMessage}</p>
        </div>
        {user.unread > 0 && (
          <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {user.unread}
          </div>
        )}
      </div>
    );
  };  const MessageBubble = ({ message, isMe }: { message: ChatMessage, isMe: boolean }) => {
    const messageId = parseInt(message.id);
    const status = messageDeliveryStatus.get(messageId);
    const [showFullTimestamp, setShowFullTimestamp] = useState(false);
    
    const getStatusIcon = () => {
      if (!isMe) return null;
      
      switch (status) {
        case 'sending':
          return <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />;
        case 'delivered':
          return <div className="text-xs opacity-70">✓</div>;
        case 'read':
          return <div className="text-xs opacity-70">✓✓</div>;
        default:
          return <div className="text-xs opacity-70">✓</div>;
      }
    };

    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        <div 
          className={`relative max-w-[70%] px-4 py-2 rounded-lg ${
            isMe 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
          }`}
          onMouseEnter={() => setShowFullTimestamp(true)}
          onMouseLeave={() => setShowFullTimestamp(false)}
        >
          <p className={`text-xs font-medium mb-1 ${
            isMe ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
          }`}>
            {message.senderName}
          </p>          <p className="text-sm">{message.text}</p>
          <div className="flex items-center justify-end mt-1">
            {getStatusIcon()}
          </div>
          
          {/* Hover tooltip with full timestamp */}
          {showFullTimestamp && message.fullTimestamp && (
            <div className={`absolute z-10 px-2 py-1 text-xs bg-black bg-opacity-75 text-white rounded shadow-lg whitespace-nowrap ${
              isMe ? 'right-0 bottom-full mb-1' : 'left-0 bottom-full mb-1'
            }`}>
              {message.fullTimestamp}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
      
      {/* Messages UI */}
      <main className="flex-1 ml-0 md:ml-64 flex">
        {/* Error message */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
            {error}
          </div>
        )}
          {/* Chat list */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 h-screen hidden sm:block">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tin nhắn</h2>
              <Button
                isIconOnly
                color="primary"
                variant="light"
                onClick={() => setShowFriendChatModal(true)}
                className="hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                <Plus size={18} />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                startContent={<Search size={18} />}
                size="sm"
                variant="bordered"
                fullWidth
              />
            </div>
            
            <div className="overflow-y-auto h-[calc(100vh-10rem)]">
              {filteredRooms.map(room => {
                const user = transformRoomToUser(room);
                return (
                  <ChatListItem 
                    key={room.id} 
                    user={user} 
                    active={room.id === activeChat} 
                    onClick={() => setActiveChat(room.id)} 
                  />
                );
              })}
                {filteredRooms.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Không tìm thấy cuộc trò chuyện nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Chat window */}
        <div className="flex-1 flex flex-col h-screen">
          {activeChatRoom ? (
            <>              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={transformRoomToUser(activeChatRoom).avatar} 
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      const chatUser = transformRoomToUser(activeChatRoom);
                      // Don't navigate if it's a group chat or own profile
                      if (activeChatRoom.isGroupChat || (currentUser && currentUser.username === chatUser.name.toLowerCase())) {
                        return;
                      }
                      const username = chatUser.name.toLowerCase().replace(/\s+/g, '');
                      navigateToProfile(username);
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium">{transformRoomToUser(activeChatRoom).name}</h2>
                      {wsConnected && (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activeChatRoom.isGroupChat ? `${activeChatRoom.participants?.length || 0} thành viên` : 'Trò chuyện riêng'}
                    </p>
                    {typingUserNames.length > 0 && (
                      <TypingIndicator users={typingUserNames} className="mt-1" />
                    )}
                  </div>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  onClick={() => setShowChatManagementModal(true)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings size={18} />
                </Button>
              </div>
                {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 pt-8 space-y-4">                {transformedMessages.length > 0 ? (
                  transformedMessages.map(message => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isMe={message.originalSenderId === currentUserId} 
                    />
                  ))) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewMessage(e.target.value);
                      // Send typing indicator
                      handleTyping(e.target.value.length > 0);
                    }}
                    fullWidth
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && !sendingMessage) {
                        handleSendMessage();
                        handleTyping(false); // Stop typing when message is sent
                      }
                    }}
                    onBlur={() => handleTyping(false)} // Stop typing when input loses focus
                    disabled={sendingMessage}
                  />
                  <Button 
                    isIconOnly 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    isLoading={sendingMessage}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chọn một cuộc trò chuyện</h3>
                <p className="text-gray-500 dark:text-gray-400">Chọn một cuộc trò chuyện từ thanh bên để bắt đầu nhắn tin</p>
              </div>
            </div>          )}
        </div>
      </main>

      {/* New Chat Modal */}
      <FriendChatModal
        isOpen={showFriendChatModal}
        onClose={() => setShowFriendChatModal(false)}
        onChatCreated={handleChatCreated}
      />      {/* Chat Management Modal */}
      {activeChatRoom && (
        <ChatManagementModal
          isOpen={showChatManagementModal}
          onClose={() => setShowChatManagementModal(false)}
          chatRoom={activeChatRoom}
          currentUserId={currentUserId}          onChatUpdated={handleChatUpdated}
          onChatDeleted={handleChatDeleted}
        />
      )}

      {/* Real-time notifications */}
      <RealTimeNotification onNotificationClick={handleNotificationClick} />
    </div>
  );
}
