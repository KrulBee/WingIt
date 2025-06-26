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
  return (
    <Link href={href} className="block">
      <div
        className={`wingit-nav-item group ${
          active ? "wingit-nav-item-active" : ""
        }`}
      >
        <div className={`transition-all duration-200 ${
          active ? "text-white" : "text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
        }`}>
          {icon}
        </div>
        <div
          className={`text-sm font-medium transition-all duration-200 ${
            active
              ? "text-white"
              : "text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          }`}
        >
          {label}
        </div>
        {active && (
          <div className="ml-auto w-1 h-4 bg-white rounded-full opacity-80"></div>
        )}
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
    // Skip authentication during setup flow
    if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/setup')) {
      console.log('ℹ️ On setup page, skipping sidebar user data fetch');
      setLoading(false);
      return;
    }
    
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
    <div className="w-64 h-screen fixed left-0 top-0 wingit-sidebar p-4 flex flex-col z-40">
      {/* Brand Header */}
      <div className="py-4 px-3 mb-2">
        <Link href="/home" className="group">
          <div className="flex items-center">
            <h1 className="text-xl font-bold wingit-gradient-text group-hover:scale-105 transition-transform duration-200">
              WingIt
            </h1>
          </div>
        </Link>
      </div>
      
      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <div
              key={item.href}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SidebarItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={pathname === item.href}
              />
            </div>
          ))}
        </nav>
      </div>
      {/* User Profile Section */}
      <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between px-3 mb-4">
          <div className="flex items-center min-w-0 flex-1">
            <Avatar
              src={userData?.profilePicture || avatarBase64}
              alt={userData?.displayName || userData?.username || "User"}
              className="w-10 h-10 wingit-avatar"
              isBordered
            />
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {loading ? (
                  <span className="shimmer bg-gray-200 dark:bg-dark-700 rounded h-4 w-20 block"></span>
                ) : (
                  userData?.displayName || userData?.username || "Người dùng"
                )}
              </p>
              {!loading && isAdmin && (
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  Quản trị viên
                </span>
              )}
            </div>
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          className="wingit-nav-item w-full text-left hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-600 dark:hover:text-danger-400 group"
        >
          <div className="text-gray-600 dark:text-gray-400 group-hover:text-danger-600 dark:group-hover:text-danger-400 transition-colors duration-200">
            <LogOut size={20} />
          </div>
          <div className="text-sm font-medium">
            Đăng Xuất
          </div>
        </button>
      </div>
    </div>
  );
}
