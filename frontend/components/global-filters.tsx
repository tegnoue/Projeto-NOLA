'use client';
import { useCubeQuery } from '@cubejs-client/react';
import { useFilters } from '@/lib/filters-context';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateFilterPreset = 'daily' | 'weekly' | 'monthly' | 'yearly';

function getDateRangeFromPreset(preset: DateFilterPreset): [string, string] {
  const end = new Date();
  const start = new Date();
  
  if (preset === 'daily') {
    start.setDate(end.getDate() - 1);
  } else if (preset === 'weekly') {
    start.setDate(end.getDate() - 7);
  } else if (preset === 'monthly') {
    start.setMonth(end.getMonth() - 1);
  } else if (preset === 'yearly') {
    start.setFullYear(end.getFullYear() - 1);
  }
  
  return [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ];
}

function StoreFilter() {
  const { setSelectedStore } = useFilters();
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });

  if (isLoading) return <div>A carregar lojas...</div>;
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;
  
  const stores = resultSet?.tablePivot() || [];

  return (
    <div className="mr-4">
      <Label className="font-medium text-sm">Loja (US04):</Label>
      <Select 
        onValueChange={(value) => setSelectedStore(value || null)}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="-- Todas as Lojas --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Todas as Lojas --</SelectItem>
          {stores.map((store, index) => (
            <SelectItem key={index} value={String(store['stores.name'])}>
              {String(store['stores.name'])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CityFilter() {
  const { setSelectedCity } = useFilters();
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.city'] });

  if (isLoading) return <div>A carregar cidades...</div>;
  if (error) return <div>Erro (CityFilter): {error.toString()}</div>;
  
  const cities = (resultSet?.tablePivot() || [])
    .map(row => row['stores.city'])
    .filter(city => city) 
    .sort();
  const uniqueCities = [...new Set(cities)];

  return (
    <div className="mr-4">
      <Label className="font-medium text-sm">Cidade:</Label>
      <Select 
        onValueChange={(value) => setSelectedCity(value || null)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="-- Todas as Cidades --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Todas as Cidades --</SelectItem>
          {uniqueCities.map((city, index) => (
            <SelectItem key={index} value={String(city)}>
              {String(city)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


function DateFilter() {
  const { dateRange, setDateRange } = useFilters();
  
  const setPreset = (preset: DateFilterPreset) => {
    setDateRange(getDateRangeFromPreset(preset));
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <Label className="font-medium text-sm">Período Rápido:</Label>
        <Button variant="outline" size="sm" onClick={() => setPreset('daily')}>Diário</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('weekly')}>Semanal</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('monthly')}>Mensal</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('yearly')}>Anual</Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Label className="font-medium text-sm">Período Personalizado:</Label>
        <Input 
          type="date" 
          value={dateRange[0]} 
          onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
          className="w-auto"
        />
        <span className="mx-2">Até:</span>
        <Input 
          type="date" 
          value={dateRange[1]} 
          onChange={(e) => setDateRange([dateRange[0], e.target.value])} 
          className="w-auto"
        />
      </div>
    </div>
  );
}

export function GlobalFilters() {
  return (
    <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center gap-4">
      <StoreFilter />
      <CityFilter />
      <DateFilter />
    </div>
  );
}
