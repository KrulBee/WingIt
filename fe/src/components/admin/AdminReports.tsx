'use client';

import React, { useState, useEffect } from 'react';
import AdminService, { AdminReport } from '@/services/AdminService';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Chip, 
  Select, 
  SelectItem, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Textarea, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Spinner,
  useDisclosure
} from '@nextui-org/react';
import { Search, AlertTriangle, Check, X, Eye, MessageSquare, FileText, MoreHorizontal, Trash2, User, Edit, Shield, Crown } from 'lucide-react';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import UserService from '@/services/UserService';

interface AdminReportsProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminReports({ userRole }: AdminReportsProps) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: number; username: string; displayName: string } | null>(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeleteReportOpen, onOpen: onDeleteReportOpen, onClose: onDeleteReportClose } = useDisclosure();
  const { isOpen: isDeleteUserOpen, onOpen: onDeleteUserOpen, onClose: onDeleteUserClose } = useDisclosure();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getAllReports();
      setReports(data);
    } catch (err) {
      setError('Không thể tải báo cáo');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReportStatus = async (reportId: number, status: 'RESOLVED' | 'DISMISSED', notes?: string) => {
    try {
      await AdminService.updateReportStatus(reportId, { status, notes });
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status, resolvedDate: new Date().toISOString() } 
          : report
      ));
    } catch (err) {
      console.error('Update report status error:', err);
      alert('Không thể cập nhật trạng thái báo cáo');
    }
  };
  const handleDeletePost = async (postId: number) => {
    try {
      await AdminService.deletePost(postId);
      // Update reports that reference this post
      setReports(reports.map(report => 
        report.targetPost?.id === postId 
          ? { ...report, status: 'RESOLVED', resolvedDate: new Date().toISOString() }
          : report
      ));
    } catch (err) {
      console.error('Delete post error:', err);
      alert('Không thể xóa bài viết');
    }
  };
  const handleDeleteReport = async (reportId: number) => {
    try {
      await AdminService.deleteReport(reportId);
      // Remove the deleted report from the list
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      console.error('Delete report error:', err);
      alert('Không thể xóa báo cáo');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await AdminService.deleteUser(userId);
      // Update reports involving this user
      setReports(reports.map(report => {
        if (report.reportedBy?.id === userId || report.targetUser?.id === userId) {
          return { ...report, status: 'RESOLVED', resolvedDate: new Date().toISOString() };
        }
        return report;
      }));
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Không thể xóa người dùng');
    }
  };

  const handleUpdateUserRole = async (userId: number, newRoleId: number) => {
    try {
      await AdminService.updateUserRole(userId, newRoleId);
      // Optionally refresh reports to show updated user roles
      await fetchReports();
    } catch (err) {
      console.error('Update user role error:', err);
      alert('Không thể cập nhật vai trò người dùng');
    }
  };
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Chip color="warning" variant="flat" startContent={<AlertTriangle className="h-3 w-3" />}>Đang chờ</Chip>;
      case 'RESOLVED':
        return <Chip color="success" variant="flat" startContent={<Check className="h-3 w-3" />}>Đã xử lý</Chip>;
      case 'DISMISSED':
        return <Chip color="danger" variant="flat" startContent={<X className="h-3 w-3" />}>Đã bỏ qua</Chip>;
      default:
        return <Chip variant="flat">{status}</Chip>;
    }
  };  const getReportTypeChip = (type: string) => {
    switch (type) {
      case 'USER':
        return <Chip color="primary" variant="dot">Người dùng</Chip>;
      case 'POST':
        return <Chip color="secondary" variant="dot">Bài viết</Chip>;
      case 'COMMENT':
        return <Chip color="warning" variant="dot">Bình luận</Chip>;
      default:
        return <Chip variant="dot">{type}</Chip>;
    }
  };

  // Filtering and sorting logic
  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (report.reportedBy?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                           (report.targetUser?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesType = typeFilter === 'all' || report.reportType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof AdminReport];
      let bValue = b[sortBy as keyof AdminReport];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const openDetailsModal = (report: AdminReport) => {
    setSelectedReport(report);
    onDetailsOpen();
  };

  const openApproveModal = (report: AdminReport) => {
    setSelectedReport(report);
    setApproveNote('');
    onApproveOpen();
  };

  const openRejectModal = (report: AdminReport) => {
    setSelectedReport(report);
    setRejectNote('');
    onRejectOpen();
  };
  const openDeleteModal = (report: AdminReport) => {
    setSelectedReport(report);
    onDeleteOpen();
  };
  const openDeleteReportModal = (report: AdminReport) => {
    setSelectedReport(report);
    onDeleteReportOpen();
  };
  const openDeleteUserModal = (user: { id: number; username: string; displayName: string }) => {
    setSelectedUser(user);
    onDeleteUserOpen();
  };

  const handleDeleteUserConfirm = async () => {
    if (selectedUser) {
      await handleDeleteUser(selectedUser.id);
      onDeleteUserClose();
    }
  };

  const handleApprove = async () => {
    if (selectedReport) {
      await handleUpdateReportStatus(selectedReport.id, 'RESOLVED', approveNote);
      onApproveClose();
    }
  };

  const handleReject = async () => {
    if (selectedReport) {
      await handleUpdateReportStatus(selectedReport.id, 'DISMISSED', rejectNote);
      onRejectClose();
    }
  };
  const handleDelete = async () => {
    if (selectedReport?.targetPost?.id) {
      await handleDeletePost(selectedReport.targetPost.id);
      onDeleteClose();
    }
  };

  const handleDeleteReportConfirm = async () => {
    if (selectedReport) {
      await handleDeleteReport(selectedReport.id);
      onDeleteReportClose();
    }
  };

  if (loading) {    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Đang tải báo cáo...</span>
      </div>
    );
  }

  if (error) {
    return (      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchReports} color="primary">Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">        <div>
          <h2 className="text-2xl font-bold">Quản lý báo cáo</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Xem xét và kiểm duyệt nội dung bị báo cáo
          </p>
        </div>
        <Button onClick={fetchReports} variant="bordered" startContent={<Search className="h-4 w-4" />}>
          Làm mới
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {reports.filter(r => r.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Đang chờ</div>
              </div>
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'RESOLVED').length}
                </div>
                <div className="text-sm text-gray-600">Đã xử lý</div>
              </div>
              <Check className="h-6 w-6 text-green-500" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.status === 'DISMISSED').length}
                </div>
                <div className="text-sm text-gray-600">Đã bỏ qua</div>
              </div>
              <X className="h-6 w-6 text-red-500" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{reports.length}</div>
                <div className="text-sm text-gray-600">Tổng số báo cáo</div>
              </div>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>        <CardHeader>
          <h3 className="text-lg font-semibold">Bộ lọc & Tìm kiếm</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm báo cáo</label>
              <Input
                placeholder="Tìm kiếm theo lý do hoặc người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select 
                selectedKeys={new Set([statusFilter])}
                onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}              >
                <SelectItem key="all">Tất cả trạng thái</SelectItem>
                <SelectItem key="PENDING">Đang chờ</SelectItem>
                <SelectItem key="RESOLVED">Đã xử lý</SelectItem>
                <SelectItem key="DISMISSED">Đã bỏ qua</SelectItem>
              </Select>
            </div>            <div className="space-y-2">
              <label className="text-sm font-medium">Loại</label>
              <Select 
                selectedKeys={new Set([typeFilter])}
                onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string)}
              >
                <SelectItem key="all">Tất cả loại</SelectItem>
                <SelectItem key="USER">Người dùng</SelectItem>
                <SelectItem key="POST">Bài viết</SelectItem>
                <SelectItem key="COMMENT">Bình luận</SelectItem>
              </Select>
            </div><div className="space-y-2">
              <label className="text-sm font-medium">Sắp xếp theo</label>              <Select 
                selectedKeys={[`${sortBy}-${sortOrder}`]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <SelectItem key="createdDate-desc">Mới nhất</SelectItem>
                <SelectItem key="createdDate-asc">Cũ nhất</SelectItem>
                <SelectItem key="status-desc">Trạng thái</SelectItem>
                <SelectItem key="reportType-asc">Loại báo cáo</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Báo cáo ({filteredReports.length})</h3>
          <p className="text-sm text-gray-600">Xem xét nội dung được báo cáo và thực hiện hành động phù hợp</p>
        </CardHeader>
        <CardBody>          <Table aria-label="Bảng báo cáo">
            <TableHeader>
              <TableColumn>CHI TIẾT BÁO CÁO</TableColumn>
              <TableColumn>LOẠI</TableColumn>
              <TableColumn>TRẠNG THÁI</TableColumn>
              <TableColumn>NGÀY TẠO</TableColumn>
              <TableColumn>NGÀY XỬ LÝ</TableColumn>
              <TableColumn>QUẢN LÝ NGƯỜI DÙNG</TableColumn>
              <TableColumn align="end">HÀNH ĐỘNG</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        Reported by: {report.reportedBy?.displayName || 'Không xác định'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Against: {report.targetUser?.displayName || 'Không xác định'}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {report.reason}
                      </div>                    </div>
                  </TableCell>
                  <TableCell>
                    {getReportTypeChip(report.reportType)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(report.status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(report.createdDate)}
                  </TableCell>
                  <TableCell>
                    {report.resolvedDate 
                      ? formatDate(report.resolvedDate)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {/* User Management Actions */}
                    {report.reportType === 'USER' && report.targetUser ? (
                      <div className="flex gap-1">
                        {/* View Profile Button */}
                        {(userRole === 'admin' || userRole === 'full_admin' || userRole === 'moderator') ? (
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Edit className="h-3 w-3" />}
                            onPress={() => {
                              // Debug log to check username
                              console.log('Opening profile for username:', report.targetUser?.username);
                              // Open user profile in a new tab for viewing with URL encoding
                              const encodedUsername = encodeURIComponent(report.targetUser?.username || '');
                              window.open(`/profile/${encodedUsername}`, '_blank');
                            }}
                          >
                            Xem hồ sơ
                          </Button>
                        ) : null}
                        {(userRole === 'admin' || userRole === 'full_admin') ? (
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            startContent={<Trash2 className="h-3 w-3" />}
                            onPress={() => openDeleteUserModal({
                              id: report.targetUser!.id,
                              username: report.targetUser!.username,
                              displayName: report.targetUser!.displayName
                            })}
                          >
                            Xóa
                          </Button>
                        ) : null}
                      </div>
                    ) : report.reportType === 'POST' && report.targetPost ? (
                      <div className="flex gap-1">                        <Button
                          size="sm"
                          variant="flat"
                          color="warning"
                          startContent={<Eye className="h-3 w-3" />}
                          onPress={() => window.open(`/home?postId=${report.targetPost?.id}&highlight=true`, '_blank')}
                        >
                          Xem bài viết
                        </Button>
                      </div>
                    ) : report.reportType === 'COMMENT' && report.targetComment ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="flat"
                          color="secondary"
                          startContent={<MessageSquare className="h-3 w-3" />}
                          onPress={() => {
                            // For now, just show a message. Later you can implement comment viewing
                            alert('Xem chi tiết bình luận trong modal chi tiết báo cáo');
                            openDetailsModal(report);
                          }}
                        >
                          Xem bình luận
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Không áp dụng</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Hành động báo cáo">
                        <DropdownItem
                          key="view"
                          startContent={<Eye className="h-4 w-4" />}
                          onPress={() => openDetailsModal(report)}
                        >
                          Xem chi tiết
                        </DropdownItem>
                        {report.status === 'PENDING' ? (
                          <>
                            <DropdownItem
                              key="approve"
                              startContent={<Check className="h-4 w-4" />}
                              onPress={() => openApproveModal(report)}
                            >
                              Xử lý báo cáo
                            </DropdownItem>                            <DropdownItem
                              key="reject"
                              startContent={<X className="h-4 w-4" />}
                              onPress={() => openRejectModal(report)}
                            >
                              Bỏ qua báo cáo
                            </DropdownItem>
                          </>
                        ) : null}
                        {report.targetPost ? (
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<MessageSquare className="h-4 w-4" />}
                            onPress={() => openDeleteModal(report)}
                          >
                            Xóa bài viết
                          </DropdownItem>
                        ) : null}
                        
                        {/* Role Management Options for Full Admin */}
                        {report.targetUser && userRole === 'full_admin' ? (
                          <>
                            <DropdownItem
                              key="makeAdmin"
                              startContent={<Crown className="h-4 w-4" />}
                              onPress={() => handleUpdateUserRole(report.targetUser!.id, 3)}
                            >
                              Đặt làm quản trị viên
                            </DropdownItem>
                            <DropdownItem
                              key="makeModerator"
                              startContent={<Shield className="h-4 w-4" />}
                              onPress={() => handleUpdateUserRole(report.targetUser!.id, 2)}
                            >
                              Đặt làm kiểm duyệt viên
                            </DropdownItem>
                            <DropdownItem
                              key="makeUser"
                              startContent={<User className="h-4 w-4" />}
                              onPress={() => handleUpdateUserRole(report.targetUser!.id, 1)}
                            >
                              Đặt làm người dùng thường
                            </DropdownItem>
                          </>
                        ) : null}
                        
                        {(userRole === 'admin' || userRole === 'full_admin' || userRole === 'moderator') ? (
                          <DropdownItem
                            key="deleteReport"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            onPress={() => openDeleteReportModal(report)}
                          >
                            Xóa báo cáo
                          </DropdownItem>
                        ) : null}
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Không tìm thấy báo cáo nào phù hợp với tiêu chí của bạn</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex flex-col">              <h4 className="text-lg font-semibold">Chi tiết báo cáo</h4>
              <p className="text-sm text-gray-500">Thông tin đầy đủ về báo cáo này</p>
            </div>
          </ModalHeader>          <ModalBody>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Loại báo cáo:</label>
                  <div className="mt-1">{getReportTypeChip(selectedReport.reportType)}</div>
                </div>
                <div>
                  <label className="font-medium">Người báo cáo:</label>
                  <p>{selectedReport.reportedBy?.displayName || 'Không xác định'}</p>
                </div>
                {selectedReport.targetUser && (
                  <div>
                    <label className="font-medium">Người dùng bị báo cáo:</label>
                    <p>{selectedReport.targetUser.displayName || selectedReport.targetUser.username}</p>
                  </div>
                )}
                {selectedReport.targetPost && (
                  <div>
                    <label className="font-medium">Bài viết bị báo cáo:</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">{selectedReport.targetPost.content}</p>                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => window.open(`/home?postId=${selectedReport.targetPost?.id}&highlight=true`, '_blank')}
                      >
                        Xem bài viết
                      </Button>
                    </div>
                  </div>
                )}
                {selectedReport.targetComment && (
                  <div>
                    <label className="font-medium">Bình luận bị báo cáo:</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedReport.targetComment.content}</p>
                  </div>
                )}
                <div>
                  <label className="font-medium">Lý do báo cáo:</label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedReport.reason}</p>
                </div>
                {selectedReport.description && (
                  <div>
                    <label className="font-medium">Mô tả chi tiết:</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="font-medium">Trạng thái:</label>
                  <div className="mt-1">{getStatusChip(selectedReport.status)}</div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="font-medium">Ngày tạo:</label>
                    <p className="text-sm">{new Date(selectedReport.createdDate).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  {selectedReport.resolvedDate && (
                    <div>
                      <label className="font-medium">Ngày xử lý:</label>
                      <p className="text-sm">{new Date(selectedReport.resolvedDate).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>            <Button color="primary" onPress={onDetailsClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Approve Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalContent>
          <ModalHeader>
            <h4 className="text-lg font-semibold">Giải quyết báo cáo</h4>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600 mb-4">
              Điều này sẽ đánh dấu báo cáo là đã xử lý. Bạn có thể thêm ghi chú quản trị viên để giải thích quyết định.
            </p>            <Textarea
              label="Ghi chú của quản trị viên (tùy chọn)"
              placeholder="Nhập ghi chú của bạn..."
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
            />
          </ModalBody>          <ModalFooter>
            <Button variant="light" onPress={onApproveClose}>
              Hủy
            </Button>
            <Button color="success" onPress={handleApprove}>
              Giải quyết
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalContent>
          <ModalHeader>
            <h4 className="text-lg font-semibold">Bỏ qua báo cáo</h4>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600 mb-4">
              Điều này sẽ bỏ qua báo cáo. Bạn có thể thêm ghi chú quản trị viên để giải thích quyết định.
            </p>            <Textarea
              label="Ghi chú của quản trị viên (tùy chọn)"
              placeholder="Nhập ghi chú của bạn..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
          </ModalBody>          <ModalFooter>
            <Button variant="light" onPress={onRejectClose}>
              Hủy
            </Button>
            <Button color="danger" onPress={handleReject}>
              Từ chối
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Post Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>
            <h4 className="text-lg font-semibold">Xóa bài viết</h4>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Điều này sẽ xóa vĩnh viễn bài viết được báo cáo. Hành động này không thể hoàn tác.
            </p>
          </ModalBody>          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Hủy
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Xóa bài viết
            </Button>          </ModalFooter>
        </ModalContent>
      </Modal>      {/* Delete Report Modal */}
      <Modal isOpen={isDeleteReportOpen} onClose={onDeleteReportClose}>
        <ModalContent>
          <ModalHeader>
            <h4 className="text-lg font-semibold">Xóa báo cáo</h4>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Điều này sẽ xóa vĩnh viễn báo cáo này khỏi hệ thống. Hành động này không thể hoàn tác.
            </p>
            <p className="text-orange-600 mt-2">
              <strong>Lưu ý:</strong> Chỉ xóa báo cáo khi chắc chắn rằng báo cáo này không hợp lệ hoặc spam.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteReportClose}>
              Hủy
            </Button>
            <Button color="danger" onPress={handleDeleteReportConfirm}>
              Xóa báo cáo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteUserOpen} onClose={onDeleteUserClose}>
        <ModalContent>
          <ModalHeader>
            <h4 className="text-lg font-semibold">Xóa người dùng</h4>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.displayName || selectedUser?.username}"?
            </p>
            <p className="text-red-600 mt-2">
              <strong>Cảnh báo:</strong> Hành động này sẽ xóa vĩnh viễn tài khoản người dùng và tất cả dữ liệu liên quan 
              (bài viết, bình luận, tin nhắn). Hành động này không thể hoàn tác.
            </p>
            <p className="text-orange-600 mt-2">
              Các báo cáo liên quan đến người dùng này sẽ được đánh dấu là đã xử lý.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteUserClose}>
              Hủy
            </Button>
            <Button color="danger" onPress={handleDeleteUserConfirm}>
              Xóa người dùng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
