"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Settings, Search, Bell, MessageCircle, Users, Bookmark, LogOut } from "react-feather";
import ThemeToggle from "./ThemeToggle";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to auth page
    router.push('/auth');
  };
  
  const sidebarItems = [
    {
      icon: <Home size={20} />,
      label: "Home",
      href: "/home",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: <MessageCircle size={20} />,
      label: "Messages",
      href: "/messages",
    },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: <Users size={20} />,
      label: "Friends",
      href: "/friends",
    },
    {
      icon: <Search size={20} />,
      label: "Search",
      href: "/search",
    },
    {
      icon: <Bookmark size={20} />,
      label: "Bookmarks",
      href: "/bookmarks",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col">      <div className="py-4 px-3">        <Link href="/home">
          <h1 className="text-xl font-bold text-primary">WingIt</h1>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
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
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User Name</p>
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
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Logout
          </div>
        </button>
      </div>
    </div>
  );
}
