"use client";
import React from 'react';

export type OnlineStatus = 'online' | 'away' | 'busy' | 'offline';

interface OnlineStatusIndicatorProps {
  status: OnlineStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function OnlineStatusIndicator({ 
  status, 
  size = 'md', 
  showText = false,
  className = '' 
}: OnlineStatusIndicatorProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Trực tuyến';
      case 'away':
        return 'Vắng mặt';
      case 'busy':
        return 'Bận';
      case 'offline':
      default:
        return 'Ngoại tuyến';
    }
  };

  const shouldAnimate = status === 'online';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div 
        className={`
          ${getSizeClasses()} 
          ${getStatusColor()} 
          rounded-full 
          border-2 
          border-white 
          dark:border-gray-900
          ${shouldAnimate ? 'animate-pulse' : ''}
        `}
      />
      {showText && (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </span>
      )}
    </div>
  );
}
