"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Feed from "@/components/Feed";
import RightSidebar from "@/components/RightSidebar";
import AuthGuard from "@/components/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen min-w-screen">
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <Feed />
          </div>
        </main>
        
        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </AuthGuard>
  );
}
