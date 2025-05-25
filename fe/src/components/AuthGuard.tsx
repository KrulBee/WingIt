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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
