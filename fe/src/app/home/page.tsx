"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Feed from "@/components/Feed";
import RightSidebar from "@/components/RightSidebar";

export default function HomePage() {
  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen min-w-screen">
      <Sidebar />
      
      {/* Main content */}      <main className="flex-1 ml-0 md:ml-64 p-4">
        <Feed />
      </main>
      
      {/* Right sidebar */}
      <RightSidebar />
    </div>
  );
}
