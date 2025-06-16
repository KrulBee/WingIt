"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Tabs, Tab, Spinner } from '@nextui-org/react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  BarChart, 
  Shield, 
  Activity,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  Hash
} from 'react-feather';
import Sidebar from '@/components/Sidebar';
import AdminGuard from '@/components/AdminGuard';
import AdminService, { AdminStats, AdminAccess } from '@/services/AdminService';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminReports from '@/components/admin/AdminReports';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminPosts from '@/components/admin/AdminPosts';
import AdminComments from '@/components/admin/AdminComments';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminChatRooms from '@/components/admin/AdminChatRooms';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'full_admin'>('moderator');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  // Handle client-side hydration
  useEffect(() => {
    console.log('AdminPage: Setting isClient to true');
    setIsClient(true);
  }, []);
  const handleAuthenticationComplete = () => {
    console.log('AdminPage: Authentication completed, setting isAuthenticated to true');
    setIsAuthenticated(true);
  };

  // Define loadInitialData function
  const loadInitialData = useCallback(async () => {
    try {
      console.log('AdminPage: loadInitialData started');
      setLoading(true);
      const [statsData, accessData] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.checkAdminAccess()
      ]);
      console.log('AdminPage: Data loaded successfully', { statsData, accessData });
      setStats(statsData);
      setAccess(accessData);
      
      // Determine user role from access
      if (accessData.hasFullAdminAccess) {
        setUserRole('full_admin');
      } else if (accessData.hasAdminAccess) {
        setUserRole('admin');
      } else {
        setUserRole('moderator');
      }
      console.log('AdminPage: User role set to:', accessData.hasFullAdminAccess ? 'full_admin' : accessData.hasAdminAccess ? 'admin' : 'moderator');
    } catch (err: any) {
      console.error('AdminPage: Error loading admin data:', err);
      setError('Không thể tải dữ liệu quản trị');
    } finally {
      console.log('AdminPage: Setting loading to false');
      setLoading(false);
    }
  }, []);

  // Only load data when authenticated
  useEffect(() => {
    console.log('AdminPage: useEffect triggered - isAuthenticated:', isAuthenticated, 'isClient:', isClient);
    if (isAuthenticated && isClient) {
      console.log('AdminPage: Calling loadInitialData...');
      loadInitialData();
    }
  }, [isAuthenticated, isClient, loadInitialData]);

  const refreshStats = async () => {
    try {
      const statsData = await AdminService.getDashboardStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error refreshing stats:', err);
    }
  };
  if (!isClient) {
    console.log('AdminPage: Showing loading screen - waiting for client hydration - isClient:', isClient);
    return (
      <AdminGuard>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen" suppressHydrationWarning>
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Spinner size="lg" />                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Đang khởi tạo...
                </p>
              </div>
            </div>
          </main>
        </div>
      </AdminGuard>
    );
  }

  if (loading) {
    console.log('AdminPage: Showing loading screen - loading data - loading:', loading, 'isAuthenticated:', isAuthenticated);
    return (
      <AdminGuard onAuthenticationComplete={handleAuthenticationComplete}>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen" suppressHydrationWarning>
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Đang tải bảng điều khiển quản trị...
                </p>
              </div>
            </div>
          </main>
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    console.log('AdminPage: Showing error screen - error:', error);
    return (
      <AdminGuard>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen" suppressHydrationWarning>
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-64 p-6">
            <div className="text-center p-8">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Lỗi tải bảng điều khiển quản trị
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </main>
        </div>
      </AdminGuard>
    );
  }

  console.log('AdminPage: Rendering main admin panel - states:', { 
    loading, 
    isClient, 
    isAuthenticated, 
    error, 
    stats: !!stats, 
    access: !!access, 
    userRole 
  });

  return (
    <AdminGuard onAuthenticationComplete={handleAuthenticationComplete}>
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen" suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-blue-600 dark:text-blue-400" size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Panel
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">                    {userRole === 'full_admin' ? 'Quản trị viên đầy đủ' : 
                     userRole === 'admin' ? 'Quản trị viên' : 'Kiểm duyệt viên'} • 
                    Quản lý và giám sát hệ thống
                  </p>
                </div>
              </div>

              {/* Quick Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Tổng số người dùng</p>
                          <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                        <Users size={24} className="text-blue-200" />
                      </div>
                    </CardBody>
                  </Card>                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Tổng số bài viết</p>
                          <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
                        </div>
                        <FileText size={24} className="text-green-200" />
                      </div>
                    </CardBody>
                  </Card>                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Báo cáo đang chờ</p>
                          <p className="text-2xl font-bold">{stats.pendingReports.toLocaleString()}</p>
                        </div>
                        <AlertTriangle size={24} className="text-orange-200" />
                      </div>
                    </CardBody>
                  </Card>                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Người dùng mới (tháng)</p>
                          <p className="text-2xl font-bold">{stats.newUsersThisMonth.toLocaleString()}</p>
                        </div>
                        <TrendingUp size={24} className="text-purple-200" />
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}
            </div>

            {/* Main Content Tabs */}
            <Card>
              <CardBody className="p-0">                <Tabs
                  aria-label="Bảng điều khiển quản trị"
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as string)}
                  variant="underlined"
                  classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-4 border-b border-divider",
                    cursor: "w-full bg-blue-600",
                    tab: "max-w-fit px-4 py-2 h-10",
                  }}
                >
                  <Tab
                    key="dashboard"                    title={
                      <div className="flex items-center space-x-2">
                        <Activity size={18} />
                        <span>Bảng điều khiển</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminDashboard userRole={userRole} />
                    </div>
                  </Tab>                  <Tab
                    key="users"                    title={
                      <div className="flex items-center space-x-2">
                        <Users size={18} />
                        <span>Người dùng</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminUsers userRole={userRole} />
                    </div>
                  </Tab>

                  <Tab
                    key="posts"
                    title={
                      <div className="flex items-center space-x-2">
                        <FileText size={18} />
                        <span>Bài viết</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminPosts userRole={userRole} />
                    </div>
                  </Tab>

                  <Tab
                    key="reports"                    title={
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={18} />
                        <span>Báo cáo</span>
                        {stats && stats.pendingReports > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {stats.pendingReports}
                          </span>
                        )}
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminReports userRole={userRole} />
                    </div>
                  </Tab>                  <Tab
                    key="analytics"                    title={
                      <div className="flex items-center space-x-2">
                        <BarChart size={18} />
                        <span>Phân tích</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminAnalytics userRole={userRole} />
                    </div>
                  </Tab>

                  <Tab
                    key="comments"
                    title={
                      <div className="flex items-center space-x-2">
                        <MessageSquare size={18} />
                        <span>Bình luận</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminComments userRole={userRole} />
                    </div>
                  </Tab>

                  <Tab
                    key="messages"
                    title={
                      <div className="flex items-center space-x-2">
                        <MessageCircle size={18} />
                        <span>Tin nhắn</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminMessages userRole={userRole} />
                    </div>
                  </Tab>

                  <Tab
                    key="chat-rooms"
                    title={
                      <div className="flex items-center space-x-2">
                        <Hash size={18} />
                        <span>Phòng chat</span>
                      </div>
                    }
                  >
                    <div className="p-6">
                      <AdminChatRooms userRole={userRole} />
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
