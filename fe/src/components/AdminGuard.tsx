"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';
import AdminService from '@/services/AdminService';
import AuthService from '@/services/AuthService';
import ClientOnly from './ClientOnly';

interface AdminGuardProps {
  children: React.ReactNode;
  requireFullAdmin?: boolean; // If true, requires full admin (not just moderator)
  onAuthenticationComplete?: () => void; // Callback when authentication is verified
}

export default function AdminGuard({ children, requireFullAdmin = false, onAuthenticationComplete }: AdminGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient) return;
    
    const checkAdminAccess = async () => {
      try {
        console.log('AdminGuard: Starting authentication check...');
        
        // First check if user is authenticated
        if (!AuthService.isAuthenticated()) {
          console.log('AdminGuard: User not authenticated, redirecting to auth...');
          router.push('/auth');
          return;
        }

        console.log('AdminGuard: User is authenticated, checking admin access...');
        
        // Check admin access
        const access = await AdminService.checkAdminAccess();
        console.log('AdminGuard: Admin access response:', access);
        
        if (requireFullAdmin) {
          if (!access.hasFullAdminAccess) {
            console.log('AdminGuard: Full admin access required but not granted');
            setError('Truy cập bị từ chối. Cần có quyền quản trị viên đầy đủ.');
            setTimeout(() => router.push('/home'), 3000);
            return;
          }
        } else {
          if (!access.hasAdminAccess) {
            console.log('AdminGuard: Admin access required but not granted');
            setError('Truy cập bị từ chối. Cần có quyền quản trị viên hoặc kiểm duyệt viên.');
            setTimeout(() => router.push('/home'), 3000);
            return;
          }
        }        console.log('AdminGuard: Access granted, calling onAuthenticationComplete callback:', !!onAuthenticationComplete);
        setIsAuthorized(true);
        if (onAuthenticationComplete) {
          console.log('AdminGuard: Executing onAuthenticationComplete callback');
          onAuthenticationComplete();
        } else {
          console.log('AdminGuard: No onAuthenticationComplete callback provided');
        }
      } catch (error) {
        console.error('AdminGuard: Admin access check failed:', error);
        setError('Không thể xác minh quyền truy cập quản trị. Vui lòng thử lại.');
        setTimeout(() => router.push('/home'), 3000);
      }
    };

    checkAdminAccess();
  }, [router, requireFullAdmin, isClient, onAuthenticationComplete]);  // Show loading during SSR or while checking authorization
  if (!isClient || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          {isClient && <Spinner size="lg" />}
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang xác minh quyền truy cập quản trị...
          </p>
        </div>
      </div>
    );
  }
  // Show error if access denied
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
        <div className="text-center max-w-md mx-auto p-6" suppressHydrationWarning>
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>          <p className="text-sm text-gray-500 dark:text-gray-500">
            Đang chuyển hướng về trang chủ...
          </p>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
}
