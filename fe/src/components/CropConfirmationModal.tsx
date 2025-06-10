"use client";
import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Avatar } from '@nextui-org/react';

interface CropConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  croppedImageUrl: string;
  onConfirm: () => void;
  onRetry: () => void;
  cropType: 'profile' | 'cover';
  isUploading?: boolean;
}

const CropConfirmationModal: React.FC<CropConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  croppedImageUrl,
  onConfirm,
  onRetry,
  cropType,
  isUploading = false
}) => {
  const title = cropType === 'profile' ? 'Xác nhận ảnh đại diện' : 'Xác nhận ảnh bìa';
  
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="md"
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-700"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>          <p className="text-sm text-gray-600 dark:text-gray-400">
            {cropType === 'profile' 
              ? 'Đây sẽ là ảnh đại diện mới của bạn' 
              : 'Đây sẽ là ảnh bìa mới của bạn'
            }
          </p>
        </ModalHeader>
        
        <ModalBody className="px-6">
          <div className="flex justify-center">
            {cropType === 'profile' ? (
              <Avatar
                src={croppedImageUrl}
                className="w-32 h-32 border-4 border-gray-200 dark:border-gray-700"
                radius="full"
              />
            ) : (
              <div className="w-full max-w-md">
                <div 
                  className="w-full h-32 bg-cover bg-center rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  style={{ backgroundImage: `url(${croppedImageUrl})` }}
                />
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onPress={onRetry}
            isDisabled={isUploading}          >
            Cắt lại
          </Button>
          <Button 
            color="primary" 
            onPress={onConfirm}
            isLoading={isUploading}
          >
            {isUploading ? 'Đang tải lên...' : 'Lưu'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CropConfirmationModal;
