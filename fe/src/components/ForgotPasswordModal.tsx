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
      const response = await fetch('http://localhost:8080/api/v1/password-reset/request', {
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
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Mail size={24} className="text-blue-600" />
            <span>Forgot Password</span>
          </div>
        </ModalHeader>        <ModalBody>
          {!success ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600">Email Sent!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  If an account with that email exists, you will receive a password reset link shortly.
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {!success ? (
            <>
              <Button variant="light" onPress={handleClose} isDisabled={loading}>
                Cancel
              </Button>              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={!email || loading}
                startContent={!loading && <Mail size={16} />}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </>
          ) : (
            <Button color="primary" onPress={handleClose}>
              Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
