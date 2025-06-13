"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Feed from "@/components/Feed";
import RightSidebar from "@/components/RightSidebar";
import AuthGuard from "@/components/AuthGuard";
import { FeedProvider } from "@/contexts/FeedContext";

function HomePageContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');
  const highlight = searchParams.get('highlight') === 'true';
  return (
    <AuthGuard>
      <FeedProvider>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen min-w-screen">
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
            <div className="max-w-2xl mx-auto">
              <Feed highlightPostId={postId && highlight ? postId : undefined} />
            </div>
          </main>

          {/* Right sidebar */}
          <RightSidebar />
        </div>
      </FeedProvider>
    </AuthGuard>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
