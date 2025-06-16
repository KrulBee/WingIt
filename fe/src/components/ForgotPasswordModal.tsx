"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from "@nextui-org/react";
import { Mail, CheckCircle } from "react-feather";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Vui lòng nhập địa chỉ email';
    }
    if (!emailRegex.test(email)) {
      return 'Định dạng email không hợp lệ';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleSubmit = async () => {
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setError('');
    setEmailError('');
    setLoading(true);try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Không thể gửi email đặt lại mật khẩu');
      }    } catch (error) {
      console.error('Error sending password reset email:', error);
      setError('Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setEmail('');
    setError('');
    setEmailError('');
    setSuccess(false);
    onClose();
  };
  return (    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="md"
      classNames={{
        wrapper: "z-[9999]", // Ensure modal appears above everything
        backdrop: "z-[9998]",
        base: "z-[9999]"
      }}
      backdrop="blur"
      isDismissable={true}
      isKeyboardDismissDisabled={false}
    >
      <ModalContent>        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Mail size={24} className="text-blue-600" />
            <span>Quên mật khẩu</span>
          </div>
        </ModalHeader><ModalBody>
          {!success ? (
            <div className="space-y-4">              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
                </p>
                  <Input
                  type="email"
                  label="Địa chỉ email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={handleEmailChange}
                  variant="bordered"
                  isRequired
                  isDisabled={loading}
                  startContent={<Mail size={18} className="text-gray-400" />}
                  isInvalid={!!emailError}
                  errorMessage={emailError}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                  }}
                />
              </div>              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                    <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle size={48} className="text-green-500" />
              </div>              <div>
                <h3 className="text-lg font-semibold text-green-600">Email đã được gửi!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Nếu tài khoản với email đó tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu trong thời gian ngắn.
                  Vui lòng kiểm tra hộp thư đến và thư mục spam.
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {!success ? (
            <>              <Button variant="light" onPress={handleClose} isDisabled={loading}>
                Hủy
              </Button>              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!email || !!emailError || loading}
                startContent={!loading && <Mail size={16} />}
                className="font-semibold"
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </Button>
            </>          ) : (            <Button color="primary" onPress={handleClose}>
              Đóng
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
