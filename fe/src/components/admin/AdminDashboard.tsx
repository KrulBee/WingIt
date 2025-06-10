'use client';

import React, { useState, useEffect } from 'react';
import AdminService, { AdminStats } from '@/services/AdminService';
import { Card, CardBody, CardHeader, Button, Spinner } from '@nextui-org/react';
import { Loader2, Users, FileText, AlertTriangle, UserPlus, TrendingUp, Eye, MessageSquare } from 'lucide-react';

interface AdminDashboardProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get dashboard stats first
      try {
        const data = await AdminService.getDashboardStats();
        setStats(data);
        setLastRefresh(new Date());      } catch (dashboardError) {
        console.warn('Dashboard stats failed, trying individual endpoints:', dashboardError);
        
        // If dashboard stats fail, try to get individual data
        try {
          const [users, reports] = await Promise.allSettled([
            AdminService.getAllUsers(0, 1000), // Get all users to count
            AdminService.getAllReports() // Get all reports to count
          ]);
          
          const totalUsers = users.status === 'fulfilled' ? users.value.length : 0;
          const allReports = reports.status === 'fulfilled' ? reports.value : [];
          const pendingReports = allReports.filter(r => r.status === 'PENDING').length;
          const resolvedReports = allReports.filter(r => r.status === 'RESOLVED').length;
          const totalReports = allReports.length;
          
          // Calculate new users this month (approximate)
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          const newUsersThisMonth = users.status === 'fulfilled' 
            ? users.value.filter(u => new Date(u.createdDate) > oneMonthAgo).length 
            : 0;
          
          const fallbackStats: AdminStats = {
            totalUsers,
            totalPosts: 0, // Cannot get without proper endpoint
            totalComments: 0, // Cannot get without proper endpoint
            pendingReports,
            resolvedReports,
            totalReports,
            newUsersThisMonth,
            newPostsThisMonth: 0 // Cannot get without proper endpoint
          };
          
          setStats(fallbackStats);
          setLastRefresh(new Date());
          setError('Thống kê được tải từ dữ liệu dự phòng do lỗi máy chủ.');
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
    } catch (err) {
      setError('Không thể tải thống kê bảng điều khiển. Vui lòng thử lại sau.');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading && !stats) {
    return (      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Đang tải bảng điều khiển...</span>
      </div>
    );
  }
  if (error && !stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          Lỗi máy chủ: Vui lòng kiểm tra console để biết thêm chi tiết.
        </p>
        <Button color="primary" onClick={handleRefresh}>Thử lại</Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Error Warning Banner */}
      {error && stats && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tổng quan bảng điều khiển</h2>          <p className="text-gray-600 dark:text-gray-400">
            Chào mừng trở lại, {userRole === 'full_admin' ? 'Quản trị viên' : 'Điều hành viên'}
          </p>
          <p className="text-sm text-gray-500">
            Cập nhật lần cuối: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          color="primary"
          variant="bordered"
          onClick={handleRefresh} 
          disabled={loading}          startContent={loading ? <Spinner size="sm" /> : <TrendingUp className="h-4 w-4" />}
        >
          Làm mới
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <h4 className="text-sm font-medium">Tổng số người dùng</h4>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500">Người dùng đã đăng ký nền tảng</p>
            </div>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <h4 className="text-sm font-medium">Tổng bài viết</h4>
              <div className="text-2xl font-bold">{stats?.totalPosts.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500">Nội dung đã xuất bản</p>
            </div>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <h4 className="text-sm font-medium">Báo cáo đang chờ</h4>
              <div className="text-2xl font-bold text-orange-600">{stats?.pendingReports || 0}</div>
              <p className="text-xs text-gray-500">Cần chú ý</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <h4 className="text-sm font-medium">Người dùng mới (Tháng)</h4>
              <div className="text-2xl font-bold text-green-600">{stats?.newUsersThisMonth || 0}</div>
              <p className="text-xs text-gray-500">Đăng ký gần đây</p>
            </div>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Hoạt động nền tảng</h3>
            </div>
            <p className="text-sm text-gray-500">Tổng quan về sự tham gia của người dùng và số liệu nội dung</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tổng người dùng</span>
                <span className="text-lg font-bold">{stats?.totalUsers?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bài viết mới (Tháng)</span>
                <span className="text-lg font-bold">{stats?.newPostsThisMonth || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tổng bình luận</span>
                <span className="text-lg font-bold">{stats?.totalComments?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tổng bài viết</span>
                <span className="text-lg font-bold">{stats?.totalPosts?.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Hàng đợi kiểm duyệt</h3>
            </div>
            <p className="text-sm text-gray-500">Nội dung cần chú ý kiểm duyệt</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Báo cáo đang chờ</span>
                <span className="text-lg font-bold text-orange-600">{stats?.pendingReports || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Báo cáo đã giải quyết</span>
                <span className="text-lg font-bold text-green-600">{stats?.resolvedReports || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tổng báo cáo</span>
                <span className="text-lg font-bold">{stats?.totalReports || 0}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Tổng kết hoạt động gần đây</h3>
          <p className="text-sm text-gray-500">Các số liệu chính từ hoạt động gần đây</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.newUsersThisMonth || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Người dùng mới tháng này</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats?.newPostsThisMonth || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Bài viết tháng này</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats?.totalComments || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tổng bình luận</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
