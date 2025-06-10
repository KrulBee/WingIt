"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input, Spinner } from "@nextui-org/react";
import { Lock, CheckCircle, AlertCircle } from "react-feather";

export default function ResetPasswordPage() {
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
      const response = await fetch(`http://localhost:8080/api/v1/password-reset/validate/${token}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setTokenValid(true);
      } else {
        setError('Liên kết đặt lại không hợp lệ hoặc đã hết hạn');
      }
    } catch (err) {
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
      const response = await fetch('http://localhost:8080/api/v1/password-reset/reset', {
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
      }
    } catch (err) {
      setError('Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardBody className="text-center space-y-4">
            <Spinner size="lg" />
            <p>Đang xác minh liên kết đặt lại...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardBody className="text-center space-y-4">
            <AlertCircle size={48} className="text-red-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-red-600">Liên kết đặt lại không hợp lệ</h2>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>            <Button 
              color="primary" 
              onPress={() => router.push('/auth')}
            >
              Về trang đăng nhập
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardBody className="text-center space-y-4">
            <CheckCircle size={48} className="text-green-500 mx-auto" />            <div>
              <h2 className="text-xl font-semibold text-green-600">Đặt lại mật khẩu thành công!</h2>
              <p className="text-sm text-gray-600 mt-2">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-3">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Lock size={24} className="text-blue-600" />
            </div>            <h2 className="text-2xl font-bold">Đặt lại mật khẩu của bạn</h2>
            <p className="text-sm text-gray-600">Nhập mật khẩu mới bên dưới</p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">            <Input
              type="password"
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới của bạn"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              startContent={<Lock size={18} className="text-gray-400" />}
            />            <Input
              type="password"
              label="Xác nhận mật khẩu"
              placeholder="Xác nhận mật khẩu mới của bạn"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              startContent={<Lock size={18} className="text-gray-400" />}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={loading}
                isDisabled={!passwordForm.newPassword || !passwordForm.confirmPassword || loading}
                startContent={!loading && <Lock size={16} />}
              >
                {loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
              </Button>              <Button
                variant="light"
                className="w-full"
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
