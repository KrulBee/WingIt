"use client";
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Card,
  CardBody,
  Chip
} from '@nextui-org/react';
import { Edit3, Save, AlertCircle } from 'react-feather';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent: string;
  itemType: 'post' | 'comment';
  isLoading?: boolean;
}

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  initialContent,
  itemType,
  isLoading = false
}: EditModalProps) {
  const [content, setContent] = useState(initialContent);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset content when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setHasChanges(false);
    }
  }, [isOpen, initialContent]);

  // Track changes
  useEffect(() => {
    setHasChanges(content.trim() !== initialContent.trim());
  }, [content, initialContent]);

  const handleSave = () => {
    if (!content.trim() || !hasChanges) return;
    onSave(content.trim());
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const maxLength = itemType === 'post' ? 2000 : 500;
  const isContentValid = content.trim().length > 0 && content.length <= maxLength;
  const canSave = isContentValid && hasChanges && !isLoading;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Edit3 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-lg font-semibold">
              Chỉnh sửa {itemType === 'post' ? 'bài viết' : 'bình luận'}
            </span>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-default-700">
                Nội dung {itemType === 'post' ? 'bài viết' : 'bình luận'}
              </h4>
              {hasChanges && (
                <Chip size="sm" color="warning" variant="flat">
                  Có thay đổi
                </Chip>
              )}
            </div>
            
            <Textarea
              value={content}
              onValueChange={setContent}
              placeholder={`Nhập nội dung ${itemType === 'post' ? 'bài viết' : 'bình luận'}...`}
              minRows={itemType === 'post' ? 4 : 3}
              maxRows={itemType === 'post' ? 8 : 6}
              maxLength={maxLength}
              classNames={{
                input: "resize-none"
              }}
              isInvalid={!isContentValid && content.length > 0}
              errorMessage={
                content.length > maxLength 
                  ? `Nội dung không được vượt quá ${maxLength} ký tự`
                  : content.trim().length === 0 && content.length > 0
                  ? 'Nội dung không được để trống'
                  : undefined
              }
            />
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-default-400">
                {content.length}/{maxLength} ký tự
              </p>
              
              {isContentValid && (
                <div className="flex items-center gap-1 text-xs text-success">
                  <span>✓</span>
                  <span>Nội dung hợp lệ</span>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <CardBody className="py-3">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                    Lưu ý khi chỉnh sửa
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Tránh sử dụng ngôn từ thô tục hoặc không phù hợp</li>
                    <li>• Đảm bảo nội dung có ý nghĩa và liên quan đến chủ đề</li>
                    <li>• Thời gian chỉnh sửa sẽ được hiển thị cho người khác</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Original Content Preview */}
          {hasChanges && (
            <div>
              <h4 className="font-medium text-default-700 mb-2">
                Nội dung gốc
              </h4>
              <Card className="bg-default-100 dark:bg-default-50/10">
                <CardBody className="py-3">
                  <p className="text-sm text-default-600 whitespace-pre-wrap">
                    {initialContent}
                  </p>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="light" 
            onPress={handleClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button 
            color="primary" 
            onPress={handleSave}
            isLoading={isLoading}
            isDisabled={!canSave}
            startContent={!isLoading && <Save size={16} />}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
