"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import LocationService, { Location } from '@/services/LocationService';

interface LocationFilterProps {
  selectedLocationId: number | null;
  onLocationChange: (locationId: number | null) => void;
  className?: string;
}

export default function LocationFilter({ 
  selectedLocationId, 
  onLocationChange, 
  className = "" 
}: LocationFilterProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationData = await LocationService.getAllLocations();
        setLocations(locationData);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);  const handleSelectionChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey === 'all') {
      onLocationChange(null);
    } else {
      onLocationChange(Number(selectedKey));
    }
  };

  const getSelectedKeys = () => {
    if (selectedLocationId === null) {
      return new Set(['all']);
    } else {
      return new Set([selectedLocationId.toString()]);
    }
  };  return (
    <Select
      label="Lọc theo địa điểm"
      placeholder="Chọn địa điểm..."
      selectedKeys={getSelectedKeys()}
      onSelectionChange={handleSelectionChange}
      className={`w-full ${className}`}
      isLoading={loading}
      size="sm"
      classNames={{
        trigger: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500",
        label: "text-gray-700 dark:text-gray-300",
        value: "text-gray-900 dark:text-gray-100"
      }}
      items={[
        { key: "all", label: "Tất cả địa điểm" },
        ...locations.map(location => ({
          key: location.id.toString(),
          label: location.location
        }))
      ]}
    >
      {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
    </Select>
  );
}
