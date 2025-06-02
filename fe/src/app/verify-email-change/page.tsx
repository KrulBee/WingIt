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
      setError('Invalid verification link');
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
      setError(err.message || 'Failed to verify email change');
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
                <h2 className="text-xl font-semibold mb-2">Verifying Email Change</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we verify your new email address...
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
                  Email Successfully Changed!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your email address has been successfully updated. You can now use your new email address to log in.
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  color="primary" 
                  className="w-full"
                  onPress={handleGoToSettings}
                >
                  Go to Settings
                </Button>
                <Button 
                  variant="light" 
                  className="w-full"
                  onPress={handleGoHome}
                >
                  Go to Home
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <XCircle size={64} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                  Verification Failed
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
                >
                  Try Again in Settings
                </Button>
                <Button 
                  variant="light" 
                  className="w-full"
                  onPress={handleGoHome}
                >
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
