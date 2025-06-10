"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, Button, Spinner } from "@nextui-org/react";
import { CheckCircle, XCircle, Mail } from "react-feather";
import { UserService } from "@/services";

export default function VerifyEmailChangePage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Liên kết xác minh không hợp lệ');
      setLoading(false);
      return;
    }

    verifyEmailChange();
  }, [token]);

  const verifyEmailChange = async () => {
    try {
      setLoading(true);
      await UserService.verifyEmailChange(token!);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Không thể xác minh thay đổi email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSettings = () => {
    router.push('/settings');
  };

  const handleGoHome = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="text-center space-y-6 p-8">
          {loading ? (
            <>
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Đang xác minh thay đổi email</h2>                <p className="text-gray-600 dark:text-gray-400">
                  Vui lòng đợi trong khi chúng tôi xác minh địa chỉ email mới của bạn...
                </p>
              </div>
            </>
          ) : success ? (
            <>
              <div className="flex justify-center">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-600 mb-2">
                  Email đã được thay đổi thành công!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Địa chỉ email của bạn đã được cập nhật thành công. Bây giờ bạn có thể sử dụng địa chỉ email mới để đăng nhập.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  color="primary" 
                  className="w-full"
                  onPress={handleGoToSettings}                >                  Đi tới Cài đặt
                </Button>
                <Button 
                  variant="light" 
                  className="w-full"
                  onPress={handleGoHome}
                >
                  Về trang chủ
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <XCircle size={64} className="text-red-500" />
              </div>
              <div>                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Xác minh thất bại
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error}
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  color="primary" 
                  className="w-full"
                  onPress={handleGoToSettings}
                >                  Thử lại trong Cài đặt
                </Button>
                <Button 
                  variant="light" 
                  className="w-full"
                  onPress={handleGoHome}
                >
                  Về trang chủ
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
