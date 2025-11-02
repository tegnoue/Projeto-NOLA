'use client'; 
    
import cubeApi from '../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataDisplayProps {
  selectedStore: string | null;
  dateRange: [string, string];
}

function DataDisplay({ selectedStore, dateRange }: DataDisplayProps) {
  
  const filters = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const,
      values: ['COMPLETED']
    }
  ];
  if (selectedStore) {
    filters.push({
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    });
  }

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.count',
      'sales.invoicing',
      'sales.avg_ticket'
    ],
    filters: filters,
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: dateRange, 
      },
    ],
  });

  if (error) return <div>Erro (DataDisplay): {error.toString()}</div>;
  
  const data = resultSet?.tablePivot()[0];

  return (
    <div className="grid gap-4 md:grid-cols-3 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? data['sales.count'] : 'N/A')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? data['sales.invoicing'] : 'N/A')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? data['sales.avg_ticket'] : 'N/A')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TopProductsProps {
  selectedStore: string | null;
  dateRange: [string, string];
}

function TopProductsPerInvoicing({ selectedStore, dateRange }: TopProductsProps) {
  
  const filters = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const,
      values: ['COMPLETED']
    }
  ];
  if (selectedStore) {
    filters.push({
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    });
  }
  
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.invoicing', 
    ],
    dimensions: [
      'products.name' 
    ],
    order: {
      'sales.invoicing': 'desc' 
    },
    limit: 10,
    filters: filters,
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: dateRange,
      },
    ],
  });

  if (error) return <div>Erro (TopProducts): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Top Produtos...</div>;
  
  const products = resultSet?.tablePivot() || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Top 10 Produtos por faturamento</h2>
      <Card>
        <CardContent className="pt-4">
          <ol className="list-decimal list-inside">
            {products.map((product, index) => (
              <li key={index} className="border-b last:border-b-0 py-2">
                <strong>{product['products.name']}</strong>: {product['sales.invoicing']}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

interface ChartComponentProps {
  selectedStore: string | null;
  dateRange: [string, string];
}

function SalesByHourChart({ selectedStore, dateRange }: ChartComponentProps) {
  const filters = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const,
      values: ['COMPLETED']
    }
  ];
  if (selectedStore) {
    filters.push({
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    });
  }

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['sales.hourOfDay'],
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: dateRange,
      },
    ],
    filters: filters,
    order: {
      'sales.hourOfDay': 'asc'
    }
  });

  if (error) return <div>Erro (SalesByHour): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Vendas por Hora...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Faturamento por Hora (US06)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sales.hourOfDay" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales.invoicing" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalesByDayOfWeekChart({ selectedStore, dateRange }: ChartComponentProps) {
  const filters = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const,
      values: ['COMPLETED']
    }
  ];
  if (selectedStore) {
    filters.push({
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    });
  }

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['sales.dayOfWeek'],
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: dateRange,
      },
    ],
    filters: filters,
    order: {
      'sales.dayOfWeek': 'asc'
    }
  });

  if (error) return <div>Erro (SalesByDayOfWeek): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Vendas por Dia da Semana...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Faturamento por Dia da Semana (US06)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sales.dayOfWeek" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales.invoicing" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
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
      <label className="font-medium">Filtro de Loja (US04): </label>
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
      <label className="font-medium">Filtro de Data (US02): </label>
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

interface TopItemsProps {
  selectedStore: string | null;
  dateRange: [string, string];
}

function TopItems({ selectedStore, dateRange }: TopItemsProps) {
  
  const filters = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const,
      values: ['COMPLETED']
    }
  ];
  if (selectedStore) {
    filters.push({
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    });
  }
  
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'item_product_sales.revenue',
      'item_product_sales.times_added'
    ],
    dimensions: [
      'items.name'
    ],
    order: {
      'item_product_sales.revenue': 'desc' 
    },
    limit: 10,
    filters: filters,
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: dateRange,
      },
    ],
  });

  if (error) return <div>Erro (TopItems): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Top Itens...</div>;
  
  const items = resultSet?.tablePivot() || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Top 10 Itens por Receita (US09)</h2>
      <Card>
        <CardContent className="pt-4">
          <ol className="list-decimal list-inside">
            {items.map((item, index) => (
              <li key={index} className="border-b last:border-b-0 py-2">
                <strong>{item['items.name']}</strong>: 
                {item['item_product_sales.revenue']} (adicionado {item['item_product_sales.times_added']} vezes)
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>([
    '2025-01-01', 
    '2025-12-31'
  ]);
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans">
        <h1 className="text-3xl font-bold p-4">Dashboard Financeiro (Home)</h1>
        
        <div className="p-4 bg-gray-50 border-t border-b flex flex-wrap items-center">
          <StoreFilter onStoreChange={setSelectedStore} />
          <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
        </div>
        
        <DataDisplay selectedStore={selectedStore} dateRange={dateRange} />
        
        <div className="grid md:grid-cols-2 gap-4">
          <SalesByHourChart selectedStore={selectedStore} dateRange={dateRange} />
          <SalesByDayOfWeekChart selectedStore={selectedStore} dateRange={dateRange} />
        </div>
        
        <hr/>
        
        <div className="grid md:grid-cols-2 gap-4">
          <TopProductsPerInvoicing selectedStore={selectedStore} dateRange={dateRange} />
          <TopItems selectedStore={selectedStore} dateRange={dateRange} />
        </div>
      </main>
    </CubeProvider>
  );
}