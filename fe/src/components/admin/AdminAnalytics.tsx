'use client';

import React, { useState, useEffect } from 'react';
import AdminService, { AdminStats, SystemAnalytics } from '@/services/AdminService';
import { Card, CardBody, CardHeader, Button, Spinner, Chip } from '@nextui-org/react';
import { TrendingUp, Users, FileText, Activity, AlertTriangle, MessageSquare } from 'lucide-react';

interface AdminAnalyticsProps {
  userRole: 'admin' | 'moderator' | 'full_admin';
}

export default function AdminAnalytics({ userRole }: AdminAnalyticsProps) {
  const [dashboardStats, setDashboardStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both dashboard stats and system analytics
      const [statsData, analyticsData] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getSystemAnalytics()
      ]);
      
      setDashboardStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Không thể tải dữ liệu phân tích');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);
  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
        <span className="ml-2">Đang tải phân tích...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button color="primary" onClick={handleRefresh}>Thử lại</Button>
      </div>
    );
  }  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Phân tích hệ thống</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Thống kê và xu hướng tăng trưởng nền tảng
          </p>
        </div>
        <Button onClick={handleRefresh} variant="bordered" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Overview Cards from Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium">Tổng số người dùng</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">
              Mới tháng này: +{dashboardStats?.newUsersThisMonth || 0}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <h3 className="text-sm font-medium">Tổng bài viết</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{dashboardStats?.totalPosts?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">
              Mới tháng này: +{dashboardStats?.newPostsThisMonth || 0}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium">Tổng bình luận</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{dashboardStats?.totalComments?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">
              Tương tác người dùng
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-medium">Báo cáo đang chờ</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-orange-600">{dashboardStats?.pendingReports || 0}</div>
            <p className="text-xs text-gray-500">
              Cần xử lý
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Growth Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Xu hướng tăng trưởng người dùng</h3>
            </div>
            <p className="text-sm text-gray-500">
              Đăng ký người dùng theo thời gian (7 ngày qua)
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {analytics?.userGrowth && Object.entries(analytics.userGrowth).map(([period, count]) => (
                <div key={period} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <div className="font-medium">{period}</div>
                    <div className="text-sm text-gray-500">Người dùng mới</div>
                  </div>
                  <Chip color="primary" variant="flat">
                    +{count}
                  </Chip>
                </div>
              ))}
              {(!analytics?.userGrowth || Object.keys(analytics.userGrowth).length === 0) && (
                <p className="text-center text-gray-500 py-4">Không có dữ liệu tăng trưởng người dùng</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Post Growth Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Xu hướng tăng trưởng nội dung</h3>
            </div>
            <p className="text-sm text-gray-500">
              Tạo bài viết theo thời gian (7 ngày qua)
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {analytics?.postGrowth && Object.entries(analytics.postGrowth).map(([period, count]) => (
                <div key={period} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="font-medium">{period}</div>
                    <div className="text-sm text-gray-500">Bài viết mới</div>
                  </div>
                  <Chip color="success" variant="flat">
                    +{count}
                  </Chip>
                </div>
              ))}
              {(!analytics?.postGrowth || Object.keys(analytics.postGrowth).length === 0) && (
                <p className="text-center text-gray-500 py-4">Không có dữ liệu tăng trưởng bài viết</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Report Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Phân bố báo cáo</h3>
          </div>
          <p className="text-sm text-gray-500">
            Trạng thái và phân loại báo cáo
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div>
                <div className="font-medium">Đang chờ xử lý</div>
                <div className="text-sm text-gray-500">Báo cáo</div>
              </div>
              <Chip color="warning" variant="flat">
                {dashboardStats?.pendingReports || 0}
              </Chip>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <div className="font-medium">Đã xử lý</div>
                <div className="text-sm text-gray-500">Báo cáo</div>
              </div>
              <Chip color="success" variant="flat">
                {dashboardStats?.resolvedReports || 0}
              </Chip>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Tổng cộng</div>
                <div className="text-sm text-gray-500">Báo cáo</div>
              </div>
              <Chip color="default" variant="flat">
                {dashboardStats?.totalReports || 0}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Platform Activity Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Tổng kết hoạt động nền tảng</h3>
          </div>
          <p className="text-sm text-gray-500">
            Tổng quan sức khỏe và số liệu hoạt động nền tảng
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border-1 border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{dashboardStats?.totalUsers?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Tổng người dùng</div>
              <div className="text-xs text-green-600 mt-1">Cộng đồng hoạt động</div>
            </div>
            <div className="text-center p-4 border-1 border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{dashboardStats?.totalPosts?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Tổng bài viết</div>
              <div className="text-xs text-green-600 mt-1">Nội dung đã tạo</div>
            </div>
            <div className="text-center p-4 border-1 border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{dashboardStats?.totalComments?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Tổng bình luận</div>
              <div className="text-xs text-green-600 mt-1">Tương tác tích cực</div>
            </div>
            <div className="text-center p-4 border-1 border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{dashboardStats?.totalReports || 0}</div>
              <div className="text-sm text-gray-500 mt-1">Tổng báo cáo</div>
              <div className="text-xs text-orange-600 mt-1">
                {(dashboardStats?.totalReports || 0) > 10 ? 'Cần chú ý' : 'Trong tầm kiểm soát'}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
