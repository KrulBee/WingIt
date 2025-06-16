"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input, Spinner } from "@nextui-org/react";
import { Lock, CheckCircle, AlertCircle } from "react-feather";

function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      validateToken(resetToken);
    } else {
      setError('Liên kết đặt lại không hợp lệ');
      setValidating(false);
    }
  }, [searchParams]);
  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/password-reset/validate/${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
      } else {
        setError('Liên kết đặt lại không hợp lệ hoặc đã hết hạn');
      }    } catch (error) {
      console.error('Error validating token:', error);
      setError('Không thể xác thực liên kết đặt lại mật khẩu');
    } finally {
      setValidating(false);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      } else {
        setError(data.error || 'Không thể đặt lại mật khẩu');
      }    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardBody className="text-center space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Lock size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <Spinner size="lg" color="primary" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Đang xác minh liên kết
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Vui lòng chờ trong giây lát...
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardBody className="text-center space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                  Liên kết không hợp lệ
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  {error || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'}
                </p>
              </div>
              <Button 
                color="danger"
                variant="solid"
                size="lg"
                className="mt-4 font-medium"
                onPress={() => router.push('/auth')}
              >
                Về trang đăng nhập
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardBody className="text-center space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                  Đặt lại mật khẩu thành công!
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
                </p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300">
                  Đang chuyển hướng... ⏳
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 shadow-lg">
              <Lock size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Đặt lại mật khẩu
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Nhập mật khẩu mới để bảo mật tài khoản của bạn
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="password"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới của bạn"
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                variant="bordered"
                isRequired
                isDisabled={loading}
                startContent={<Lock size={18} className="text-gray-400" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                }}
              />

              <Input
                type="password"
                label="Xác nhận mật khẩu"
                placeholder="Xác nhận mật khẩu mới của bạn"
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                variant="bordered"
                isRequired
                isDisabled={loading}
                startContent={<Lock size={18} className="text-gray-400" />}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                }}
              />
            </div>

            {/* Password requirements */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                Yêu cầu mật khẩu:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={passwordForm.newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}>
                    {passwordForm.newPassword.length >= 8 ? "✓" : "○"}
                  </span>
                  Ít nhất 8 ký tự
                </li>
                <li className="flex items-center gap-2">
                  <span className={passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? "text-green-600" : "text-gray-400"}>
                    {passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword ? "✓" : "○"}
                  </span>
                  Mật khẩu khớp nhau
                </li>
              </ul>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                isLoading={loading}
                isDisabled={!passwordForm.newPassword || !passwordForm.confirmPassword || loading || passwordForm.newPassword !== passwordForm.confirmPassword || passwordForm.newPassword.length < 8}
                startContent={!loading && <Lock size={16} />}
              >
                {loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
              </Button>

              <Button
                variant="light"
                size="lg"
                className="w-full font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                onPress={() => router.push('/auth')}
                isDisabled={loading}
              >
                Về trang đăng nhập
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardBody className="px-8 py-12">
            <div className="animate-pulse space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2 text-center">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mx-auto"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
