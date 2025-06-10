'use client';

import React, { useState, useEffect } from 'react';
import AdminService, { AdminUser } from '@/services/AdminService';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button, 
  Input, 
  Select, 
  SelectItem,
  Chip, 
  Modal, 
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@nextui-org/react';
import { Loader2, Search, UserX, Shield, User, Crown, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface AdminUsersProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminUsers({ userRole }: AdminUsersProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleDeleteUser = async (userId: number, username: string) => {
    try {
      await AdminService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      onClose();
    } catch (err) {      console.error('Delete user error:', err);
      alert('Không thể xóa người dùng');
    }
  };
  const handleUpdateUserRole = async (userId: number, newRoleId: number) => {
    try {
      await AdminService.updateUserRole(userId, newRoleId);
      // For updating the UI, we need to find the role by ID
      // For now, we'll just refetch the users
      fetchUsers();
    } catch (err) {
      console.error('Update role error:', err);
      alert('Không thể cập nhật vai trò người dùng');
    }
  };  const getRoleBadge = (role: { id: number; roleName: string } | null | undefined) => {
    if (!role || !role.roleName) {
      return (
        <Chip 
          color="default" 
          variant="flat"
          startContent={<User className="h-3 w-3" />}
          size="sm"
        >
          User
        </Chip>
      );
    }
    
    switch (role.roleName.toLowerCase()) {
      case 'admin':
        return (          <Chip 
            color="danger" 
            variant="flat"
            startContent={<Crown className="h-3 w-3" />}
            size="sm"
          >
            Quản trị viên
          </Chip>
        );
      case 'moderator':
        return (          <Chip 
            color="secondary" 
            variant="flat"
            startContent={<Shield className="h-3 w-3" />}
            size="sm"
          >
            Kiểm duyệt viên
          </Chip>
        );
      default:
        return (
          <Chip 
            color="default" 
            variant="flat"
            startContent={<User className="h-3 w-3" />}
            size="sm"
          >
            User
          </Chip>
        );
    }  };
  // Filtering and sorting logic
  const filteredUsers = users
    .filter(user => {      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || 
                         (user.role && user.role.roleName.toLowerCase() === roleFilter.toLowerCase());
      return matchesSearch && matchesRole;
    })    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
        // Handle different sort fields
      if (sortBy === 'username' || sortBy === 'email') {
        aValue = a[sortBy as keyof AdminUser];
        bValue = b[sortBy as keyof AdminUser];
      } else if (sortBy === 'createdAt') {
        aValue = new Date(a.createdDate);
        bValue = new Date(b.createdDate);
      } else {
        aValue = a[sortBy as keyof AdminUser];
        bValue = b[sortBy as keyof AdminUser];
      }
      
      // Don't convert dates to lowercase
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  if (loading) {    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Đang tải người dùng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button color="primary" onClick={fetchUsers}>Thử lại</Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">        <div>
          <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý tài khoản, vai trò và quyền của người dùng
          </p>
        </div>
        <Button 
          color="default" 
          variant="bordered"
          onClick={fetchUsers}
          startContent={<Search className="h-4 w-4" />}        >
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>        <CardHeader>
          <h3 className="text-lg font-semibold">Bộ lọc & Tìm kiếm</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm người dùng</label>
              <Input
                placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4" />}
              />
            </div>            <div className="space-y-2">
              <label className="text-sm font-medium">Vai trò</label>              <Select 
                selectedKeys={new Set([roleFilter])}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setRoleFilter(selectedKey);
                }}
                placeholder="Chọn vai trò"
              >
                <SelectItem key="all">Tất cả vai trò</SelectItem>
                <SelectItem key="user">Người dùng</SelectItem>
                <SelectItem key="moderator">Người kiểm duyệt</SelectItem>
                {userRole === 'full_admin' ? <SelectItem key="admin">Quản trị viên</SelectItem> : null}
              </Select>            </div>            <div className="space-y-2">
              <label className="text-sm font-medium">Sắp xếp theo</label><Select 
                selectedKeys={new Set([`${sortBy}-${sortOrder}`])}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  const [field, order] = selectedKey.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                placeholder="Chọn cách sắp xếp"              >
                <SelectItem key="username-asc">Tên đăng nhập (A-Z)</SelectItem>
                <SelectItem key="username-desc">Tên đăng nhập (Z-A)</SelectItem>
                <SelectItem key="createdAt-desc">Mới nhất</SelectItem>
                <SelectItem key="createdAt-asc">Cũ nhất</SelectItem>
                <SelectItem key="email-asc">Email (A-Z)</SelectItem>
                <SelectItem key="email-desc">Email (Z-A)</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>      {/* Users List */}
      <Card>        <CardHeader>
          <h3 className="text-lg font-semibold">Người dùng ({filteredUsers.length})</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quản lý tài khoản người dùng và quyền của họ
          </p>
        </CardHeader>
        <CardBody>
          {filteredUsers.length === 0 ? (            <div className="text-center py-8">
              <UserX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Không tìm thấy người dùng nào phù hợp với tiêu chí của bạn</p>
            </div>
          ) : (            <Table aria-label="Bảng quản lý người dùng">
              <TableHeader>
                <TableColumn>NGƯỜI DÙNG</TableColumn>
                <TableColumn>VAI TRÒ</TableColumn>
                <TableColumn>NGÀY THAM GIA</TableColumn>
                <TableColumn>HÀNH ĐỘNG</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={user.username}
                          src={user.profilePicture}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.displayName && (
                            <div className="text-sm text-gray-400">{user.displayName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {formatDate(user.createdDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">                        {/* View Profile Button */}
                        {(userRole === 'admin' || userRole === 'full_admin' || userRole === 'moderator') ? (
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Edit className="h-3 w-3" />}                            onPress={() => {
                              // Open user profile in a new tab for viewing
                              window.open(`/profile/${user.username}`, '_blank');
                            }}
                          >
                            Xem hồ sơ
                          </Button>
                        ) : null}

                        {/* Role Management Buttons */}
                        {(userRole === 'full_admin' || !user.role || user.role.roleName.toLowerCase() !== 'admin') ? (
                          <>
                            {(!user.role || user.role.roleName.toLowerCase() === 'user') ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="secondary"
                                startContent={<Shield className="h-3 w-3" />}
                                onPress={() => handleUpdateUserRole(user.id, 2)}
                              >
                                Làm điều hành viên
                              </Button>
                            ) : null}
                            
                            {(user.role && user.role.roleName.toLowerCase() === 'moderator') ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="default"
                                startContent={<User className="h-3 w-3" />}
                                onPress={() => handleUpdateUserRole(user.id, 1)}
                              >
                                Gỡ điều hành viên
                              </Button>
                            ) : null}
                            
                            {userRole === 'full_admin' && (!user.role || user.role.roleName.toLowerCase() !== 'admin') ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                startContent={<Crown className="h-3 w-3" />}
                                onPress={() => handleUpdateUserRole(user.id, 3)}
                              >
                                Làm quản trị viên
                              </Button>
                            ) : null}

                            {/* Delete Button */}
                            {(userRole === 'admin' || userRole === 'full_admin') ? (
                              <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                startContent={<Trash2 className="h-3 w-3" />}
                                onPress={() => {
                                  setSelectedUser(user);
                                  onOpen();
                                }}
                              >
                                Xóa
                              </Button>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Không có hành động</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Xóa người dùng</ModalHeader>
          <ModalBody>
            <p>
              Bạn có chắc chắn muốn xóa người dùng "{selectedUser?.username}"? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả bài viết và dữ liệu của họ.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Hủy
            </Button>
            <Button 
              color="danger" 
              onPress={() => selectedUser && handleDeleteUser(selectedUser.id, selectedUser.username)}
            >
              Xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
