'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/AuthService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has a valid token
        if (!AuthService.isAuthenticated()) {
          router.push('/auth');
          return;
        }

        // Verify token with server
        await AuthService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid token and redirect
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        router.push('/auth');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
