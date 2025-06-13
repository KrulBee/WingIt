'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthService from '@/services/AuthService';

interface SetupInfo {
  email: string;
  displayName: string;
  profilePicture: string;
  provider: string;
}

function SetupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get('token');

  const [setupInfo, setSetupInfo] = useState<SetupInfo | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!setupToken) {
      router.push('/auth');
      return;
    }

    fetchSetupInfo();
  }, [setupToken, router]);

  const fetchSetupInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/auth/oauth2/setup/info?token=${setupToken}`);
      const data = await response.json();

      if (response.ok) {
        setSetupInfo(data);
        // Pre-fill username with display name if available
        if (data.displayName) {
          setFormData(prev => ({
            ...prev,
            username: data.displayName.toLowerCase().replace(/\s+/g, '')
          }));
        }
      } else {
        setError(data.error || 'Không thể tải thông tin thiết lập');
      }
    } catch (error) {
      setError('Không thể tải thông tin thiết lập');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.username.length < 3) {
      setError('Tên người dùng phải có ít nhất 3 ký tự');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await AuthService.completeOAuth2Setup({
        setupToken: setupToken!,
        username: formData.username,
        password: formData.password
      });      if (result.success) {
        // Store the token and redirect to home
        localStorage.setItem('auth-token', result.data.token);
        router.push('/home');
      } else {
        setError(result.error || 'Không thể hoàn thành thiết lập');
      }
    } catch (error) {
      setError('Không thể hoàn thành thiết lập. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin thiết lập...</p>
        </div>
      </div>
    );
  }

  if (error && !setupInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lỗi thiết lập</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Hoàn tất thiết lập tài khoản
          </h2>          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Bạn đã xác thực thành công với {setupInfo?.provider}. 
            Vui lòng chọn tên người dùng và mật khẩu để hoàn tất tài khoản của bạn.
          </p>
        </div>

        {setupInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-3">
              {setupInfo.profilePicture && (
                <img
                  src={setupInfo.profilePicture}
                  alt="Hồ sơ"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {setupInfo.displayName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {setupInfo.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tên người dùng
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Chọn tên người dùng"
              />
            </div>

            <div>              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Tạo mật khẩu"
              />
            </div>

            <div>              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Xác nhận mật khẩu của bạn"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tạo tài khoản...
                </div>
              ) : (
                'Hoàn tất thiết lập'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/auth')}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Về trang đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <SetupPageContent />
    </Suspense>
  );
}
