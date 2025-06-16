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
  Hash, 
  Search, 
  Trash2, 
  Eye, 
  Users,
  Calendar,
  MessageCircle
} from 'react-feather';
import { formatDateTime } from '@/utils/dateUtils';

interface ChatRoom {
  id: number;
  name: string;
  participantCount: number;
  messageCount: number;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

interface AdminChatRoomsProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminChatRooms({ userRole }: AdminChatRoomsProps) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchChatRooms();
  }, [currentPage, searchTerm]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/chat-rooms?page=${currentPage - 1}&size=${itemsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.chatRooms || []);
        setTotalPages(Math.ceil((data.totalElements || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch chat rooms');
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      // Mock data for demonstration
      setChatRooms([
        {
          id: 1,
          name: "Chung",
          participantCount: 25,
          messageCount: 1250,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isActive: true
        },
        {
          id: 2,
          name: "Nhóm bạn thân",
          participantCount: 8,
          messageCount: 456,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          isActive: true
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/chat-rooms/${selectedRoom.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setChatRooms(chatRooms.filter(room => room.id !== selectedRoom.id));
        onDeleteClose();
        setSelectedRoom(null);
      } else {
        console.error('Failed to delete chat room');
      }
    } catch (error) {
      console.error('Error deleting chat room:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (room: ChatRoom) => {
    setSelectedRoom(room);
    onDeleteOpen();
  };

  const openViewModal = (room: ChatRoom) => {
    setSelectedRoom(room);
    onViewOpen();
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoomStatus = (room: ChatRoom) => {
    if (room.isActive) {
      return <Chip color="success" size="sm">Hoạt động</Chip>;
    }
    return <Chip color="default" size="sm">Không hoạt động</Chip>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Hash className="text-blue-600 dark:text-blue-400" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quản lý phòng chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Xem và quản lý các phòng chat trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng phòng chat</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chatRooms.length}
                </p>
              </div>
              <Hash className="text-blue-500" size={24} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phòng hoạt động</p>
                <p className="text-2xl font-bold text-green-600">
                  {chatRooms.filter(room => room.isActive).length}
                </p>
              </div>
              <MessageCircle className="text-green-500" size={24} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người dùng</p>
                <p className="text-2xl font-bold text-purple-600">
                  {chatRooms.reduce((total, room) => total + room.participantCount, 0)}
                </p>
              </div>
              <Users className="text-purple-500" size={24} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm phòng chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={16} />}
              className="md:max-w-md"
            />
          </div>
        </CardBody>
      </Card>

      {/* Chat Rooms Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Chat rooms table">
            <TableHeader>
              <TableColumn>TÊN PHÒNG</TableColumn>
              <TableColumn>THÀNH VIÊN</TableColumn>
              <TableColumn>TIN NHẮN</TableColumn>
              <TableColumn>NGÀY TẠO</TableColumn>
              <TableColumn>HOẠT ĐỘNG CUỐI</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
              <TableColumn>HÀNH ĐỘNG</TableColumn>
            </TableHeader>
            <TableBody 
              emptyContent="Không có phòng chat nào"
              isLoading={loading}
              loadingContent="Đang tải..."
            >
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-gray-400" />
                      <span className="font-medium">{room.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm">{room.participantCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageCircle size={16} className="text-gray-400" />
                      <span className="text-sm">{room.messageCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm">
                        {formatDateTime(room.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatDateTime(room.lastActivity)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getRoomStatus(room)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Xem chi tiết">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => openViewModal(room)}
                        >
                          <Eye size={16} />
                        </Button>
                      </Tooltip>
                      {userRole === 'full_admin' && (
                        <Tooltip content="Xóa phòng chat">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => openDeleteModal(room)}
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
          <ModalHeader>Xóa phòng chat</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc chắn muốn xóa phòng chat này không?</p>
            {selectedRoom && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2">
                <p className="font-medium">{selectedRoom.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedRoom.participantCount} thành viên • {selectedRoom.messageCount} tin nhắn
                </p>
              </div>
            )}
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Hành động này sẽ xóa tất cả tin nhắn và không thể hoàn tác!
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Hủy
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteRoom}
              isLoading={deleteLoading}
            >
              Xóa phòng chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalContent>
          <ModalHeader>Chi tiết phòng chat</ModalHeader>
          <ModalBody>
            {selectedRoom && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Thông tin cơ bản:
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-medium text-lg">{selectedRoom.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>ID: #{selectedRoom.id}</span>
                      {getRoomStatus(selectedRoom)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Số thành viên:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRoom.participantCount} người
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Số tin nhắn:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRoom.messageCount} tin nhắn
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Ngày tạo:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(selectedRoom.createdAt)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Hoạt động cuối:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(selectedRoom.lastActivity)}
                    </p>
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
