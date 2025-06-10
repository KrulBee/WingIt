"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Settings, Search, Bell, MessageCircle, Users, Bookmark, LogOut, Shield } from "react-feather";
import { Avatar } from "@nextui-org/react";
import ThemeToggle from "./ThemeToggle";
import { UserService } from "@/services";
import AdminService from "@/services/AdminService";
import { avatarBase64 } from "@/static/images/avatarDefault";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface UserData {
  id: number;
  username: string;
  displayName?: string;
  profilePicture?: string;
  role?: string;
}

const SidebarItem = ({ icon, label, href, active }: SidebarItemProps) => {
  return (    <Link href={href}>
      <div
        className={`flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
          active ? "bg-blue-100 dark:bg-gray-800" : ""
        }`}
      >
        <div className="text-gray-700 dark:text-gray-300">{icon}</div>
        <div
          className={`text-sm font-medium ${
            active ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {label}
        </div>
      </div>
    </Link>
  );
};

export default function Sidebar() {  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Listen for profile updates (when user updates profile from settings/profile page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profile-updated') {
        fetchUserData();
      }
    };

    const handleCustomEvent = () => {
      fetchUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profile-updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profile-updated', handleCustomEvent);
    };
  }, []);
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = await UserService.getCurrentUserProfile();
      setUserData(user);      // Check if user has admin/moderator role
      try {
        const adminAccess = await AdminService.checkAdminAccess();
        setIsAdmin(adminAccess.hasAdminAccess || adminAccess.hasFullAdminAccess);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error fetching user data in sidebar:', error);
      // Don't show error in sidebar, just use fallback
      setUserData(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('auth-token');
    // Redirect to auth page
    router.push('/auth');
  };    const sidebarItems = [
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

  // Add admin menu item if user has admin access
  const adminItem = {
    icon: <Shield size={20} />,
    label: "Quản Trị",
    href: "/admin",
  };

  const menuItems = isAdmin ? [...sidebarItems, adminItem] : sidebarItems;

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col">      <div className="py-4 px-3">        <Link href="/home">
          <h1 className="text-xl font-bold text-primary">WingIt</h1>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
            />
          ))}
        </nav>
      </div>
        <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-3 mb-4">
          <div className="flex items-center">
            <Avatar
              src={userData?.profilePicture || avatarBase64}
              alt={userData?.displayName || userData?.username || "User"}
              className="w-8 h-8"
              isBordered
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {loading ? "Đang tải..." : (userData?.displayName || userData?.username || "Người dùng")}
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer w-full"
        >
          <div className="text-gray-700 dark:text-gray-300">
            <LogOut size={20} />
          </div>          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Đăng Xuất
          </div>
        </button>
      </div>
    </div>
  );
}
