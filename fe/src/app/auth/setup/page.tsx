"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem, Spinner, Divider } from "@nextui-org/react";
import { User, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from "react-feather";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SetupInfo {
  email: string;
  name: string;
  provider: string;
}

interface UsernameCheckResponse {
  available: boolean;
  message?: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [setupInfo, setSetupInfo] = useState<SetupInfo | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    fetchSetupInfo();
  }, []);

  const fetchSetupInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/setup-info`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const info = await response.json();
        setSetupInfo(info);
      } else {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error fetching setup info:', error);
      router.push('/auth');
    }
  };

  const validateUsername = (username: string): string => {
    if (!username) {
      return 'Vui lòng nhập tên đăng nhập';
    }
    if (username.length < 3) {
      return 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    if (username.length > 20) {
      return 'Tên đăng nhập không được quá 20 ký tự';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Vui lòng nhập mật khẩu';
    }
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    if (password !== confirmPassword) {
      return 'Mật khẩu không khớp';
    }
    return '';
  };

  const validateGender = (gender: string): string => {
    if (!gender) {
      return 'Vui lòng chọn giới tính';
    }
    return '';
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || validateUsername(username)) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data: UsernameCheckResponse = await response.json();
      setUsernameAvailable(data.available);
      
      if (!data.available) {
        setErrors(prev => ({ ...prev, username: 'Tên đăng nhập đã được sử dụng' }));
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear previous error
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Validate and set new error if needed
    let error = '';
    switch (field) {
      case 'username':
        error = validateUsername(value);
        if (!error) {
          // Debounce username check
          setTimeout(() => checkUsernameAvailability(value), 500);
        } else {
          setUsernameAvailable(null);
        }
        break;
      case 'password':
        error = validatePassword(value);
        // Also revalidate confirm password if it's filled
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(value, formData.confirmPassword);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, value);
        break;
      case 'gender':
        error = validateGender(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    const genderError = validateGender(formData.gender);

    setErrors({
      username: usernameError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      gender: genderError
    });

    if (usernameError || passwordError || confirmPasswordError || genderError || !usernameAvailable) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/complete-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          gender: formData.gender
        }),
      });

      if (response.ok) {
        router.push('/home');
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Username already taken') {
          setErrors(prev => ({ ...prev, username: 'Tên đăng nhập đã được sử dụng' }));
          setUsernameAvailable(false);
        } else {
          setErrors(prev => ({ ...prev, username: errorData.error || 'Đã xảy ra lỗi, vui lòng thử lại' }));
        }
      }
    } catch (error) {
      console.error('Setup error:', error);
      setErrors(prev => ({ ...prev, username: 'Lỗi mạng, vui lòng thử lại' }));
    } finally {
      setLoading(false);
    }
  };

  if (!setupInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardBody className="text-center py-12">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getUsernameIcon = () => {
    if (checkingUsername) {
      return <Spinner size="sm" />;
    }
    if (usernameAvailable === true) {
      return <CheckCircle size={18} className="text-green-500" />;
    }
    if (usernameAvailable === false) {
      return <AlertCircle size={18} className="text-red-500" />;
    }
    return <User size={18} className="text-gray-400" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <Card className="max-w-md w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 shadow-lg">
              <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Hoàn tất thiết lập tài khoản
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Bạn đã xác thực thành công với Google. Vui lòng chọn tên đăng nhập và mật khẩu để hoàn tất thiết lập tài khoản của bạn.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-8 pb-8">
          {/* User Info Display */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                {setupInfo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{setupInfo.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{setupInfo.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <Input
              type="text"
              label="Tên đăng nhập"
              placeholder="Tạo tên đăng nhập"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              startContent={getUsernameIcon()}
              isInvalid={!!errors.username}
              errorMessage={errors.username}
              classNames={{
                input: "text-sm",
                inputWrapper: usernameAvailable === true 
                  ? "border-green-400 dark:border-green-500" 
                  : usernameAvailable === false 
                    ? "border-red-400 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }}
            />

            {/* Password */}
            <Input
              type={showPassword ? "text" : "password"}
              label="Mật khẩu"
              placeholder="Tạo mật khẩu"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              classNames={{
                input: "text-sm",
                inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }}
            />

            {/* Confirm Password */}
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label="Xác nhận mật khẩu"
              placeholder="Xác nhận mật khẩu mới của bạn"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              }
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              classNames={{
                input: "text-sm",
                inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }}
            />

            {/* Gender */}
            <Select
              label="Giới tính"
              placeholder="Chọn giới tính"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              variant="bordered"
              isRequired
              isDisabled={loading}
              isInvalid={!!errors.gender}
              errorMessage={errors.gender}
              classNames={{
                trigger: "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }}
            >
              <SelectItem key="MALE" value="MALE">Nam</SelectItem>
              <SelectItem key="FEMALE" value="FEMALE">Nữ</SelectItem>
              <SelectItem key="OTHER" value="OTHER">Khác</SelectItem>
            </Select>

            <Divider className="my-6" />

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              isLoading={loading}
              isDisabled={loading || !usernameAvailable || Object.values(errors).some(error => error !== '')}
              startContent={!loading && <CheckCircle size={16} />}
            >
              {loading ? 'Đang hoàn tất thiết lập...' : 'Hoàn tất thiết lập'}
            </Button>

            {/* Back to Login */}
            <Button
              variant="light"
              size="lg"
              className="w-full font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              onPress={() => router.push('/auth')}
              isDisabled={loading}
            >
              Về trang đăng nhập
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
