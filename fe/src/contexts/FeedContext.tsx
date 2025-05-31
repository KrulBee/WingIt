"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SortOption = 'latest' | 'most_viewed' | 'most_loved' | 'most_commented';

interface FeedContextType {
  selectedLocationId: number | null;
  setSelectedLocationId: (locationId: number | null) => void;
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  return (
    <FeedContext.Provider value={{
      selectedLocationId,
      setSelectedLocationId,
      sortBy,
      setSortBy
    }}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
}
