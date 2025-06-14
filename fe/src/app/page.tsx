'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { MapPin, Users, MessageCircle, Heart, Camera, Globe } from "react-feather";
import "./test.css";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('user');
    if (user) {
      // If logged in, redirect to home feed
      router.push('/home');
    }
  }, [router]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              WingIt
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/auth"
              className="px-6 py-2 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-full font-medium hover:shadow-lg transition-all duration-300 border border-purple-200 dark:border-purple-700"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Chào mừng đến với
            <br />
            <span className="text-6xl md:text-8xl">WingIt</span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Kết nối và chia sẻ những khoảnh khắc đẹp nhất của bạn với cộng đồng Việt Nam.
            Khám phá những địa điểm tuyệt vời và tạo nên những kỷ niệm đáng nhớ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/auth"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Bắt đầu ngay
            </Link>
            <Link
              href="/preview"
              className="px-8 py-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 font-bold rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-200 dark:border-purple-700"
            >
              Xem trước
            </Link>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 text-purple-600 dark:text-purple-400 font-medium rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Khám phá Việt Nam</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Chia sẻ và khám phá những địa điểm tuyệt vời khắp 63 tỉnh thành Việt Nam.
              Từ những cảnh đẹp thiên nhiên đến những món ăn đặc sản địa phương.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Kết nối bạn bè</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Tìm kiếm và kết nối với những người bạn mới có cùng sở thích.
              Tạo nên những mối quan hệ bền vững và ý nghĩa.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Camera className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Chia sẻ khoảnh khắc</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Lưu giữ và chia sẻ những khoảnh khắc đẹp nhất của cuộc sống.
              Hỗ trợ hình ảnh, video và nhiều định dạng khác.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl mb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">63</div>
              <div className="text-gray-600 dark:text-gray-400">Tỉnh thành Việt Nam</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">∞</div>
              <div className="text-gray-600 dark:text-gray-400">Khoảnh khắc đáng nhớ</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Miễn phí sử dụng</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Sẵn sàng bắt đầu hành trình?
          </h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tham gia cộng đồng WingIt ngay hôm nay và khám phá những điều tuyệt vời đang chờ đợi bạn.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <Globe className="mr-3" size={24} />
            Tham gia ngay
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
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
        
        <div className="mt-12">
          <Link href="/home" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">
            Go to Home Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
