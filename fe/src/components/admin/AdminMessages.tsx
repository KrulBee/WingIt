"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Input,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip
} from '@nextui-org/react';
import { 
  MessageCircle, 
  Search, 
  Trash2, 
  Eye, 
  User,
  Calendar,
  Hash
} from 'react-feather';
import { formatDateTime } from '@/utils/dateUtils';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderUsername: string;
  chatRoomId: number;
  isDeleted?: boolean;
}

interface AdminMessagesProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminMessages({ userRole }: AdminMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchMessages();
  }, [currentPage, searchTerm]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages?page=${currentPage - 1}&size=${itemsPerPage}&keyword=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setTotalPages(Math.ceil((data.totalElements || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch messages');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages/${selectedMessage.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMessages(messages.filter(message => message.id !== selectedMessage.id));
        onDeleteClose();
        setSelectedMessage(null);
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (message: Message) => {
    setSelectedMessage(message);
    onDeleteOpen();
  };

  const openViewModal = (message: Message) => {
    setSelectedMessage(message);
    onViewOpen();
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.senderUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageStatus = (message: Message) => {
    if (message.isDeleted) {
      return <Chip color="danger" size="sm">Đã xóa</Chip>;
    }
    return <Chip color="success" size="sm">Hoạt động</Chip>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-blue-600 dark:text-blue-400" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quản lý tin nhắn
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Xem và điều tiết các tin nhắn trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm tin nhắn hoặc người gửi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={16} />}
              className="md:max-w-md"
            />
          </div>
        </CardBody>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Messages table">
            <TableHeader>
              <TableColumn>TIN NHẮN</TableColumn>
              <TableColumn>NGƯỜI GỬI</TableColumn>
              <TableColumn>PHÒNG CHAT</TableColumn>
              <TableColumn>NGÀY GỬI</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
              <TableColumn>HÀNH ĐỘNG</TableColumn>
            </TableHeader>
            <TableBody 
              emptyContent="Không có tin nhắn nào"
              isLoading={loading}
              loadingContent="Đang tải..."
            >
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate text-sm">
                        {message.content}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-medium">
                        {message.senderUsername}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-gray-400" />
                      <span className="text-sm">
                        Room #{message.chatRoomId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm">
                        {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getMessageStatus(message)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Xem chi tiết">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => openViewModal(message)}
                        >
                          <Eye size={16} />
                        </Button>
                      </Tooltip>
                      {userRole === 'full_admin' && !message.isDeleted && (
                        <Tooltip content="Xóa tin nhắn">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => openDeleteModal(message)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center p-4">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
                showShadow
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Xóa tin nhắn</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc chắn muốn xóa tin nhắn này không?</p>
            {selectedMessage && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2">
                <p className="text-sm">{selectedMessage.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Bởi: {selectedMessage.senderUsername}
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Hủy
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteMessage}
              isLoading={deleteLoading}
            >
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalContent>
          <ModalHeader>Chi tiết tin nhắn</ModalHeader>
          <ModalBody>
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Nội dung:
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm">{selectedMessage.content}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Người gửi:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMessage.senderUsername}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Phòng chat:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Room #{selectedMessage.chatRoomId}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Ngày gửi:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(selectedMessage.createdAt)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Trạng thái:
                    </h4>
                    {getMessageStatus(selectedMessage)}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
