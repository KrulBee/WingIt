"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Avatar, Button } from "@nextui-org/react";
import Link from "next/link";
import { useProfileNavigation } from "@/utils/profileNavigation";
import { AuthService } from "@/services";
import FollowService from "@/services/FollowService";
import ViewAnalytics from "./ViewAnalytics";
import LocationViewStats from "./LocationViewStats";



const SuggestedUsers = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<number>>(new Set());
  const { navigateToProfile } = useProfileNavigation();

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      // Load following status
      await loadFollowingStatus();
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const loadFollowingStatus = async () => {
    try {
      const following = await FollowService.getFollowing();
      const followingIds = new Set(following.map(f => f.following.id));
      setFollowingUsers(followingIds);
    } catch (error) {
      console.error('Error loading following status:', error);
    }
  };

  const handleFollowToggle = async (userId: number) => {
    if (!currentUser || currentUser.id === userId) return;

    try {
      setFollowLoading(prev => new Set([...prev, userId]));
      
      const isCurrentlyFollowing = followingUsers.has(userId);
      
      if (isCurrentlyFollowing) {
        await FollowService.unfollowUser(userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await FollowService.followUser(userId);
        setFollowingUsers(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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
              </div>

              {currentUser && currentUser.id !== user.id && (
                <Button
                  size="sm"
                  color={followingUsers.has(user.id) ? "default" : "primary"}
                  variant={followingUsers.has(user.id) ? "flat" : "solid"}
                  onClick={() => handleFollowToggle(user.id)}
                  isLoading={followLoading.has(user.id)}
                  className="text-xs px-3 py-1"
                >
                  {followingUsers.has(user.id) ? "Following" : "Follow"}
                </Button>
              )}
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
          </svg>        </div>
        <LocationViewStats />
        <ViewAnalytics />
        <SuggestedUsers />
      </div>
    </div>
  );
}
