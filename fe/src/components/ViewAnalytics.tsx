// ViewAnalytics.tsx - Component to display view analytics
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Divider,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure
} from '@nextui-org/react';
import { Eye, TrendingUp, Clock, Users } from 'react-feather';
import { viewService } from '@/services';

interface ViewAnalyticsProps {
  postId?: string; // If provided, show analytics for specific post
  className?: string;
}

export default function ViewAnalytics({ postId, className = '' }: ViewAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [postStats, setPostStats] = useState<any>(null);
  const [recentViews, setRecentViews] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    updateAnalytics();
    
    // Update analytics every 30 seconds
    const interval = setInterval(updateAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, [postId]);  const updateAnalytics = async () => {
    try {
      if (postId) {
        // Get analytics for specific post
        const stats = await viewService.getPostViewStats(postId);
        setPostStats(stats);
      } else {
        // Get general analytics
        const summary = await viewService.getAnalyticsSummary();
        setAnalytics(summary);
        
        const recent = viewService.getRecentViews(10);
        setRecentViews(recent);
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${Math.round(milliseconds / 1000)}s`;
    return `${Math.round(milliseconds / 60000)}m`;
  };

  const formatSource = (source: string) => {
    const sourceMap: Record<string, { label: string; color: string }> = {
      feed: { label: 'Bảng tin', color: 'primary' },
      modal: { label: 'Chi tiết', color: 'secondary' },
      profile: { label: 'Trang cá nhân', color: 'success' },
      search: { label: 'Tìm kiếm', color: 'warning' },
      bookmark: { label: 'Đã lưu', color: 'danger' },
      notification: { label: 'Thông báo', color: 'default' }
    };
    
    return sourceMap[source] || { label: source, color: 'default' };
  };

  if (postId) {
    // Show post-specific analytics
    if (!postStats) return null;

    return (
      <Card className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-lg ${className}`}>
        <CardHeader className="flex gap-3">
          <Eye className="w-5 h-5" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">Thống kê lượt xem</p>
            <p className="text-small text-default-500">Post #{postId}</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Tổng lượt xem:</span>
            <Chip
              color="primary"
              variant="flat"
              classNames={{
                base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                content: "text-gray-900 dark:text-gray-100"
              }}
            >
              {postStats.totalViews}
            </Chip>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Người xem duy nhất:</span>
            <Chip
              color="secondary"
              variant="flat"
              classNames={{
                base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                content: "text-gray-900 dark:text-gray-100"
              }}
            >
              {postStats.uniqueViews}
            </Chip>
          </div>

          {postStats.averageDuration > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Thời gian xem TB:</span>
              <Chip
                color="success"
                variant="flat"
                classNames={{
                  base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                  content: "text-gray-900 dark:text-gray-100"
                }}
              >
                {formatDuration(postStats.averageDuration)}
              </Chip>
            </div>
          )}          {Object.keys(postStats.viewsBySource).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Nguồn xem:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(postStats.viewsBySource).map(([source, count]) => {
                  const sourceInfo = formatSource(source);
                  return (
                    <Chip
                      key={source}
                      color={sourceInfo.color as any}
                      size="sm"
                      variant="flat"
                      className="h-6"
                      classNames={{
                        base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                        content: "text-gray-900 dark:text-gray-100"
                      }}
                    >
                      {sourceInfo.label}: {String(count)}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  // Show general analytics
  if (!analytics) return null;

  return (
    <>
      <Card className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-lg ${className}`}>
        <CardHeader className="flex gap-3">
          <TrendingUp className="w-5 h-5" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">Phân tích lượt xem</p>
            <p className="text-small text-default-500">Tổng quan hoạt động</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary-50 dark:bg-gray-700 border border-primary-200 dark:border-gray-600 rounded-lg">
              <p className="text-2xl font-bold text-primary dark:text-primary-400">{analytics.totalPosts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Bài đã xem</p>
            </div>
            <div className="text-center p-3 bg-secondary-50 dark:bg-gray-700 border border-secondary-200 dark:border-gray-600 rounded-lg">
              <p className="text-2xl font-bold text-secondary dark:text-secondary-400">{analytics.totalViews}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tổng lượt xem</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Hôm nay:</span>
              <Chip
                color="success"
                size="sm"
                classNames={{
                  base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                  content: "text-gray-900 dark:text-gray-100"
                }}
              >
                {analytics.viewsToday}
              </Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tuần này:</span>
              <Chip
                color="warning"
                size="sm"
                classNames={{
                  base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                  content: "text-gray-900 dark:text-gray-100"
                }}
              >
                {analytics.viewsThisWeek}
              </Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">TB/bài:</span>
              <Chip
                color="default"
                size="sm"
                classNames={{
                  base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                  content: "text-gray-900 dark:text-gray-100"
                }}
              >
                {analytics.averageViewsPerPost.toFixed(1)}
              </Chip>
            </div>
          </div>

          {analytics.topSources.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Top nguồn xem:</p>
              <div className="space-y-1">
                {analytics.topSources.slice(0, 3).map((sourceData: any, index: number) => {
                  const sourceInfo = formatSource(sourceData.source);
                  const percentage = (sourceData.count / analytics.totalViews) * 100;
                  
                  return (
                    <div key={sourceData.source} className="flex items-center gap-3">
                      <Chip
                        color={sourceInfo.color as any}
                        size="sm"
                        variant="dot"
                        className="min-w-[5rem] flex-shrink-0 h-6"
                        classNames={{
                          base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                          content: "text-gray-900 dark:text-gray-100"
                        }}
                      >
                        {sourceInfo.label}
                      </Chip>
                      <Progress
                        size="sm"
                        value={percentage}
                        className="flex-1"
                        color={sourceInfo.color as any}
                      />
                      <span className="text-xs text-default-500 min-w-[2.5rem] text-right flex-shrink-0">
                        {sourceData.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button 
            size="sm" 
            variant="light" 
            onPress={onOpen}
            className="w-full"
          >
            Xem chi tiết
          </Button>
        </CardBody>
      </Card>

      {/* Detailed Analytics Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3>Phân tích chi tiết lượt xem</h3>
            <p className="text-sm text-default-500">Thống kê đầy đủ về hoạt động xem bài viết</p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <CardBody className="text-center">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-primary dark:text-primary-400" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analytics.totalViews}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tổng lượt xem</p>
                  </CardBody>
                </Card>
                <Card className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <CardBody className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-secondary dark:text-secondary-400" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analytics.totalPosts}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Bài đã xem</p>
                  </CardBody>
                </Card>
                <Card className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <CardBody className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success dark:text-success-400" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analytics.averageViewsPerPost.toFixed(1)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Lượt xem TB</p>
                  </CardBody>
                </Card>
              </div>

              {/* All Sources */}
              <div>
                <h4 className="font-semibold mb-3">Phân tích theo nguồn</h4>
                <div className="space-y-2">
                  {analytics.topSources.map((sourceData: any) => {
                    const sourceInfo = formatSource(sourceData.source);
                    const percentage = (sourceData.count / analytics.totalViews) * 100;
                    
                    return (
                      <div key={sourceData.source} className="flex items-center gap-3">
                        <Chip
                          color={sourceInfo.color as any}
                          variant="flat"
                          size="sm"
                          className="min-w-[5rem] h-6"
                          classNames={{
                            base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                            content: "text-gray-900 dark:text-gray-100"
                          }}
                        >
                          {sourceInfo.label}
                        </Chip>
                        <Progress 
                          size="md" 
                          value={percentage} 
                          className="flex-1"
                          color={sourceInfo.color as any}
                        />
                        <div className="text-right min-w-16">
                          <p className="text-sm font-medium">{sourceData.count}</p>
                          <p className="text-xs text-default-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Views */}
              {recentViews.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Lượt xem gần đây</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recentViews.map((view, index) => {
                      const sourceInfo = formatSource(view.source);
                      return (
                        <div key={`${view.postId}-${index}`} className="flex items-center justify-between p-2 bg-default-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Post #{view.postId}</span>
                            <Chip
                              size="sm"
                              color={sourceInfo.color as any}
                              variant="flat"
                              className="h-6"
                              classNames={{
                                base: "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500",
                                content: "text-gray-900 dark:text-gray-100"
                              }}
                            >
                              {sourceInfo.label}
                            </Chip>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-default-500">
                              {new Date(view.viewedAt).toLocaleTimeString('vi-VN')}
                            </p>
                            {view.duration && (
                              <p className="text-xs text-default-400">
                                {formatDuration(view.duration)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  color="warning" 
                  variant="flat"
                  onPress={() => {
                    viewService.clearOldViews();
                    updateAnalytics();
                  }}
                >
                  Xóa dữ liệu cũ
                </Button>
                <Button 
                  size="sm" 
                  color="danger" 
                  variant="flat"
                  onPress={() => {
                    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu xem?')) {
                      viewService.clearAllViews();
                      updateAnalytics();
                      onClose();
                    }
                  }}
                >
                  Xóa tất cả
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
