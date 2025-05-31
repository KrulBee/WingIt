"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ViewAnalytics from "./ViewAnalytics";
import LocationViewStats from "./LocationViewStats";

export default function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <div className="w-80 h-screen fixed right-0 top-0 p-4 hidden lg:block overflow-y-auto">
      <div className="sticky top-4 space-y-4">
        <div className="relative mb-4">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 pl-8 rounded-full border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none"
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
          </form>
        </div>
        <LocationViewStats />
        <ViewAnalytics />
      </div>
    </div>
  );
}
