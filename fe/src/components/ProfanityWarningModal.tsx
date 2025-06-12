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
  CardBody,
  Chip
} from '@nextui-org/react';
import { AlertTriangle, Edit3, X } from 'react-feather';

interface ProfanityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  content: string;
  toxicSpans?: number[][];
  confidence?: number;
  type?: 'post' | 'comment';
}

export default function ProfanityWarningModal({
  isOpen,
  onClose,
  onEdit,
  content,
  toxicSpans = [],
  confidence = 0,
  type = 'post'
}: ProfanityWarningModalProps) {
  
  const contentType = type === 'post' ? 'bài viết' : 'bình luận';
  
  const highlightToxicContent = (text: string, spans: number[][]) => {
    if (spans.length === 0) return text;
    
    let result = [];
    let lastIndex = 0;
    
    spans.forEach(([start, end], index) => {
      // Add text before toxic span
      if (start > lastIndex) {
        result.push(
          <span key={`normal-${index}`}>
            {text.slice(lastIndex, start)}
          </span>
        );
      }
      
      // Add highlighted toxic span
      result.push(
        <span 
          key={`toxic-${index}`}
          className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1 rounded"
        >
          {text.slice(start, end)}
        </span>
      );
      
      lastIndex = end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(
        <span key="final">
          {text.slice(lastIndex)}
        </span>
      );
    }
    
    return result;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      hideCloseButton
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">
                Nội dung không phù hợp
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                {contentType.charAt(0).toUpperCase() + contentType.slice(1)} của bạn chứa từ ngữ không phù hợp
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">


            {/* Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                📋 Hướng dẫn cộng đồng
              </h4>
              <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Tránh sử dụng ngôn từ thô tục, xúc phạm</li>
                <li>• Tôn trọng quan điểm và ý kiến của người khác</li>
                <li>• Tạo nên môi trường tích cực và thân thiện</li>
                <li>• Đóng góp nội dung có giá trị cho cộng đồng</li>
              </ul>
            </div>

            {/* Action Notice */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vui lòng chỉnh sửa nội dung và thử lại. {contentType.charAt(0).toUpperCase() + contentType.slice(1)} của bạn chưa được đăng.
              </p>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            startContent={<X size={16} />}
          >
            Hủy bỏ
          </Button>
          <Button 
            color="primary" 
            onPress={onEdit}
            startContent={<Edit3 size={16} />}
          >
            Chỉnh sửa {contentType}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
