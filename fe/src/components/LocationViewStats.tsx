// LocationViewStats.tsx - Component to display top locations by views
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  Skeleton
} from '@nextui-org/react';
import { MapPin, Eye, TrendingUp } from 'react-feather';
import { createAuthHeaders } from '@/services/AuthService';
import { useFeedContext } from '@/contexts/FeedContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface LocationViewStat {
  locationId: number;
  locationName: string;
  viewCount: number;
  uniqueViewers: number;
}

interface LocationViewStatsProps {
  className?: string;
  limit?: number;
  onLocationClick?: (locationId: number, locationName: string) => void;
}

export default function LocationViewStats({ className = '', limit = 5, onLocationClick }: LocationViewStatsProps) {
  // Try to use feed context if available, otherwise use prop or do nothing
  let setSelectedLocationId: ((locationId: number) => void) | undefined;
  try {
    const context = useFeedContext();
    setSelectedLocationId = context.setSelectedLocationId;
  } catch (error) {
    // Context not available, will fall back to onLocationClick prop
    setSelectedLocationId = undefined;
  }
  const [topLocations, setTopLocations] = useState<LocationViewStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleLocationClick = (locationId: number, locationName: string) => {
    if (setSelectedLocationId) {
      // Use feed context if available
      setSelectedLocationId(locationId);
    } else if (onLocationClick) {
      // Fall back to prop callback
      onLocationClick(locationId, locationName);
    }
    // If neither is available, location clicks do nothing (display only mode)
  };

  useEffect(() => {
    fetchTopLocations();
    
    // Update every 5 minutes
    const interval = setInterval(fetchTopLocations, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [limit]);  const fetchTopLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/post-views/locations/top?limit=${limit}`, {
        method: 'GET',
        headers: createAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setTopLocations(data);
        setError(null);
      } else {
        console.warn('Failed to fetch top locations:', response.statusText);
        setError('Không thể tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching top locations:', error);
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getLocationColor = (index: number): string => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="flex gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div className="flex flex-col">
              <p className="text-md font-semibold">Địa điểm HOT</p>
              <p className="text-small text-default-500">30 ngày qua</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-20 h-4 rounded" />
                </div>
                <Skeleton className="w-12 h-4 rounded" />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="flex gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div className="flex flex-col">
              <p className="text-md font-semibold">Địa điểm HOT</p>
              <p className="text-small text-default-500">30 ngày qua</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <p className="text-small text-danger">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">Địa điểm HOT</p>
            <p className="text-small text-default-500">30 ngày qua</p>
          </div>
        </div>
        <TrendingUp className="w-4 h-4 text-success ml-auto" />
      </CardHeader>
      <CardBody className="pt-0">
        {topLocations.length === 0 ? (
          <p className="text-small text-default-500 text-center py-4">
            Chưa có dữ liệu
          </p>
        ) : (          <div className="space-y-3">
            {topLocations.map((location, index) => {
              const isClickable = !!(setSelectedLocationId || onLocationClick);
              return (
                <div 
                  key={location.locationId} 
                  className={`flex items-center justify-between rounded-lg p-2 -m-2 transition-colors ${
                    isClickable ? 'cursor-pointer hover:bg-default-100' : ''
                  }`}
                  onClick={isClickable ? () => handleLocationClick(location.locationId, location.locationName) : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Chip
                      size="sm"
                      color={getLocationColor(index) as any}
                      variant="flat"
                      className="w-6 h-6 min-w-6 p-0 text-xs font-bold"
                    >
                      {index + 1}
                    </Chip>
                    <div className="flex flex-col">
                      <p className={`text-sm font-medium text-foreground transition-colors ${
                        isClickable ? 'hover:text-primary' : ''
                      }`}>
                        {location.locationName}
                      </p>
                      {location.uniqueViewers > 0 && (
                        <p className="text-xs text-default-500">
                          {formatNumber(location.uniqueViewers)} người xem
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-default-500" />
                    <span className="text-sm font-medium">
                      {formatNumber(location.viewCount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {topLocations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-divider">
            <div className="flex items-center justify-between text-xs text-default-500">
              <span>Tổng lượt xem</span>
              <span>{formatNumber(topLocations.reduce((sum, loc) => sum + loc.viewCount, 0))}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
