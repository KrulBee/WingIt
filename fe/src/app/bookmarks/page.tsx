"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Spinner, Button } from '@nextui-org/react';
import { Bookmark } from 'react-feather';
import { useRouter } from 'next/navigation';
import BookmarkService, { BookmarkData } from '@/services/BookmarkService';
import Post from '@/components/Post';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import AuthGuard from '@/components/AuthGuard';


function BookmarksContent() {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const userBookmarks = await BookmarkService.getUserBookmarks();
      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setError('Không thể tải danh sách bài viết đã lưu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bookmark size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">Bài viết đã lưu</h1>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6">
          <CardBody className="text-center py-8">
            <p className="text-danger mb-4">{error}</p>
            <Button color="primary" onPress={loadBookmarks}>
              Thử lại
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!error && bookmarks.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-default-100 rounded-full">
                <Bookmark size={32} className="text-default-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-default-700 mb-2">
                  Chưa có bài viết nào được lưu
                </h3>
                <p className="text-default-500 text-sm">
                  Nhấn vào biểu tượng bookmark trên bài viết để lưu lại những nội dung thú vị
                </p>
              </div>
              <Button
                color="primary"
                variant="flat"
                onPress={() => router.push('/home')}
              >
                Khám phá bài viết
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Bookmarks List */}
      {!error && bookmarks.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-default-500 mb-4">
            {bookmarks.length} bài viết đã lưu
          </div>

          {bookmarks.map((bookmark) => {
            const post = bookmark.post;
            if (!post) return null;

            return (
              <Post
                key={bookmark.id}
                id={post.id.toString()}
                authorName={post.user?.displayName || post.user?.username || 'Unknown'}
                authorUsername={post.user?.username || 'unknown'}
                authorAvatar={post.user?.profilePicture || ''}
                content={post.content}
                image=""
                images={post.mediaUrls || []}
                likes={post.likesCount || 0}
                dislikes={post.dislikesCount || 0}
                comments={post.commentsCount || 0}
                createdAt={new Date(post.createdDate)}
                liked={false}
                disliked={false}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <AuthGuard>
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen min-w-screen">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 ml-0 md:ml-64 p-4 lg:pr-80">
          <div className="max-w-2xl mx-auto">
            <BookmarksContent />
          </div>
        </main>

        {/* Right sidebar */}
        <RightSidebar />
      </div>
    </AuthGuard>
  );
}