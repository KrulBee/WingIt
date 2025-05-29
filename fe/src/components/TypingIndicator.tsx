"use client";
import React from 'react';

interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

export default function TypingIndicator({ users, className = '' }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} đang nhập...`;
    } else if (users.length === 2) {
      return `${users[0]} và ${users[1]} đang nhập...`;
    } else {
      return `${users[0]} và ${users.length - 1} người khác đang nhập...`;
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-xs">{getTypingText()}</span>
    </div>
  );
}
