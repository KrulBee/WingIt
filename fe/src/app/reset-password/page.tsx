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
      setError('Invalid reset link');
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
        setError('Invalid or expired reset link');
      }
    } catch (err) {
      setError('Failed to validate reset link');
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
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
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
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
            <p>Validating reset link...</p>
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
              <h2 className="text-xl font-semibold text-red-600">Invalid Reset Link</h2>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button 
              color="primary" 
              onPress={() => router.push('/auth')}
            >
              Back to Login
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
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-green-600">Password Reset Successful!</h2>
              <p className="text-sm text-gray-600 mt-2">
                Your password has been successfully reset. You will be redirected to the login page shortly.
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
            </div>
            <h2 className="text-2xl font-bold">Reset Your Password</h2>
            <p className="text-sm text-gray-600">Enter your new password below</p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              startContent={<Lock size={18} className="text-gray-400" />}
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your new password"
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
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <Button
                variant="light"
                className="w-full"
                onPress={() => router.push('/auth')}
                isDisabled={loading}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
