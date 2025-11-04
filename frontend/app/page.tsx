'use client'; 
    
import cubeApi from '../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react';
import { Query } from '@cubejs-client/core';
import { 
  LineChart, Line, PieChart, Pie, Cell, Legend, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar
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
import { Loader2, AlertTriangle, DollarSign, ShoppingBag, TrendingDown, Download, CreditCard } from 'lucide-react';

// --- Funções helper (Inalteradas) ---
type DateRange = [string, string];
type DateFilterPreset = 'daily' | 'weekly' | 'monthly' | 'yearly';
function getDateRangeFromPreset(preset: DateFilterPreset): [string, string] {
  const end = new Date();
  const start = new Date();
  if (preset === 'daily') { start.setDate(end.getDate() - 1); }
  else if (preset === 'weekly') { start.setDate(end.getDate() - 7); }
  else if (preset === 'monthly') { start.setMonth(end.getMonth() - 1); }
  else if (preset === 'yearly') { start.setFullYear(end.getFullYear() - 1); }
  return [ start.toISOString().split('T')[0], end.toISOString().split('T')[0] ];
}
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numberFormatter = new Intl.NumberFormat('pt-BR');
const formatPercent = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};
const dateFormatter = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  } catch (e) { return dateString; }
};
function normalizeCubeRawData(raw: any[] = []) {
  return raw.map((item: any) => {
    // Nomes em minúsculo para bater com a query
    const name = item['channels.name'] || item['payment_types.description'] || 'N/A';
    const rawValue = item['sales.count'] || item['payments.count'] || 0;
    const value = typeof rawValue === 'string' ? Number(rawValue.replace(/\D/g, '')) : Number(rawValue);
    return { name, value: Number.isFinite(value) ? value : 0 };
  }).filter(d => d.name && d.name !== 'N/A') 
    .map(d => ({ ...d, value: d.value || 0 }));
}
function LoadingComponent({ message = "A carregar..." }: { message?: string }) {
  return ( <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /><span>{message}</span></div> );
}
function ErrorComponent({ componentName, error }: { componentName: string, error: Error }) {
  return ( <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-destructive-foreground bg-destructive/80 p-4 rounded-lg"><AlertTriangle className="mb-2 h-6 w-6" /><span className="font-bold">Erro em {componentName}</span><span className="text-sm text-center">{error.toString()}</span></div> );
}
interface DashboardComponentProps { filters: any; timeDimensions: any; }
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F"];
// --- (Fim das Funções helper) ---


// ... (SalesLineChart - Inalterado) ...
function SalesLineChart({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.count'],
    timeDimensions: [ { ...timeDimensions[0], granularity: 'day' } ],
    filters: filters,
    order: { 'sales.created_at.day': 'asc' }
  });
  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="SalesLineChart" error={error} /></CardContent></Card>;
  const data = resultSet?.rawData() || [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Dia (Quantidade)</CardTitle>
        <CardDescription>Evolução da contagem de vendas no período selecionado.</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        {isLoading ? ( <LoadingComponent message="A carregar gráfico de linha..." /> ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sales.created_at.day" tickFormatter={dateFormatter} />
              <YAxis tickFormatter={(val) => numberFormatter.format(val)} />
              <Tooltip formatter={(val: number) => numberFormatter.format(val)} labelFormatter={(label) => dateFormatter(label)} />
              <Line type="monotone" dataKey="sales.count" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ... (ChannelDonutChart - Inalterado) ...
function ChannelDonutChart({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.count'],
    dimensions: ['channels.name'],
    filters, timeDimensions,
  });
  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="ChannelDonutChart" error={error} /></CardContent></Card>;
  const raw = resultSet?.rawData() || [];
  const data = normalizeCubeRawData(raw).filter(d => d.value > 0);
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Vendas por Canal</CardTitle>
        <CardDescription>Distribuição da quantidade de vendas por canal.</CardDescription>
      </CardHeader>
      <CardContent className="h-96">
        {isLoading ? ( <LoadingComponent message="A carregar gráfico de canais..." /> ) : data.length === 0 ? ( <div className="flex items-center justify-center h-full text-muted-foreground"> Nenhum dado disponível para o período. </div> ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} label={(entry: any) => `${String(entry.name)}: ${numberFormatter.format(Number(entry.value) || 0)}`} >
                {data.map((_, i) => ( <Cell key={i} fill={COLORS[i % COLORS.length]} /> ))}
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

// ... (KpiCards - Inalterado) ...
function KpiCards({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.invoicing',
      'sales.avg_ticket',
      'sales.total_discount',
      'sales.discount_percentage'
    ],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <Card className="h-full"><CardContent className="p-0"><ErrorComponent componentName="KpiCards" error={error} /></CardContent></Card>;
  const data = resultSet?.tablePivot()[0];
  const discountPercentValue = Number(data?.['sales.discount_percentage'] || 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Resultados do Período</CardTitle>
        <CardDescription>Principais métricas financeiras.</CardDescription>
      </CardHeader>
      <CardContent className="h-full flex flex-col justify-around space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1"><DollarSign className="h-5 w-5 text-green-500 mr-2" /><h3 className="text-sm font-medium text-muted-foreground">Faturamento no Período</h3></div>
          <p className="text-3xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : (data ? currencyFormatter.format(Number(data['sales.invoicing']) || 0) : 'N/A')}</p>
        </div>
        <div className="border-t"></div> 
        <div className="text-center">
          <div className="flex items-center justify-center mb-1"><ShoppingBag className="h-5 w-5 text-blue-500 mr-2" /><h3 className="text-sm font-medium text-muted-foreground">Ticket Médio no Período</h3></div>
          <p className="text-3xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : (data ? currencyFormatter.format(Number(data['sales.avg_ticket']) || 0) : 'N/A')}</p>
        </div>
        <div className="border-t"></div> 
        <div className="text-center">
          <div className="flex items-center justify-center mb-1"><TrendingDown className="h-5 w-5 text-red-500 mr-2" /><h3 className="text-sm font-medium text-muted-foreground">Total Descontado</h3></div>
          <p className="text-3xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : (data ? currencyFormatter.format(Number(data['sales.total_discount']) || 0) : 'N/A')}</p>
        </div>
        <div className="border-t"></div> 
        <div className="text-center">
          <div className="flex items-center justify-center mb-1"><TrendingDown className="h-5 w-5 text-red-500 mr-2" /><h3 className="text-sm font-medium text-muted-foreground">% Desconto</h3></div>
          <p className="text-3xl font-bold">{isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /> : (data ? formatPercent(discountPercentValue) : 'N/A')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ... (TopProducts - Inalterado) ...
function TopProducts({ filters, timeDimensions }: DashboardComponentProps) {
  const [isExporting, setIsExporting] = useState(false);
  const query: Query = { measures: ['sales.count'], dimensions: ['products.name'], order: { 'sales.count': 'desc' }, limit: 5, filters: filters, timeDimensions: timeDimensions };
  const { resultSet, isLoading, error } = useCubeQuery(query);
  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="TopProducts" error={error} /></CardContent></Card>;
  const products = resultSet?.tablePivot() || [];
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Top 5 Produtos (por Quantidade)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? ( <LoadingComponent message="A carregar Top Produtos..." /> ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Quantidade</TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(row['products.name'])}</TableCell>
                  <TableCell>{numberFormatter.format(Number(row['sales.count']) || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ... (TopStores - Inalterado) ...
function TopStores({ filters, timeDimensions }: DashboardComponentProps) {
  const [isExporting, setIsExporting] = useState(false);
  const query: Query = { measures: ['sales.count'], dimensions: ['stores.name'], order: { 'sales.count': 'desc' }, limit: 5, filters: filters, timeDimensions: timeDimensions, };
  const { resultSet, isLoading, error } = useCubeQuery(query);
  const stores = resultSet?.tablePivot() || [];
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Top 5 Lojas (por Quantidade)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? ( <LoadingComponent message="A carregar Top Lojas..." /> ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Loja</TableHead><TableHead>Quantidade</TableHead></TableRow></TableHeader>
            <TableBody>
              {stores.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(row['stores.name'])}</TableCell>
                  <TableCell>{numberFormatter.format(Number(row['sales.count']) || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ... (DiscountReasonChart - Inalterado) ...
function DiscountReasonChart({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.total_discount'],
    dimensions: ['sales.discount_reason'],
    filters: [ ...filters, { member: 'sales.discount_reason', operator: 'set' } ],
    timeDimensions: timeDimensions,
    order: { 'sales.total_discount': 'desc' }
  });
  if (error) return <ErrorComponent componentName="DiscountReasonChart" error={error} />;
  const data = resultSet?.rawData() || [];
  return (
    <Card>
      <CardHeader><CardTitle>Top Motivos de Desconto</CardTitle></CardHeader>
      <CardContent className="h-80">
        {isLoading ? <LoadingComponent /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(val) => currencyFormatter.format(val).replace('R$', '')} />
              <YAxis dataKey="sales.discount_reason" type="category" width={120} interval={0} />
              <Tooltip formatter={(val: number) => currencyFormatter.format(val)} />
              <Bar dataKey="sales.total_discount" name="Total Descontado" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ... (TopDiscountedProducts - Inalterado) ...
function TopDiscountedProducts({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.total_discount'],
    dimensions: ['products.name'],
    filters: [ ...filters, { member: 'sales.discount_reason', operator: 'set' } ],
    timeDimensions: timeDimensions,
    order: { 'sales.total_discount': 'desc' },
    limit: 5
  });
  if (error) return <ErrorComponent componentName="TopDiscountedProducts" error={error} />;
  const data = resultSet?.tablePivot() || [];
  return (
    <Card>
      <CardHeader><CardTitle>Top 5 Produtos Mais Descontados</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <LoadingComponent /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Total Descontado</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{String(row['products.name'])}</TableCell>
                  <TableCell>{currencyFormatter.format(Number(row['sales.total_discount']))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentMethodChart({ filters, timeDimensions }: DashboardComponentProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    // CORRIGIDO: Nomes em minúsculo
    measures: ['payments.count'],
    dimensions: ['payment_types.description'],
    filters: filters,
    timeDimensions: [{
      dimension: 'sales.created_at', // CORRIGIDO: Nome em minúsculo
      dateRange: timeDimensions[0].dateRange
    }]
  });

  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="PaymentMethodChart" error={error} /></CardContent></Card>;

  const raw = resultSet?.rawData() || [];
  const data = normalizeCubeRawData(raw).filter(d => d.value > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Vendas por Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="h-96">
        {isLoading ? ( <LoadingComponent message="A carregar gráfico de pagamentos..." /> ) : data.length === 0 ? ( <div className="flex items-center justify-center h-full text-muted-foreground"> Nenhum dado disponível. </div> ) : (
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
                label={(entry: any) => `${String(entry.name)}: ${numberFormatter.format(Number(entry.value) || 0)}`}
              >
                {data.map((_, i) => ( <Cell key={i} fill={COLORS[i % COLORS.length]} /> ))}
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
// --- FIM DA CORREÇÃO ---


// ... (Filtros: StoreFilter, CityFilter, DateFilter - Títulos limpos) ...
function StoreFilter({ onStoreChange }: { onStoreChange: (store: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;
  const stores = resultSet?.tablePivot() || [];
  return (
    <div className="flex-1 min-w-[200px]">
      <Label className="font-medium text-sm">Loja:</Label>
      {isLoading ? ( <LoadingComponent message="Lojas..." /> ) : (
        <Select onValueChange={(value) => onStoreChange(value === 'all' ? null : value)}>
          <SelectTrigger><SelectValue placeholder="-- Todas as Lojas --" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Todas as Lojas --</SelectItem>
            {stores.map((store, index) => ( <SelectItem key={index} value={String(store['stores.name'])}>{String(store['stores.name'])}</SelectItem> ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
function CityFilter({ onCityChange }: { onCityChange: (city: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.city'] });
  if (error) return <div>Erro (CityFilter): {error.toString()}</div>;
  const cities = (resultSet?.tablePivot() || []).map(row => row['stores.city']).filter(city => city).sort();
  const uniqueCities = [...new Set(cities)];
  return (
    <div className="flex-1 min-w-[180px]">
      <Label className="font-medium text-sm">Cidade:</Label>
      {isLoading ? ( <LoadingComponent message="Cidades..." /> ) : (
        <Select onValueChange={(value) => onCityChange(value === 'all' ? null : value)}>
          <SelectTrigger><SelectValue placeholder="-- Todas as Cidades --" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Todas as Cidades --</SelectItem>
            {uniqueCities.map((city, index) => ( <SelectItem key={index} value={String(city)}>{String(city)}</SelectItem> ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
function DateFilter({ dateRange, onDateChange }: { dateRange: DateRange, onDateChange: (range: DateRange) => void }) {
  const setPreset = (preset: DateFilterPreset) => { onDateChange(getDateRangeFromPreset(preset)); };
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

// ... (Componente Home - Inalterado) ...
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
      <main className="font-sans p-4 md:p-8 space-y-6 bg-gray-100 dark:bg-zinc-900 min-h-screen">
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard de Vendas</h1>
        
        <Card>
          <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <StoreFilter onStoreChange={setSelectedStore} />
              <CityFilter onCityChange={setSelectedCity} />
            </div>
            <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <SalesLineChart filters={completedFilters} timeDimensions={timeDimensions} />
          </div>
          
          <div className="lg:col-span-1">
            <KpiCards filters={completedFilters} timeDimensions={timeDimensions} />
          </div>

          <div className="lg:col-span-1">
            <ChannelDonutChart filters={completedFilters} timeDimensions={timeDimensions} />
          </div>

          <div className="lg:col-span-1">
            <PaymentMethodChart filters={completedFilters} timeDimensions={timeDimensions} />
          </div>
          
          <div className="lg:col-span-1 grid grid-cols-1 gap-6">
            <TopProducts filters={completedFilters} timeDimensions={timeDimensions} />
            <TopStores filters={completedFilters} timeDimensions={timeDimensions} />
          </div>
          
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-2">Análise de Descontos</h2>
          </div>

          <div className="lg:col-span-1">
            <DiscountReasonChart filters={completedFilters} timeDimensions={timeDimensions} />
          </div>
          
          <div className="lg:col-span-2">
            <TopDiscountedProducts filters={completedFilters} timeDimensions={timeDimensions} />
          </div>

        </div>

      </main>
    </CubeProvider>
  );
}

