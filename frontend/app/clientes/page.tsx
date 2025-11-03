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

function KpisClientes({ filters, timeDimensions, dateRange = getDateRangeFromPreset('monthly') }: KpiProps) {
  
  const { resultSet: totalSet, isLoading: isLoadingTotal, error: errorTotal } = useCubeQuery({
    measures: [
      'sales.total_clientes',
    ],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  const { resultSet: newSet, isLoading: isLoadingNew, error: errorNew } = useCubeQuery({
    measures: [
      'sales.total_clientes',
    ],
    filters: filters,
    timeDimensions: [
      ...timeDimensions,
      {
        dimension: 'customers.created_at',
        dateRange: dateRange 
      }
    ],
  });
  
  const { resultSet: returningSet, isLoading: isLoadingReturning, error: errorReturning } = useCubeQuery({
    measures: [
      'sales.total_clientes',
    ],
    filters: filters,
    timeDimensions: [
      ...timeDimensions,
      {
        dimension: 'customers.created_at',
        dateRange: [null, dateRange[0]]
      }
    ],
  });


  if (errorTotal) return <Card className="h-full"><CardContent className="p-0"><ErrorComponent componentName="KpisClientes (Total)" error={errorTotal} /></CardContent></Card>;
  if (errorNew) return <Card className="h-full"><CardContent className="p-0"><ErrorComponent componentName="KpisClientes (New)" error={errorNew} /></CardContent></Card>;
 // if (errorReturning) return <Card className="h-full"><CardContent className="p-0"><ErrorComponent componentName="KpisClientes (Returning)" error={errorReturning} /></CardContent></Card>;

  const totalData = totalSet?.tablePivot()[0];
  const newData = newSet?.tablePivot()[0];
  const returningData = returningSet?.tablePivot()[0];
  
  const isLoading = isLoadingTotal || isLoadingNew || isLoadingReturning;

  return (
    <div className="grid gap-4 md:grid-cols-3 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Diferentes (Período)</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : (totalData ? (Number.isFinite(Number(totalData['sales.total_clientes'])) ? numberFormatter.format(Number(totalData['sales.total_clientes'])) : 'N/A') : 'N/A')}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Novos (Período)</CardTitle>
           <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (newData ? numberFormatter.format(Number(newData['sales.total_clientes']) || 0) : '0')}
            </div>
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Recorrentes (Período)</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (returningData ? numberFormatter.format(Number(returningData['sales.total_clientes']) || 0) : '0')}
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

function AgeRangeDonutChart({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.total_clientes'],
    dimensions: ['customers.age_range'],
    filters,
    timeDimensions,
  });

  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="AgeRangeDonutChart" error={error} /></CardContent></Card>;

  const data = (resultSet?.tablePivot() || [])
    .map((row: any) => ({
      name: row['customers.age_range'],
      value: Number(row['sales.total_clientes']) || 0
    }))
    .filter(d => d.value > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Clientes por Faixa Etária</CardTitle>
      </CardHeader>
      <CardContent className="h-96">
        {isLoading ? (
          <LoadingComponent message="A carregar gráfico de faixa etária..." />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhum dado disponível (verifique `birth_date` no `generate_data.py`).
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                label={(entry: any) => `${entry.name}: ${numberFormatter.format(Number(entry.value) || 0)}`}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => numberFormatter.format(val)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}


function RelatorioClientes({ filters, timeDimensions }: KpiProps) {
  
  const [minFrequencia, setMinFrequencia] = useState('3');
  const [minRecencia, setMinRecencia] = useState('30');

  const rfmFilters = useMemo(() => ([
    ...filters,
    {
      member: 'sales.frequency',
      operator: 'gte' as const,
      values: [minFrequencia]
    },
    {
      member: 'sales.days_since_last_purchase',
      operator: 'gte' as const,
      values: [minRecencia]
    }
  ]), [filters, minFrequencia, minRecencia]);

  const { resultSet, isLoading, error } = useCubeQuery({
    dimensions: [
      'customers.customer_name',
      'customers.phone_number',
      'customers.email'
    ],
    measures: [
      'sales.frequency',
      'sales.days_since_last_purchase'
    ],
    filters: rfmFilters,
    timeDimensions: timeDimensions,
    order: {
      'sales.days_since_last_purchase': 'desc'
    },
    limit: 100
  });

  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="RelatorioClientes" error={error} /></CardContent></Card>;
  
  const clientes = resultSet?.tablePivot() || [];

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Relatório de Clientes em Risco</CardTitle>
        <CardDescription>
          Clientes que compraram mas não voltaram.
        </CardDescription>
        
        <div className="flex space-x-4 pt-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="freq">Frequência {'>'}=</Label>
            <Input 
              id="freq"
              type="number" 
              value={minFrequencia}
              onChange={(e) => setMinFrequencia(e.target.value)}
              className="w-20"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="rec">Dias sem Comprar {'>'}=</Label>
            <Input 
              id="rec"
              type="number" 
              value={minRecencia}
              onChange={(e) => setMinRecencia(e.target.value)}
              className="w-20"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <LoadingComponent message="A carregar relatório de clientes..." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Nº Compras</TableHead>
                <TableHead>Dias sem Comprar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(cliente['customers.customer_name'])}</TableCell>
                  <TableCell>{String(cliente['customers.phone_number'])}</TableCell>
                  <TableCell>{numberFormatter.format(Number(cliente['sales.frequency']) || 0)}</TableCell>
                  <TableCell>{numberFormatter.format(Number(cliente['sales.days_since_last_purchase']) || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function TopStoresNewCustomers({ filters, timeDimensions, dateRange }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.total_clientes',
    ],
    dimensions: [
      'stores.name'
    ],
    timeDimensions: [
      ...timeDimensions,
      {
        dimension: 'customers.created_at',
        dateRange: dateRange 
      }
    ],
    filters: filters,
    order: {
      'sales.total_clientes': 'desc'
    },
    limit: 5
  });

  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="TopStoresNewCustomers" error={error} /></CardContent></Card>;

  const data = resultSet?.tablePivot() || [];

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Top 5 Lojas por Clientes Novos</CardTitle>
        <CardDescription>
          Quais lojas mais adquiriram clientes novos no período selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        {isLoading ? (
          <LoadingComponent message="A carregar ranking de lojas..." />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhum dado disponível.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(val) => numberFormatter.format(val)} />
              <YAxis 
                dataKey="stores.name" 
                type="category"
                width={150}
                interval={0}
              />
              <Tooltip formatter={(val: number) => numberFormatter.format(val)} />
              <Legend />
              <Bar dataKey="sales.total_clientes" name="Clientes Novos" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaginaClientes() {
  
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
        
        <KpisClientes 
          filters={completedFilters} 
          timeDimensions={timeDimensions}
          dateRange={dateRange}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AgeRangeDonutChart filters={completedFilters} timeDimensions={timeDimensions} />
          <RelatorioClientes filters={completedFilters} timeDimensions={timeDimensions} />
        </div>

        <TopStoresNewCustomers 
          filters={completedFilters} 
          timeDimensions={timeDimensions}
          dateRange={dateRange}
        />

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

