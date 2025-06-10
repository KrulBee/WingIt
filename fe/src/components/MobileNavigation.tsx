"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Settings, Search, Bell, MessageCircle, Users, Bookmark, Menu, X, LogOut } from "react-feather";
import ThemeToggle from "./ThemeToggle";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to auth page
    router.push('/auth');
    // Close the menu
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const sidebarItems = [
    {
      icon: <Home size={20} />,
      label: "Trang Chủ",
      href: "/home",
    },
    {
      icon: <User size={20} />,
      label: "Hồ Sơ",
      href: "/profile",
    },
    {
      icon: <MessageCircle size={20} />,
      label: "Tin Nhắn",
      href: "/messages",
    },
    {
      icon: <Bell size={20} />,
      label: "Thông Báo",
      href: "/notifications",
    },
    {
      icon: <Users size={20} />,
      label: "Bạn Bè",
      href: "/friends",
    },
    {
      icon: <Search size={20} />,
      label: "Tìm Kiếm",
      href: "/search",
    },
    {
      icon: <Bookmark size={20} />,
      label: "Dấu Trang",
      href: "/bookmarks",
    },
    {
      icon: <Settings size={20} />,
      label: "Cài Đặt",
      href: "/settings",
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button
          onClick={toggleMenu}
          className="bg-blue-600 dark:bg-blue-800 text-white p-3 rounded-full shadow-lg"
          aria-label="Bật/tắt menu di động"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8">
            <Link href="/home" onClick={() => setIsOpen(false)}>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">WingIt</h1>
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex-1">
            <ul className="space-y-6">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center text-lg ${
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400 font-medium"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <span className="mr-4">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
            {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="flex items-center text-lg text-gray-800 dark:text-gray-200 mt-6 border-t border-gray-200 dark:border-gray-700 pt-6"
          >
            <span className="mr-4"><LogOut size={20} /></span>
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}
