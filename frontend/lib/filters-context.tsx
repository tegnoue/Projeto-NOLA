'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

type DateRange = [string, string];

interface FiltersContextType {
  selectedStore: string | null;
  setSelectedStore: (store: string | null) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedCity: string | null; // <-- ADICIONE ESTA LINHA
  setSelectedCity: (city: string | null) => void; // <-- ADICIONE ESTA LINHA
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>([
    '2025-01-01', 
    '2025-12-31'
  ]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // <-- ADICIONE ESTA LINHA

  return (
    <FiltersContext.Provider value={{ 
      selectedStore, setSelectedStore, 
      dateRange, setDateRange,
      selectedCity, setSelectedCity // <-- ADICIONE ESTA LINHA
    }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}
