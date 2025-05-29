"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Avatar } from "@nextui-org/react";
import Link from "next/link";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";

const TrendingTopics = () => {  const trends = [
    { id: 1, topic: "Công Nghệ", posts: 1234 },
    { id: 2, topic: "Thể Thao", posts: 890 },
    { id: 3, topic: "Giải Trí", posts: 567 },
    { id: 4, topic: "Chính Trị", posts: 456 },
    { id: 5, topic: "Khoa Học", posts: 345 },
  ];

  return (
    <Card className="mb-4 border border-gray-200 dark:border-gray-700">      <CardHeader className="pb-0">
        <h3 className="text-lg font-medium">Chủ Đề Xu Hướng</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {trends.map((trend) => (
            <div key={trend.id}>
              <Link href={`/search?q=${trend.topic}`}>
                <p className="text-sm font-medium hover:text-primary transition-colors">
                  #{trend.topic}
                </p>
              </Link>
              <p className="text-xs text-gray-500">{trend.posts} bài viết</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

const SuggestedUsers = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { navigateToProfile } = useProfileNavigation();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleAvatarClick = (username: string) => {
    // Don't navigate if clicking on own avatar
    if (currentUser && currentUser.username === username) {
      return;
    }
    navigateToProfile(username);
  };

  const suggestions = [
    { id: 1, name: "Jane Smith", username: "janesmith", avatar: "https://i.pravatar.cc/150?u=janesmith" },
    { id: 2, name: "John Doe", username: "johndoe", avatar: "https://i.pravatar.cc/150?u=johndoe" },
    { id: 3, name: "Alice Johnson", username: "alicej", avatar: "https://i.pravatar.cc/150?u=alicej" },
  ];

  return (
    <Card className="border border-gray-200 dark:border-gray-700">      <CardHeader className="pb-0">
        <h3 className="text-lg font-medium">Gợi Ý Theo Dõi</h3>
      </CardHeader>
      <CardBody>        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar 
                  src={user.avatar} 
                  size="sm" 
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleAvatarClick(user.username)}
                />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div><button className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                Theo Dõi
              </button>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default function RightSidebar() {
  return (
    <div className="w-80 h-screen fixed right-0 top-0 p-4 hidden lg:block overflow-y-auto">
      <div className="sticky top-4 space-y-4">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full p-2 pl-8 rounded-full border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <TrendingTopics />
        <SuggestedUsers />
      </div>
    </div>
  );
}
