'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const type = searchParams.get('type');

    if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
      return;
    }    if (token && type === 'success') {
      // Store the JWT token
      localStorage.setItem('auth-token', token);
      setStatus('success');
      setMessage('Đăng nhập thành công! Đang chuyển hướng...');
      
      // Redirect to home page
      setTimeout(() => {
        router.push('/home');
      }, 2000);
      return;
    }

    // If no token or error, redirect to auth page
    setStatus('error');
    setMessage('Phản hồi xác thực không hợp lệ');
    setTimeout(() => {
      router.push('/auth');
    }, 3000);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="text-xl font-semibold">Processing authentication...</h2>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-green-600">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-600">{message}</h2>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-red-600">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>              <h2 className="text-xl font-semibold text-red-600">Xác thực thất bại</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Đang chuyển hướng đến trang đăng nhập...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="text-xl font-semibold">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
