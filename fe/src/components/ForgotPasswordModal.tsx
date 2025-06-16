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

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async () => {
    setError('');
    setLoading(true);    try {
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
      }
    } catch (err) {
      setError('Lỗi mạng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
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
                  onChange={(e) => setEmail(e.target.value)}
                  variant="bordered"
                  isRequired
                  isDisabled={loading}
                  startContent={<Mail size={18} className="text-gray-400" />}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
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
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!email || loading}
                startContent={!loading && <Mail size={16} />}
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
