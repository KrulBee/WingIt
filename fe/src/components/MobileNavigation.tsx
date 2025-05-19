"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, Search, Bell, MessageCircle, Users, Bookmark, Menu, X } from "react-feather";
import ThemeToggle from "./ThemeToggle";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
    <>
      {/* Mobile menu button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button
          onClick={toggleMenu}
          className="bg-blue-600 dark:bg-blue-800 text-white p-3 rounded-full shadow-lg"
          aria-label="Toggle mobile menu"
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Social Platform</h1>
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

          <div className="mt-auto pt-6 border-t border-gray-300 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="ml-3">
                <p className="font-medium text-gray-900 dark:text-white">User Name</p>
                <button className="text-sm text-red-600 dark:text-red-400">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
