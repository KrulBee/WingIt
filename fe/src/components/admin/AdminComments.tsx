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
  MessageSquare, 
  Search, 
  Trash2, 
  Eye, 
  User,
  Calendar,
  FileText
} from 'react-feather';
import { formatDateTime } from '@/utils/dateUtils';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorUsername: string;
  postId: number;
}

interface AdminCommentsProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminComments({ userRole }: AdminCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchComments();
  }, [currentPage, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/comments?page=${currentPage - 1}&size=${itemsPerPage}&keyword=${searchTerm}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setTotalPages(Math.ceil((data.totalElements || 0) / itemsPerPage));
      } else {
        console.error('Failed to fetch comments');
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/comments/${selectedComment.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== selectedComment.id));
        onDeleteClose();
        setSelectedComment(null);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (comment: Comment) => {
    setSelectedComment(comment);
    onDeleteOpen();
  };

  const openViewModal = (comment: Comment) => {
    setSelectedComment(comment);
    onViewOpen();
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.authorUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quản lý bình luận
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Xem và điều tiết các bình luận trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm bình luận hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search size={16} />}
              className="md:max-w-md"
            />
          </div>
        </CardBody>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Comments table">
            <TableHeader>
              <TableColumn>BÌNH LUẬN</TableColumn>
              <TableColumn>TÁC GIẢ</TableColumn>
              <TableColumn>BÀI VIẾT</TableColumn>
              <TableColumn>NGÀY TẠO</TableColumn>
              <TableColumn>HÀNH ĐỘNG</TableColumn>
            </TableHeader>
            <TableBody 
              emptyContent="Không có bình luận nào"
              isLoading={loading}
              loadingContent="Đang tải..."
            >
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="truncate text-sm">
                        {comment.content}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-medium">
                        {comment.authorUsername}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="text-sm">
                        Post #{comment.postId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Xem chi tiết">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => openViewModal(comment)}
                        >
                          <Eye size={16} />
                        </Button>
                      </Tooltip>
                      {userRole === 'full_admin' && (
                        <Tooltip content="Xóa bình luận">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => openDeleteModal(comment)}
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
          <ModalHeader>Xóa bình luận</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
            {selectedComment && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2">
                <p className="text-sm">{selectedComment.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Bởi: {selectedComment.authorUsername}
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
              onPress={handleDeleteComment}
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
          <ModalHeader>Chi tiết bình luận</ModalHeader>
          <ModalBody>
            {selectedComment && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Nội dung:
                  </h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm">{selectedComment.content}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Tác giả:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedComment.authorUsername}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Bài viết:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Post #{selectedComment.postId}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      Ngày tạo:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(selectedComment.createdAt)}
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
