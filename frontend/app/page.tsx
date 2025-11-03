'use client'; 
    
import cubeApi from '../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState, useMemo } from 'react'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianAxis
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DateRange = [string, string];
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


interface DashboardComponentProps {
  filters: any;
  timeDimensions: any;
}

function SalesLineChart({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.count'],
    timeDimensions: [
      {
        ...timeDimensions[0],
        granularity: 'day'
      },
    ],
    filters: filters,
    order: {
      'sales.created_at.day': 'asc'
    }
  });

  if (error) return <div>Erro (SalesLineChart): {error.toString()}</div>;
  if (isLoading) return <div className="p-4 h-80">A carregar gráfico de linha...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Dia (Quantidade)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sales.created_at.day" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="sales.count" 
              stroke="#8884d8" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function normalizeCubeRawData(raw: any[] = []) {
  return raw
    .map((item: any) => {
      const name = item['channels.name'] || item['Channels.name'] || item['Channels Name'] || item['channels_name'];
      const rawValue = item['sales.count'] || item['Sales.count'] || item['Sales Count'] || item['sales_count'];
      const value = typeof rawValue === 'string' ? Number(rawValue.replace(/\D/g, '')) : Number(rawValue);
      return { name, value: Number.isFinite(value) ? value : 0 };
    })
    .filter(d => d.name) 
    .map(d => ({ ...d, value: d.value || 0 }));
}


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

function ChannelDonutChart({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.count'],
    dimensions: ['channels.name'],
    filters,
    timeDimensions,
  });

  if (error) return <div>Erro (ChannelDonutChart): {error.toString()}</div>;
  if (isLoading) return <div className="p-4 h-80">A carregar gráfico de canais...</div>;

  const raw = resultSet?.rawData() || [];
  console.log('ChannelDonutChart raw:', raw);

  const data = normalizeCubeRawData(raw)
    .filter(d => d.value > 0); // opcional: remove zeros, evita fatias invisíveis

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Vendas por Canal</CardTitle></CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div>Nenhum dado disponível para o período selecionado.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Vendas por Canal</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(val: any) => Number(val).toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}



function KpiCards({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.invoicing',
      'sales.avg_ticket'
    ],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (KpiCards): {error.toString()}</div>;
  const data = resultSet?.tablePivot()[0];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Resultados do Período</CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex flex-col justify-center items-center">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-500">Faturamento no Período</h3>
          <p className="text-4xl font-bold">
            {isLoading ? '...' : (data ? data['sales.invoicing'] : 'N/A')}
          </p>
        </div>
        <hr className="my-8 w-3/4" />
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-500">Ticket Médio no Período</h3>
          <p className="text-4xl font-bold">
            {isLoading ? '...' : (data ? data['sales.avg_ticket'] : 'N/A')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TopProducts({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.count'],
    dimensions: ['products.name'],
    order: { 'sales.count': 'desc' },
    limit: 5,
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (TopProducts): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Top Produtos...</div>;
  const products = resultSet?.tablePivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Produtos (por Quantidade)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Produto</TableHead><TableHead>Quantidade</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {products.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{String(row['products.name'])}</TableCell>
                <TableCell>{String(row['sales.count'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TopStores({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.count'],
    dimensions: ['stores.name'],
    order: { 'sales.count': 'desc' },
    limit: 5,
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (TopStores): {error.toString()}</div>;
  if (isLoading) return <div>A carregar Top Lojas...</div>;
  const stores = resultSet?.tablePivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Lojas (por Quantidade)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Loja</TableHead><TableHead>Quantidade</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{String(row['stores.name'])}</TableCell>
                <TableCell>{String(row['sales.count'])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StoreFilter({ onStoreChange }: { onStoreChange: (store: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });
  if (isLoading) return <div>A carregar lojas...</div>;
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;
  const stores = resultSet?.tablePivot() || [];

  return (
    <div className="mr-4">
      <Label className="font-medium text-sm">Loja (US04):</Label>
      <Select onValueChange={(value) => onStoreChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="-- Todas as Lojas --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">-- Todas as Lojas --</SelectItem>
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

function CityFilter({ onCityChange }: { onCityChange: (city: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.city'] });
  if (isLoading) return <div>A carregar cidades...</div>;
  if (error) return <div>Erro (CityFilter): {error.toString()}</div>;
  const cities = (resultSet?.tablePivot() || []).map(row => row['stores.city']).filter(city => city).sort();
  const uniqueCities = [...new Set(cities)];

  return (
    <div className="mr-4">
      <Label className="font-medium text-sm">Cidade:</Label>
      <Select onValueChange={(value) => onCityChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="-- Todas as Cidades --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">-- Todas as Cidades --</SelectItem>
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

function DateFilter({ dateRange, onDateChange }: { dateRange: DateRange, onDateChange: (range: DateRange) => void }) {
  const setPreset = (preset: DateFilterPreset) => {
    onDateChange(getDateRangeFromPreset(preset));
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
        <Input type="date" value={dateRange[0]} onChange={(e) => onDateChange([e.target.value, dateRange[1]])} className="w-auto" />
        <span className="mx-2">Até:</span>
        <Input type="date" value={dateRange[1]} onChange={(e) => onDateChange([dateRange[0], e.target.value])} className="w-auto" />
      </div>
    </div>
  );
}

export default function Home() {
  
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(['2025-01-01', '2025-12-31']);
  
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
    }] : []),
    ...(selectedCity ? [{ 
      member: 'stores.city',
      operator: 'equals' as const,
      values: [selectedCity]
    }] : [])
  ];
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans p-4 space-y-4">
        
        <div className="p-4 bg-gray-50 border-t border-b flex flex-wrap items-center gap-4">
          <StoreFilter onStoreChange={setSelectedStore} />
          <CityFilter onCityChange={setSelectedCity} />
          <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
        </div>
        
        <SalesLineChart filters={completedFilters} timeDimensions={timeDimensions} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChannelDonutChart filters={completedFilters} timeDimensions={timeDimensions} />
          <KpiCards filters={completedFilters} timeDimensions={timeDimensions} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopProducts filters={completedFilters} timeDimensions={timeDimensions} />
          <TopStores filters={completedFilters} timeDimensions={timeDimensions} />
        </div>

      </main>
    </CubeProvider>
  );
}