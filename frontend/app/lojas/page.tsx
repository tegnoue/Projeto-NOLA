'use client'; 
    
import cubeApi from '../../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useMemo, useState } from 'react'; 
import Link from 'next/link';
import { useFilters } from '@/lib/filters-context';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function getPreviousPeriod(dateRange: [string, string]): [string, string] {
  try {
    const start = new Date(dateRange[0]);
    const end = new Date(dateRange[1]);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const prevEndDate = new Date(start);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - (diffDays - 1));
    return [
      prevStartDate.toISOString().split('T')[0],
      prevEndDate.toISOString().split('T')[0]
    ];
  } catch (e) {
    return dateRange;
  }
}

function OwnVsFranchiseChart({ filters, timeDimensions }: { filters: any[]; timeDimensions: any[] }) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['stores.is_own'],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (OwnVsFranchise): {error.toString()}</div>;
  if (isLoading) return <div className="p-4 h-80">A carregar gráfico...</div>;
  
  const data = resultSet?.rawData().map(row => ({
    ...row,
    name: row['stores.is_own'] ? 'Loja Própria' : 'Franqueada'
  })) || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Faturamento: Próprias vs. Franqueadas</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales.invoicing" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Top5StoresByInvoicing({ filters, timeDimensions }: { filters: any[]; timeDimensions: any[] }) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['stores.name'],
    filters: filters,
    timeDimensions: timeDimensions,
    order: { 'sales.invoicing': 'desc' },
    limit: 5
  });

  if (error) return <div>Erro (Top5 Invoicing): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Top 5 Faturamento...</div>;
  const data = resultSet?.tablePivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Lojas (Faturamento)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Loja</TableHead><TableHead>Faturamento</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{String(row['stores.name'])}</TableCell>
                <TableCell>{String(row['sales.invoicing'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Top5StoresByCancellation({ filters, timeDimensions }: { filters: any[]; timeDimensions: any[] }) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.cancellation_rate'],
    dimensions: ['stores.name'],
    filters: filters,
    timeDimensions: timeDimensions,
    order: { 'sales.cancellation_rate': 'desc' },
    limit: 5
  });

  if (error) return <div>Erro (Top5 Cancellation): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Top 5 Cancelamento...</div>;
  const data = resultSet?.tablePivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Lojas (Taxa de Cancelamento)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Loja</TableHead><TableHead>Taxa de Cancel.</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{String(row['stores.name'])}</TableCell>
                <TableCell>{String(row['sales.cancellation_rate'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Top5StoresByGrowth({ filters, dateRange, timeDimensions }: { filters: any[]; dateRange: [string, string]; timeDimensions: any[] }) {
  
  const previousDateRange = getPreviousPeriod(dateRange);

  const { resultSet: currentData, isLoading: isLoadingCurrent, error: errorCurrent } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['stores.name'],
    filters: filters,
    timeDimensions: timeDimensions
  });
  
  const { resultSet: previousData, isLoading: isLoadingPrevious, error: errorPrevious } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['stores.name'],
    filters: filters,
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: previousDateRange, 
      },
    ],
  });

  const mergedData = useMemo(() => {
    if (!currentData || !previousData) return [] as any[];
    
    const currentPivot = currentData.tablePivot();
    const previousPivot = previousData.tablePivot();
    const previousMap = new Map(previousPivot.map(row => [row['stores.name'], row['sales.invoicing']]));

    const allStores = currentPivot.map(currentRow => {
      const storeName = String((currentRow as any)['stores.name']);
      const currentInvoicing = parseFloat(String((currentRow as any)['sales.invoicing']));
      const previousInvoicing = parseFloat(String(previousMap.get(storeName))) || 0;
      
      let growth = 0;
      if (previousInvoicing > 0) {
        growth = ((currentInvoicing - previousInvoicing) / previousInvoicing) * 100;
      } else if (currentInvoicing > 0) {
        growth = 100.0;
      }
      
      return {
        'stores.name': storeName,
        'sales.invoicing': currentInvoicing,
        'growth': growth,
      };
    });
    
    allStores.sort((a, b) => b.growth - a.growth);
    
    return allStores.slice(0, 5);
    
  }, [currentData, previousData]) as any[];

  const isLoading = isLoadingCurrent || isLoadingPrevious;

  if (errorCurrent) return <div>Erro (CurrentData): {errorCurrent.toString()}</div>;
  if (errorPrevious) return <div>Erro (PreviousData): {errorPrevious.toString()}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Lojas (Crescimento %)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>A carregar Top 5 Crescimento...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Loja</TableHead><TableHead>Crescimento %</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {mergedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{String(row['stores.name'])}</TableCell>
                  <TableCell>{row.growth.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}


function CityFilter({ selectedCity, onCityChange }: { selectedCity: string | null, onCityChange: (city: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.city'] });
  if (isLoading) return <div>A carregar cidades...</div>;
  if (error) return <div>Erro (CityFilter): {error.toString()}</div>;

  const cities = (resultSet?.tablePivot() || [])
    .map(row => row['stores.city'])
    .filter(city => city) 
    .sort();
  
  const uniqueCities = [...new Set(cities)];

  return (
    <div className="flex items-center space-x-2">
      <Label className="font-medium text-sm">Cidade:</Label>
      <Select 
        value={selectedCity || ""}
        onValueChange={(value) => onCityChange(value || null)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="-- Todas as Cidades --" />
        </SelectTrigger>
        <SelectContent>
          {uniqueCities.map((city, index) => (
            <SelectItem key={index} value={String(city)}>
              {String(city)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onCityChange(null)}
        disabled={!selectedCity}
      >
        Limpar
      </Button>
    </div>
  );
}

export default function PaginaLojas() {
  
  const { selectedStore, dateRange } = useFilters();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  
  const timeDimensions: any[] = [
    {
      dimension: 'sales.created_at',
      dateRange: dateRange, 
    },
  ];
  
  const baseFilters: any[] = [
    ...(selectedStore ? [{ 
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    }] : []),
    ...(selectedCity ? [{ 
      member: 'stores.city',
      operator: 'equals' as const,
      values: [selectedCity]
    }] : [])
  ];

  const completedFilters: any[] = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const, 
      values: ['COMPLETED']
    },
    ...baseFilters
  ];

  const allFilters: any[] = [
    ...baseFilters
  ];
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans">
        <h1 className="text-3xl font-bold p-4">Análise de Lojas (US13)</h1>
        
        <div className="p-4 bg-gray-50 border-t border-b flex flex-wrap items-center gap-4">
          <CityFilter selectedCity={selectedCity} onCityChange={setSelectedCity} />
        </div>

        <OwnVsFranchiseChart filters={completedFilters} timeDimensions={timeDimensions} />
        
        <hr className="my-4"/>

        <div className="p-4 flex justify-end">
          <Button asChild>
            <Link href="/lojas/tabela-completa">Ampliar (Ver Tabela Completa) &rarr;</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-4">
          <Top5StoresByInvoicing filters={completedFilters} timeDimensions={timeDimensions} />
          <Top5StoresByCancellation filters={allFilters} timeDimensions={timeDimensions} />
          <Top5StoresByGrowth filters={completedFilters} dateRange={dateRange} timeDimensions={timeDimensions} />
        </div>

      </main>
    </CubeProvider>
  );
}