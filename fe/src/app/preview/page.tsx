'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'react-feather';
import ThemeToggle from '@/components/ThemeToggle';

export default function PreviewPage() {
  // Sample posts data for preview
  const samplePosts = [
    {
      id: 1,
      user: {
        displayName: "Minh Anh",
        username: "minh_anh_travel",
        profilePicture: null
      },
      content: "Vừa có chuyến du lịch tuyệt vời đến Hạ Long Bay! Cảnh đẹp thiên nhiên thật sự làm mình choáng ngợp. Những vịnh xanh biếc và núi đá vôi hùng vĩ tạo nên một bức tranh thiên nhiên hoàn hảo. 🏔️⛵",
      location: "Hạ Long, Quảng Ninh",
      postType: "Cảnh đẹp",
      createdDate: "2 giờ trước",
      reactions: 24,
      comments: 8,
      mediaUrls: []
    },
    {
      id: 2,
      user: {
        displayName: "Thành Đạt",
        username: "thanh_dat_food",
        profilePicture: null
      },
      content: "Hôm nay thử món bún chả Hà Nội authentic tại quán nhỏ trong ngõ. Vị đậm đà, thơm ngon không thể tả! Ai đến Hà Nội nhất định phải thử nhé! 🍜",
      location: "Hà Nội",
      postType: "Thông tin",
      createdDate: "4 giờ trước",
      reactions: 18,
      comments: 12,
      mediaUrls: []
    },
    {
      id: 3,
      user: {
        displayName: "Lan Hương",
        username: "lan_huong_saigon",
        profilePicture: null
      },
      content: "Sài Gòn về đêm luôn có một vẻ đẹp riêng. Những ánh đèn neon lung linh, tiếng còi xe hòa quyện tạo nên nhịp sống sôi động của thành phố không ngủ. ✨🌃",
      location: "Hồ Chí Minh",
      postType: "Thảo luận",
      createdDate: "6 giờ trước",
      reactions: 31,
      comments: 15,
      mediaUrls: []
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Quay lại</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                WingIt
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-xs rounded-full font-medium">
                Xem trước
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link 
              href="/auth" 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Preview Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-2">
            🎉 Chào mừng đến với WingIt!
          </h2>
          <p className="text-purple-700 dark:text-purple-300 mb-4">
            Đây là bản xem trước của trang chủ WingIt. Bạn có thể xem các bài viết mẫu để hiểu rõ hơn về cộng đồng của chúng tôi.
          </p>
          <Link 
            href="/auth" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Tham gia ngay để đăng bài và tương tác
          </Link>
        </div>

        {/* Sample Posts */}
        <div className="space-y-6">
          {samplePosts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {post.user.displayName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">
                        {post.user.displayName}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>@{post.user.username}</span>
                        <span>•</span>
                        <span>{post.createdDate}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <MoreHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* Post Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{post.location}</span>
                  </div>
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {post.postType}
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                      <Heart size={20} />
                      <span className="text-sm font-medium">{post.reactions}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                      <MessageCircle size={20} />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                  <button className="text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Thích những gì bạn thấy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Tham gia WingIt để chia sẻ những khoảnh khắc đẹp của bạn, kết nối với bạn bè và khám phá những địa điểm tuyệt vời khắp Việt Nam.
            </p>
            <Link 
              href="/auth" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Tạo tài khoản miễn phí
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-200">WingIt</span>
            </div>
            
            <div className="text-gray-600 dark:text-gray-400 text-center md:text-right">
              <p>&copy; 2024 WingIt. Tất cả quyền được bảo lưu.</p>
              <p className="text-sm mt-1">Được xây dựng với ❤️ tại Việt Nam</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
