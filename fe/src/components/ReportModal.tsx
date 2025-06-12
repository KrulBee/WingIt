"use client";
import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  RadioGroup,
  Radio,
  Textarea,
  Chip
} from '@nextui-org/react';
import { Flag, AlertCircle, Shield } from 'react-feather';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description?: string) => void;
  itemType: 'post' | 'comment';
  isLoading?: boolean;
}

const REPORT_REASONS = [
  {
    value: 'Ngôn từ thô tục',
    label: 'Ngôn từ thô tục',
    description: 'Chửi bậy, lăng mạ, xúc phạm'
  },
  {
    value: 'Spam',
    label: 'Spam',
    description: 'Nội dung lặp lại, quảng cáo không mong muốn'
  },
  {
    value: 'Nội dung không phù hợp',
    label: 'Nội dung không phù hợp',
    description: 'Vi phạm quy tắc cộng đồng'
  },
  {
    value: 'Thông tin sai lệch',
    label: 'Thông tin sai lệch',
    description: 'Tin giả, thông tin không chính xác'
  },
  {
    value: 'Quấy rối',
    label: 'Quấy rối',
    description: 'Bắt nạt, đe dọa, quấy rối người khác'
  },
  {
    value: 'Khác',
    label: 'Lý do khác',
    description: 'Vấn đề khác không nằm trong danh sách trên'
  }
];

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  itemType,
  isLoading = false
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    onSubmit(selectedReason, description.trim() || undefined);
    
    // Reset form
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  const isOtherReason = selectedReason === 'Khác';
  const canSubmit = selectedReason && (!isOtherReason || description.trim());

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
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Flag size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-lg font-semibold">
              Báo cáo {itemType === 'post' ? 'bài viết' : 'bình luận'}
            </span>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CardBody className="py-3">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Giúp chúng tôi duy trì cộng đồng an toàn
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Báo cáo của bạn sẽ được xem xét trong vòng 24 giờ
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Reason Selection */}
          <div>
            <h4 className="font-medium mb-3 text-default-700">
              Vì sao bạn báo cáo {itemType === 'post' ? 'bài viết' : 'bình luận'} này?
            </h4>
            
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="gap-2"
            >
              {REPORT_REASONS.map((reason) => (
                <Radio
                  key={reason.value}
                  value={reason.value}
                  classNames={{
                    base: "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                    label: "w-full"
                  }}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-default-700">
                        {reason.label}
                      </span>
                      {reason.value === 'Ngôn từ thô tục' && (
                        <Chip size="sm" color="danger" variant="flat">
                          Phổ biến
                        </Chip>
                      )}
                    </div>
                    <p className="text-sm text-default-500 mt-1">
                      {reason.description}
                    </p>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Description for "Other" */}
          {isOtherReason && (
            <div>
              <h4 className="font-medium mb-2 text-default-700">
                Mô tả chi tiết
              </h4>
              <Textarea
                placeholder="Vui lòng mô tả cụ thể vấn đề bạn gặp phải..."
                value={description}
                onValueChange={setDescription}
                minRows={3}
                maxRows={5}
                maxLength={500}
                classNames={{
                  input: "resize-none"
                }}
              />
              <p className="text-xs text-default-400 mt-1">
                {description.length}/500 ký tự
              </p>
            </div>
          )}

          {/* Warning */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <CardBody className="py-3">
              <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Lưu ý:</strong> Báo cáo sai có thể ảnh hưởng đến uy tín tài khoản của bạn.
                </p>
              </div>
            </CardBody>
          </Card>
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
            color="warning" 
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!canSubmit}
            startContent={!isLoading && <Flag size={16} />}
          >
            {isLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
