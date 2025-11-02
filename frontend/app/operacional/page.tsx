'use client'; 
    
import cubeApi from '../../lib/cube';
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; 
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface KpiProps {
  filters: any; 
  timeDimensions: any;
}

function KpisOperacionais({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.avg_prep_time', 
      'sales.avg_delivery_time',
      'sales.count_cancelled',
      'sales.cancellation_rate'
    ],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (KPIs): {error.toString()}</div>;
  const data = resultSet?.tablePivot()[0];

  return (
    <div className="grid gap-4 md:grid-cols-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio de Preparo (min)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? parseFloat(String(data['sales.avg_prep_time'])).toFixed(1) : 'N/A')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio de Entrega (min)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? parseFloat(String(data['sales.avg_delivery_time'])).toFixed(1) : 'N/A')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas Canceladas (US10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? data['sales.count_cancelled'] : 'N/A')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Cancelamento (US10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? data['sales.cancellation_rate'] : 'N/A')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RankingBairros({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.avg_delivery_time'
    ],
    dimensions: [
      'delivery_addresses.neighborhood'
    ],
    order: {
      'sales.avg_delivery_time': 'desc'
    },
    limit: 5,
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (Bairros): {error.toString()}</div>;
  if (isLoading) return <div>A carregar ranking de bairros...</div>;
  
  const data = resultSet?.tablePivot() || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Top 5 Piores Bairros (Tempo de Entrega)</h2>
      <Card>
        <CardContent className="pt-4">
          <ol className="list-decimal list-inside">
            {data.map((row, index) => (
              <li key={index} className="border-b last:border-b-0 py-2">
                <strong>{row['delivery_addresses.neighborhood']}</strong>: 
                {parseFloat(String(row['sales.avg_delivery_time'])).toFixed(1)} min
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function TempoPorHora({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.avg_delivery_time'
    ],
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: timeDimensions[0].dateRange,
        granularity: 'hour'
      },
    ],
    filters: filters,
    order: {
      'sales.created_at.hour': 'asc'
    }
  });

  if (error) return <div>Erro (TempoPorHora): {error.toString()}</div>;
  if (isLoading) return <div>A carregar tempo por hora...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Tempo de Entrega por Hora do Dia</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sales.created_at.hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales.avg_delivery_time" fill="#d946ef" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CancelamentoPorCanal({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.cancellation_rate',
    ],
    dimensions: [
      'channels.name'
    ],
    order: {
      'sales.cancellation_rate': 'desc'
    },
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (CancelamentoPorCanal): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Cancelamentos por Canal...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Taxa de Cancelamento por Canal (US10)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="channels.name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales.cancellation_rate" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export default function PaginaOperacional() {
  
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>([
    '2025-01-01', 
    '2025-12-31'
  ]);

  const filters: any[] = [ 
    ...(selectedStore ? [{ 
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    }] : [])
  ];
  
  const timeDimensions: any[] = [
    {
      dimension: 'sales.created_at',
      dateRange: dateRange, 
    },
  ];

  const completedFilters: any[] = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const, 
      values: ['COMPLETED']
    },
    ...(selectedStore ? [{ 
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    }] : [])
  ];
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans">
        <h1 className="text-3xl font-bold p-4">Dashboard Operacional (US07)</h1>
        
        <div className="p-4 bg-gray-50 border-t border-b flex flex-wrap items-center">
          <StoreFilter onStoreChange={setSelectedStore} />
          <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
        </div>
        
        <KpisOperacionais filters={filters} timeDimensions={timeDimensions} />
        
        <div className="grid md:grid-cols-2 gap-4">
          <CancelamentoPorCanal filters={filters} timeDimensions={timeDimensions} />
          <TempoPorHora filters={completedFilters} timeDimensions={timeDimensions} />
        </div>

        <hr />
        
        <RankingBairros filters={completedFilters} timeDimensions={timeDimensions} />

      </main>
    </CubeProvider>
  );
}

interface StoreFilterProps {
  onStoreChange: (store: string | null) => void;
}
function StoreFilter({ onStoreChange }: StoreFilterProps) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });
  if (isLoading) return <div>A carregar lojas...</div>;
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;
  const stores = resultSet?.tablePivot() || [];

  return (
    <div className="mr-4">
      <label className="font-medium">Filtro de Loja: </label>
      <select 
        onChange={(e) => onStoreChange(e.target.value || null)}
        className="border p-2 rounded"
      >
        <option value="">-- Todas as Lojas --</option>
        {stores.map((store, index) => (
          <option key={index} value={String(store['stores.name'])}>
            {String(store['stores.name'])}
          </option>
        ))}
      </select>
    </div>
  );
}

interface DateFilterProps {
  dateRange: [string, string];
  onDateChange: (newRange: [string, string]) => void;
}
function DateFilter({ dateRange, onDateChange }: DateFilterProps) {
  return (
    <div>
      <label className="font-medium">Filtro de Data: </label>
      <input 
        type="date" 
        value={dateRange[0]} 
        onChange={(e) => onDateChange([e.target.value, dateRange[1]])}
        className="border p-2 rounded"
      />
      <label className="mx-2">Até:</label>
      <input 
        type="date" 
        value={dateRange[1]} 
        onChange={(e) => onDateChange([dateRange[0], e.target.value])} 
        className="border p-2 rounded"
      />
    </div>
  );
}