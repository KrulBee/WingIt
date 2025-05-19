"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import { Card, CardBody, Avatar, Tabs, Tab, Button } from "@nextui-org/react";
import { User, UserCheck, UserPlus, UserX } from "react-feather";

interface FriendProps {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutualFriends?: number;
}

const friendsList: FriendProps[] = [
  {
    id: "f1",
    name: "Jane Smith",
    username: "janesmith",
    avatar: "https://i.pravatar.cc/150?u=janesmith",
    mutualFriends: 12
  },
  {
    id: "f2",
    name: "Alice Johnson",
    username: "alicej",
    avatar: "https://i.pravatar.cc/150?u=alicej",
    mutualFriends: 8
  },
  {
    id: "f3",
    name: "Robert Wilson",
    username: "robertw",
    avatar: "https://i.pravatar.cc/150?u=robertw",
    mutualFriends: 5
  },
  {
    id: "f4",
    name: "Emily Davis",
    username: "emilyd",
    avatar: "https://i.pravatar.cc/150?u=emilyd",
    mutualFriends: 3
  },
];

const friendRequests: FriendProps[] = [
  {
    id: "r1",
    name: "Michael Brown",
    username: "michaelb",
    avatar: "https://i.pravatar.cc/150?u=michaelb",
    mutualFriends: 4
  },
  {
    id: "r2",
    name: "Sophia Garcia",
    username: "sophiag",
    avatar: "https://i.pravatar.cc/150?u=sophiag",
    mutualFriends: 2
  },
];

const suggestions: FriendProps[] = [
  {
    id: "s1",
    name: "David Miller",
    username: "davidm",
    avatar: "https://i.pravatar.cc/150?u=davidm",
    mutualFriends: 7
  },
  {
    id: "s2",
    name: "Sarah Thompson",
    username: "saraht",
    avatar: "https://i.pravatar.cc/150?u=saraht",
    mutualFriends: 5
  },
  {
    id: "s3",
    name: "James Wilson",
    username: "jamesw",
    avatar: "https://i.pravatar.cc/150?u=jamesw",
    mutualFriends: 3
  },
  {
    id: "s4",
    name: "Olivia Martinez",
    username: "oliviam",
    avatar: "https://i.pravatar.cc/150?u=oliviam",
    mutualFriends: 1
  },
];

const FriendCard = ({ friend }: { friend: FriendProps }) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center mb-3">
        <Avatar src={friend.avatar} className="mr-3" size="lg" />
        <div>
          <h3 className="font-medium">{friend.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{friend.username}</p>
          {friend.mutualFriends && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {friend.mutualFriends} mutual friends
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          color="primary"
          variant="flat"
          startContent={<User size={16} />}
        >
          Profile
        </Button>
        <Button 
          size="sm" 
          color="danger"
          variant="flat"
          startContent={<UserX size={16} />}
        >
          Unfriend
        </Button>
      </div>
    </div>
  );
};

const RequestCard = ({ request }: { request: FriendProps }) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center mb-3">
        <Avatar src={request.avatar} className="mr-3" size="lg" />
        <div>
          <h3 className="font-medium">{request.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{request.username}</p>
          {request.mutualFriends && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {request.mutualFriends} mutual friends
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          color="success"
          variant="flat"
          startContent={<UserCheck size={16} />}
        >
          Accept
        </Button>
        <Button 
          size="sm" 
          color="danger"
          variant="flat"
          startContent={<UserX size={16} />}
        >
          Reject
        </Button>
      </div>
    </div>
  );
};

const SuggestionCard = ({ suggestion }: { suggestion: FriendProps }) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center mb-3">
        <Avatar src={suggestion.avatar} className="mr-3" size="lg" />
        <div>
          <h3 className="font-medium">{suggestion.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{suggestion.username}</p>
          {suggestion.mutualFriends && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {suggestion.mutualFriends} mutual friends
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          color="primary"
          startContent={<UserPlus size={16} />}
        >
          Add Friend
        </Button>
      </div>
    </div>
  );
};

export default function FriendsPage() {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Left sidebar */}
      <Sidebar />
        {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Friends</h1>
          
          <Tabs aria-label="Friend options" className="mb-6">
            <Tab key="all-friends" title={`All Friends (${friendsList.length})`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {friendsList.map((friend) => (
                  <FriendCard key={friend.id} friend={friend} />
                ))}
              </div>
            </Tab>
            <Tab key="requests" title={`Requests (${friendRequests.length})`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {friendRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </Tab>
            <Tab key="suggestions" title="Suggestions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {suggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            </Tab>
          </Tabs>
        </div>
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
