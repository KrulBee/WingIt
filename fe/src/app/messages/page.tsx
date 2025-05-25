"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, Avatar, Divider, Input, Button } from "@nextui-org/react";
import { Search, Send, Plus } from "react-feather";
import ChatService from "@/services/ChatService";

// Types matching the backend API
interface User {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
}

interface ChatRoom {
  id: number;
  roomName: string;
  description?: string;
  isGroupChat: boolean;
  createdDate: string;
  updatedDate?: string;
  participants?: User[];
}

interface Message {
  id: number;
  roomId: number;
  senderId: number;
  sender?: User;
  content: string;
  messageType: string;
  createdDate: string;
  updatedDate?: string;
}

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
  text: string;
  timestamp: string;
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
  const [currentUserId, setCurrentUserId] = useState<number>(1); // This should come from auth context

  // Fetch chat rooms on component mount
  useEffect(() => {
    fetchChatRooms();
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat]);

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
          createdDate: new Date(Date.now() - 3600000).toISOString(),
          sender: { id: 2, username: "janesmith", displayName: "Jane Smith" }
        },
        {
          id: 2,
          roomId: roomId,
          senderId: currentUserId,
          content: "I'm good! Just working on the new project",
          messageType: "TEXT",
          createdDate: new Date(Date.now() - 3000000).toISOString()
        }
      ];
      setMessages(mockMessages);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    
    try {
      setSendingMessage(true);
      const message = await ChatService.sendMessage({
        roomId: activeChat,
        content: newMessage.trim(),
        messageType: 'TEXT'
      });
      
      // Add the new message to the messages list
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Transform ChatRoom to ChatUser for UI compatibility
  const transformRoomToUser = (room: ChatRoom): ChatUser => {
    if (!room.isGroupChat && room.participants && room.participants.length > 0) {
      const otherUser = room.participants[0];
      return {
        id: room.id.toString(),
        name: otherUser.displayName || otherUser.username,
        avatar: otherUser.profilePicture || "https://i.pravatar.cc/150?u=" + otherUser.username,
        lastMessage: getLastMessageForRoom(room.id),
        timestamp: formatTimestamp(room.updatedDate || room.createdDate),
        online: Math.random() > 0.5, // Mock online status
        unread: 0 // Could be implemented with unread message API
      };
    } else {
      return {
        id: room.id.toString(),
        name: room.roomName,
        avatar: "https://i.pravatar.cc/150?u=group" + room.id,
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
    return date.toLocaleDateString();
  };

  // Transform Message to ChatMessage for UI compatibility
  const transformMessage = (message: Message): ChatMessage => ({
    id: message.id.toString(),
    senderId: message.senderId === currentUserId ? 'me' : message.senderId.toString(),
    text: message.content,
    timestamp: new Date(message.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const filteredRooms = chatRooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    if (!room.isGroupChat && room.participants && room.participants.length > 0) {
      const otherUser = room.participants[0];
      return (otherUser.displayName || otherUser.username).toLowerCase().includes(searchLower);
    }
    return room.roomName.toLowerCase().includes(searchLower);
  });

  const activeChatRoom = chatRooms.find(room => room.id === activeChat);
  const transformedMessages = messages.map(transformMessage);

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
  }

  const ChatListItem = ({ user, active, onClick }: { user: ChatUser, active: boolean, onClick: () => void }) => {
    return (
      <div 
        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${active ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        onClick={onClick}
      >
        <div className="relative">
          <Avatar src={user.avatar} className="flex-shrink-0" />
          {user.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
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
  };

  const MessageBubble = ({ message, isMe }: { message: ChatMessage, isMe: boolean }) => {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
        <div 
          className={`max-w-[70%] px-4 py-2 rounded-lg ${
            isMe 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.text}</p>
          <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.timestamp}
          </p>
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
            <div className="relative mb-4">
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                startContent={<Search size={18} />}
                size="sm"
                variant="bordered"
                fullWidth
              />
            </div>
            
            <div className="overflow-y-auto h-[calc(100vh-8rem)]">
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
                  <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Chat window */}
        <div className="flex-1 flex flex-col h-screen">
          {activeChatRoom ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <div className="flex items-center gap-3">
                  <Avatar src={transformRoomToUser(activeChatRoom).avatar} />
                  <div>
                    <h2 className="font-medium">{transformRoomToUser(activeChatRoom).name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activeChatRoom.isGroupChat ? `${activeChatRoom.participants?.length || 0} members` : 'Private chat'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transformedMessages.length > 0 ? (
                  transformedMessages.map(message => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isMe={message.senderId === 'me'} 
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No messages yet. Start a conversation!</p>
                  </div>
                )}
              </div>
              
              {/* Chat input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    fullWidth
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && !sendingMessage) handleSendMessage();
                    }}
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
