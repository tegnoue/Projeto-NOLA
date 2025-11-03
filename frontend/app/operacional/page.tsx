'use client'; 
    
import cubeApi from '../../lib/cube';
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState, useMemo } from 'react'; 
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Users, UserPlus, UserCheck } from 'lucide-react';

type DateRange = [string, string];
type DateFilterPreset = 'daily' | 'weekly' | 'monthly' | 'yearly';
type TimeGranularity = 'sales.hourOfDay' | 'sales.dayOfWeek' | 'sales.month';

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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

const formatPercent = (value: any) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return (num * 100).toFixed(1) + '%';
  }
  return 'N/A';
};

const formatMinutes = (value: any) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return num.toFixed(1) + ' min';
  }
  return 'N/A';
};

const formatMinutesAxis = (value: any) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return num.toFixed(0);
  }
  return '';
};

function LoadingComponent({ message = "A carregar..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

function ErrorComponent({ componentName, error }: { componentName: string, error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-destructive-foreground bg-destructive/80 p-4 rounded-lg">
      <AlertTriangle className="mb-2 h-6 w-6" />
      <span className="font-bold">Erro em {componentName}</span>
      <span className="text-sm text-center">{error.toString()}</span>
    </div>
  );
}

interface KpiProps {
  filters: any; 
  timeDimensions: any;
  dateRange?: DateRange;
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
            {isLoading ? '...' : (data ? numberFormatter.format(Number(data['sales.count_cancelled']) || 0) : 'N/A')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Cancelamento (US10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (data ? formatPercent(data['sales.cancellation_rate']) : 'N/A')}
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
          <Table>
            <TableHeader>
              <TableRow><TableHead>Bairro</TableHead><TableHead>Tempo Médio (min)</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(row['delivery_addresses.neighborhood'])}</TableCell>
                  <TableCell>{parseFloat(String(row['sales.avg_delivery_time'])).toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface ChartComGranularidadeProps {
  filters: any;
  timeDimensions: any;
  measure: string;
  title: string;
  color: string;
  initialGranularity: TimeGranularity;
  formatter: (value: any) => string;
}

function ChartComGranularidade({ filters, timeDimensions, measure, title, color, initialGranularity, formatter }: ChartComGranularidadeProps) {
  
  const [granularity, setGranularity] = useState<TimeGranularity>(initialGranularity);

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [measure],
    dimensions: [granularity],
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: timeDimensions[0].dateRange,
      },
    ],
    filters: filters,
    order: {
      [granularity]: 'asc'
    }
  });

  if (error) return <div>Erro ({title}): {error.toString()}</div>;
  if (isLoading) return <div className="p-4 h-80">A carregar {title}...</div>;
  
  const data = resultSet?.rawData() || [];
  const xAxisKey = granularity;

  return (
    <Card className="p-4 h-96">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold mb-2">{title}</CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant={granularity === 'sales.hourOfDay' ? 'default' : 'outline'} size="sm" onClick={() => setGranularity('sales.hourOfDay')}>Hora</Button>
          <Button variant={granularity === 'sales.dayOfWeek' ? 'default' : 'outline'} size="sm" onClick={() => setGranularity('sales.dayOfWeek')}>Dia (Sem.)</Button>
          <Button variant={granularity === 'sales.month' ? 'default' : 'outline'} size="sm" onClick={() => setGranularity('sales.month')}>Mês</Button>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis tickFormatter={formatter} />
            <Tooltip formatter={formatter}/>
            <Bar dataKey={measure} fill={color} name={title} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function FaturamentoPorCanal({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.invoicing',
    ],
    dimensions: [
      'channels.name'
    ],
    order: {
      'sales.invoicing': 'desc'
    },
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (FaturamentoPorCanal): {error.toString()}</div>;
  if (isLoading) return <div className="p-4 h-80">A carregar Faturamento por Canal...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Faturamento por Canal</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="channels.name" />
          <YAxis tickFormatter={(val) => currencyFormatter.format(val).replace('R$', '')} />
          <Tooltip formatter={(val: number) => currencyFormatter.format(val)} />
          <Bar dataKey="sales.invoicing" fill="#10b981" name="Faturamento" />
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
  if (isLoading) return <div className="p-4 h-80">A carregar Cancelamentos por Canal...</div>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="p-4 h-80">
      <h2 className="text-xl font-semibold mb-2">Taxa de Cancelamento por Canal (US10)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="channels.name" />
          <YAxis tickFormatter={(val) => formatPercent(val)} />
          <Tooltip formatter={(val: number) => formatPercent(val)} />
          <Bar dataKey="sales.cancellation_rate" fill="#ff7300" name="Taxa de Cancelamento" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PaginaOperacional() {
  
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('monthly'));

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
      <main className="font-sans p-4 md:p-8 space-y-6 bg-gray-100 dark:bg-zinc-900 min-h-screen">
        
        <Card>
          <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <StoreFilter onStoreChange={setSelectedStore} />
              <CityFilter onCityChange={setSelectedCity} />
            </div>
            <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
          </CardContent>
        </Card>
        
        <KpisOperacionais filters={allFilters} timeDimensions={timeDimensions} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FaturamentoPorCanal filters={completedFilters} timeDimensions={timeDimensions} />
          <CancelamentoPorCanal filters={allFilters} timeDimensions={timeDimensions} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartComGranularidade
            title="Tempo de Entrega por Período"
            measure="sales.avg_delivery_time"
            color="#d946ef"
            initialGranularity="sales.hourOfDay"
            filters={completedFilters}
            timeDimensions={timeDimensions}
            formatter={formatMinutes}
          />
          <ChartComGranularidade
            title="Tempo de Preparo por Período"
            measure="sales.avg_prep_time"
            color="#f59e0b"
            initialGranularity="sales.hourOfDay"
            filters={completedFilters}
            timeDimensions={timeDimensions}
            formatter={formatMinutes}
          />
        </div>

        <hr className="my-4" />
        
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
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;

  const stores = resultSet?.tablePivot() || [];

  return (
    <div className="flex-1 min-w-[200px]">
      <Label className="font-medium text-sm">Loja (US04):</Label>
      {isLoading ? (
        <LoadingComponent message="Lojas..." />
      ) : (
        <Select onValueChange={(value) => onStoreChange(value === 'all' ? null : value)}>
          <SelectTrigger>
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
      )}
    </div>
  );
}

interface CityFilterProps {
  onCityChange: (city: string | null) => void;
}
function CityFilter({ onCityChange }: CityFilterProps) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.city'] });
  if (error) return <div>Erro (CityFilter): {error.toString()}</div>;

  const cities = (resultSet?.tablePivot() || []).map(row => row['stores.city']).filter(city => city).sort();
  const uniqueCities = [...new Set(cities)];

  return (
    <div className="flex-1 min-w-[180px]">
      <Label className="font-medium text-sm">Cidade:</Label>
      {isLoading ? (
        <LoadingComponent message="Cidades..." />
      ) : (
        <Select onValueChange={(value) => onCityChange(value === 'all' ? null : value)}>
          <SelectTrigger>
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
      )}
    </div>
  );
}

interface DateFilterProps {
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
}
function DateFilter({ dateRange, onDateChange }: DateFilterProps) {
  const setPreset = (preset: DateFilterPreset) => {
    onDateChange(getDateRangeFromPreset(preset));
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <Label className="font-medium text-sm shrink-0">Período Rápido:</Label>
        <Button variant="outline" size="sm" onClick={() => setPreset('daily')}>Diário</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('weekly')}>Semanal</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('monthly')}>Mensal</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('yearly')}>Anual</Button>
      </div>
      <div className="flex flex-wrap items-center space-x-2">
        <Label className="font-medium text-sm shrink-0">Período Personalizado:</Label>
        <Input type="date" value={dateRange[0]} onChange={(e) => onDateChange([e.target.value, dateRange[1]])} className="w-auto" />
        <span className="mx-2 text-muted-foreground">Até:</span>
        <Input type="date" value={dateRange[1]} onChange={(e) => onDateChange([dateRange[0], e.target.value])} className="w-auto" />
      </div>
    </div>
  );
}

