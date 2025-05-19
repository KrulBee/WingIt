"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardBody, Avatar, Divider, Input, Button } from "@nextui-org/react";
import { Search, Send } from "react-feather";

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

const chatUsers: ChatUser[] = [
  {
    id: "u1",
    name: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?u=janesmith",
    lastMessage: "Are we still meeting tomorrow?",
    timestamp: "12:45 PM",
    online: true,
    unread: 2
  },
  {
    id: "u2",
    name: "Robert Wilson",
    avatar: "https://i.pravatar.cc/150?u=robertw",
    lastMessage: "I'll send you the files later today",
    timestamp: "10:32 AM",
    online: true,
    unread: 0
  },
  {
    id: "u3",
    name: "Alice Johnson",
    avatar: "https://i.pravatar.cc/150?u=alicej",
    lastMessage: "Thanks for your help!",
    timestamp: "Yesterday",
    online: false,
    unread: 0
  },
  {
    id: "u4",
    name: "Michael Brown",
    avatar: "https://i.pravatar.cc/150?u=michaelb",
    lastMessage: "Let me know when you're free to discuss the project",
    timestamp: "Yesterday",
    online: false,
    unread: 0
  },
  {
    id: "u5",
    name: "Emily Davis",
    avatar: "https://i.pravatar.cc/150?u=emilyd",
    lastMessage: "Did you see the new design?",
    timestamp: "Monday",
    online: true,
    unread: 0
  }
];

// Sample chat history
const chatHistory: { [key: string]: ChatMessage[] } = {
  "u1": [
    { id: "m1", senderId: "u1", text: "Hey, how are you?", timestamp: "12:30 PM" },
    { id: "m2", senderId: "me", text: "I'm good! Just working on the new project", timestamp: "12:32 PM" },
    { id: "m3", senderId: "u1", text: "That sounds great! How's it going?", timestamp: "12:35 PM" },
    { id: "m4", senderId: "me", text: "It's challenging but I'm making progress", timestamp: "12:38 PM" },
    { id: "m5", senderId: "u1", text: "Are we still meeting tomorrow?", timestamp: "12:45 PM" },
  ],
  "u2": [
    { id: "m1", senderId: "me", text: "Hi Robert, did you get a chance to review the documents?", timestamp: "10:15 AM" },
    { id: "m2", senderId: "u2", text: "Yes, I'm going through them now", timestamp: "10:20 AM" },
    { id: "m3", senderId: "me", text: "Great! Let me know if you have any questions", timestamp: "10:25 AM" },
    { id: "m4", senderId: "u2", text: "Sure, just one thing about section 3...", timestamp: "10:30 AM" },
    { id: "m5", senderId: "u2", text: "I'll send you the files later today", timestamp: "10:32 AM" },
  ]
};

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

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState<string>(chatUsers[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredUsers = chatUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const activeChatUser = chatUsers.find(user => user.id === activeChat);
  const messages = chatHistory[activeChat] || [];
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, we would send this to an API
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };
  
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
      
      {/* Messages UI */}      <main className="flex-1 ml-0 md:ml-64 flex">
        {/* Chat list */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 h-screen hidden sm:block">
          <div className="p-4">
            <div className="relative mb-4">              <Input
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
              {filteredUsers.map(user => (
                <ChatListItem 
                  key={user.id} 
                  user={user} 
                  active={user.id === activeChat} 
                  onClick={() => setActiveChat(user.id)} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Chat window */}
        <div className="flex-1 flex flex-col h-screen">
          {activeChatUser && (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <div className="flex items-center gap-3">
                  <Avatar src={activeChatUser.avatar} />
                  <div>
                    <h2 className="font-medium">{activeChatUser.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activeChatUser.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isMe={message.senderId === 'me'} 
                  />
                ))}
              </div>
              
              {/* Chat input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    fullWidth
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <Button 
                    isIconOnly 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
