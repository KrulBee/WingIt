"use client";
import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody
} from '@nextui-org/react';
import { Trash2, AlertTriangle } from 'react-feather';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemType: 'post' | 'comment';
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemType,
  isLoading = false
}: DeleteConfirmationModalProps) {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Trash2 size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-lg font-semibold">{title}</span>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Warning Card */}
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <CardBody className="py-3">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Hành động này không thể hoàn tác
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    {itemType === 'post' 
                      ? 'Bài viết và tất cả bình luận sẽ bị xóa vĩnh viễn'
                      : 'Bình luận sẽ bị xóa vĩnh viễn'
                    }
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Confirmation Message */}
          <div className="py-2">
            <p className="text-default-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Additional Info */}
          <div className="bg-default-100 dark:bg-default-50/10 rounded-lg p-3">
            <p className="text-xs text-default-500">
              💡 <strong>Lưu ý:</strong> Bạn có thể sử dụng tính năng chỉnh sửa thay vì xóa hoàn toàn.
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="light" 
            onPress={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button 
            color="danger" 
            onPress={handleConfirm}
            isLoading={isLoading}
            startContent={!isLoading && <Trash2 size={16} />}
          >
            {isLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
