'use client'; 
    
import cubeApi from '../../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useMemo, useState } from 'react'; 
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Ícones para os cards
import { TrendingUp, TrendingDown, Percent, ArrowRightLeft, PieChart as PieIcon, BarChart3, XCircle, ArrowUpRight } from 'lucide-react';

// --- Formatters (Inalterados) ---
type DateRange = [string, string];
type DateFilterPreset = 'weekly' | 'monthly' | 'yearly';

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

// --- Funções de Data (Inalteradas) ---
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

function getDateRangeFromPreset(preset: DateFilterPreset): DateRange {
  const end = new Date();
  const start = new Date();
  
  if (preset === 'weekly') {
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

// --- Componentes de UI Reutilizáveis ---
function LoadingComponent({ message = "A carregar..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
      <TrendingUp className="mr-2 h-5 w-5 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

function ErrorComponent({ componentName, error }: { componentName: string, error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-destructive-foreground bg-destructive/80 p-4 rounded-lg">
      <XCircle className="mb-2 h-6 w-6" />
      <span className="font-bold">Erro em {componentName}</span>
      <span className="text-sm text-center">{error ? error.toString() : 'Erro desconhecido'}</span>
    </div>
  );
}

// --- COMPONENTES DO DASHBOARD (RENOVADOS) ---

// NOVO: Gráfico de Pizza para Próprias vs Franqueadas
const PIE_COLORS = ['#3b82f6', '#10b981']; // Azul (Própria), Verde (Franqueada)

function OwnVsFranchiseChart({ filters, timeDimensions }: { filters: any[]; timeDimensions: any[] }) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['stores.is_own'],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <Card className="h-full"><CardContent className="p-0"><ErrorComponent componentName="OwnVsFranchise" error={error} /></CardContent></Card>;
  
  const data = resultSet?.rawData().map(row => ({
    name: row['stores.is_own'] ? 'Loja Própria' : 'Franqueada',
    value: parseFloat(String(row['sales.invoicing']))
  })) || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieIcon className="mr-2 h-5 w-5" />
          Faturamento: Próprias vs. Franqueadas
        </CardTitle>
        <CardDescription>Proporção do faturamento total no período.</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? (
          <LoadingComponent message="A carregar gráfico..." />
        ) : (
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
                paddingAngle={5}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => currencyFormatter.format(val)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
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

  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="Top5Invoicing" error={error} /></CardContent></Card>;
  const data = resultSet?.tablePivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-green-600">
           <TrendingUp className="mr-2 h-5 w-5" />
          Top 5 Lojas (Faturamento)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingComponent message="A carregar Top 5 Faturamento..." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Loja</TableHead><TableHead>Faturamento</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{String(row['stores.name'])}</TableCell>
                  <TableCell>{currencyFormatter.format(Number(row['sales.invoicing']))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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

  if (error) return <Card><CardContent className="p-0"><ErrorComponent componentName="Top5Cancellation" error={error} /></CardContent></Card>;
  const data = resultSet?.tablePivot() || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <TrendingDown className="mr-2 h-5 w-5" />
          Top 5 Lojas (Taxa de Cancelamento)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingComponent message="A carregar Top 5 Cancelamento..." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Loja</TableHead><TableHead>Taxa de Cancel.</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{String(row['stores.name'])}</TableCell>
                  <TableCell>{formatPercent(row['sales.cancellation_rate'])}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function Top5StoresByGrowth({ filters, dateRange, timeDimensions }: { filters: any[]; dateRange: DateRange; timeDimensions: any[] }) {
  // Lógica de cálculo de crescimento inalterada
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
        growth = 100.0; // Consideramos 100% se saiu do 0
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

  if (errorCurrent) return <Card><CardContent className="p-0"><ErrorComponent componentName="GrowthCurrent" error={errorCurrent} /></CardContent></Card>;
  if (errorPrevious) return <Card><CardContent className="p-0"><ErrorComponent componentName="GrowthPrevious" error={errorPrevious} /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-blue-600">
          <ArrowUpRight className="mr-2 h-5 w-5" />
          Top 5 Lojas (Crescimento %)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingComponent message="A carregar Top 5 Crescimento..." />
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


// --- Filtros (Inalterados na lógica, apenas no layout) ---

function CityFilter({ selectedCity, onCityChange }: { selectedCity: string | null, onCityChange: (city: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.city'] });

  const cities = (resultSet?.tablePivot() || [])
    .map(row => row['stores.city'])
    .filter(city => city) 
    .sort();
  const uniqueCities = [...new Set(cities)];

  return (
    <div className="flex gap-2">
      <Label className="font-medium text-sm">Cidade:</Label>
      {isLoading ? ( <div>A carregar cidades...</div> ) : error ? ( <div>Erro...</div> ) : (
        <Select 
          value={selectedCity || "all"}
          onValueChange={(value) => onCityChange(value === 'all' ? null : value)}
        >
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

function SubBrandFilter({ selectedSubBrand, onSubBrandChange }: { selectedSubBrand: string | null, onSubBrandChange: (subBrandId: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.sub_brand_id'] });

  const subBrands = (resultSet?.tablePivot() || [])
    .map(row => row['stores.sub_brand_id'])
    .filter(id => id) 
    .sort();
  const uniqueSubBrands = [...new Set(subBrands)];

  return (
    <div className="flex gap-2">
      <Label className="font-medium text-sm">Sub-Marca:</Label>
      {isLoading ? ( <div>A carregar sub-marcas...</div> ) : error ? ( <div>Erro...</div> ) : (
        <Select 
          value={selectedSubBrand || "all"}
          onValueChange={(value) => onSubBrandChange(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="-- Todas as Sub-Marcas --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Todas as Sub-Marcas --</SelectItem>
            {uniqueSubBrands.map((id, index) => (
              <SelectItem key={index} value={String(id)}>
                {String(id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function DateFilterControl({ dateRange, onDateChange }: { dateRange: DateRange, onDateChange: (range: DateRange) => void }) {
  const setPreset = (preset: DateFilterPreset) => {
    onDateChange(getDateRangeFromPreset(preset));
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <Label className="font-medium text-sm">Período Rápido:</Label>
        <Button variant="outline" size="sm" onClick={() => setPreset('weekly')}>Semanal</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('monthly')}>Mensal</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset('yearly')}>Anual</Button>
      </div>
      <div className="flex items-center space-x-2">
        <Label className="font-medium text-sm">Personalizado:</Label>
        <Input type="date" value={dateRange[0]} onChange={(e) => onDateChange([e.target.value, dateRange[1]])} className="w-auto"/>
        <span className="mx-2 text-muted-foreground">Até:</span>
        <Input type="date" value={dateRange[1]} onChange={(e) => onDateChange([dateRange[0], e.target.value])} className="w-auto"/>
      </div>
    </div>
  );
}


// --- SEÇÃO DE COMPARAÇÃO (TOTALMENTE RENOVADA) ---

function StoreSelector({ onStoreChange, excludeStore, selectedStore }: { onStoreChange: (store: string | null) => void, excludeStore?: string | null, selectedStore: string | null }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });
  if (error) return <div>Erro (StoreSelector): {error.toString()}</div>;

  const stores = (resultSet?.tablePivot() || [])
    .filter(store => String(store['stores.name']) !== excludeStore);

  return (
    <div className="flex-1 min-w-[200px]">
      {isLoading ? (
        <LoadingComponent message="A carregar lojas..."/>
      ) : (
        <Select 
          value={selectedStore || ""}
          onValueChange={(value) => onStoreChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="text-lg font-semibold">
            <SelectValue placeholder="-- Selecione uma Loja --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Selecione uma Loja --</SelectItem>
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

// NOVO: Componente de linha de comparação visual
function MetricComparisonRow(
  { name, valueA, valueB, format, better }: 
  { name: string, valueA: any, valueB: any, format: (val: any) => string, better: 'high' | 'low' }
) {
  const numA = Number(valueA) || 0;
  const numB = Number(valueB) || 0;
  const total = numA + numB;
  
  // Calcula porcentagens para o gráfico de barras
  const percentA = total > 0 ? (numA / total) * 100 : 0;
  const percentB = total > 0 ? (numB / total) * 100 : 0;
  
  // Determina o vencedor
  let isAWinning = false;
  let isBWinning = false;
  
  if (better === 'high') {
    isAWinning = numA > numB;
    isBWinning = numB > numA;
  } else { // better === 'low'
    isAWinning = numA < numB;
    isBWinning = numB < numA;
    if(numA === 0 && numB > 0) isAWinning = true; // 0 é sempre melhor para métricas 'low'
    if(numB === 0 && numA > 0) isBWinning = true;
  }
  if(numA === numB) { // Empate
    isAWinning = false;
    isBWinning = false;
  }

  const classA = isAWinning ? "text-green-600 font-bold" : (isBWinning ? "text-muted-foreground" : "");
  const classB = isBWinning ? "text-green-600 font-bold" : (isAWinning ? "text-muted-foreground" : "");

  return (
    <div className="grid grid-cols-3 items-center gap-4 py-4 border-b">
      {/* Valor Loja A */}
      <div className={`text-right text-2xl ${classA}`}>
        {format(valueA)}
      </div>
      
      {/* Métrica e Gráfico */}
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground">{name}</div>
        <div className="flex w-full h-3 mt-2 rounded-full overflow-hidden bg-gray-200">
          <div 
            style={{ width: `${percentA}%` }} 
            className={`h-full transition-all duration-300 ${isAWinning ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <div 
            style={{ width: `${percentB}%` }} 
            className={`h-full transition-all duration-300 ${isBWinning ? 'bg-green-500' : 'bg-gray-400'}`}
          />
        </div>
      </div>
      
      {/* Valor Loja B */}
      <div className={`text-left text-2xl ${classB}`}>
        {format(valueB)}
      </div>
    </div>
  );
}

// NOVO: Componente de Comparação principal
function StoreComparison({ storeA, storeB, filters, timeDimensions }: { storeA: string | null, storeB: string | null, filters: any[], timeDimensions: any[] }) {
  
  const comparisonFilters = useMemo(() => ([
    ...filters,
    {
      member: 'stores.name',
      operator: 'equals' as const,
      values: [storeA, storeB].filter(Boolean) as string[]
    }
  ]), [filters, storeA, storeB]);

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.invoicing',
      'sales.avg_ticket',
      'sales.cancellation_rate',
      'sales.avg_delivery_time'
    ],
    dimensions: ['stores.name'],
    filters: comparisonFilters,
    timeDimensions: timeDimensions,
  });

  const data = useMemo(() => {
    if (!resultSet) return { metrics: [], storeAData: {}, storeBData: {} };
    
    const pivot = resultSet.tablePivot();
    const storeAData = pivot.find(row => row['stores.name'] === storeA) || {};
    const storeBData = pivot.find(row => row['stores.name'] === storeB) || {};
    
    // Adicionamos a propriedade 'better' para saber se o valor maior ou menor é melhor
    const metrics = [
      { key: 'sales.invoicing', name: 'Faturamento', format: (val: any) => currencyFormatter.format(Number(val) || 0), better: 'high' as const },
      { key: 'sales.avg_ticket', name: 'Ticket Médio', format: (val: any) => currencyFormatter.format(Number(val) || 0), better: 'high' as const },
      { key: 'sales.cancellation_rate', name: 'Taxa de Cancelamento', format: formatPercent, better: 'low' as const },
      { key: 'sales.avg_delivery_time', name: 'Tempo de Entrega (min)', format: (val: any) => (Number(val) || 0).toFixed(1), better: 'low' as const },
    ];
    
    return { metrics, storeAData, storeBData };
  }, [resultSet, storeA, storeB]);

  const { metrics, storeAData, storeBData } = data;

  if (!storeA || !storeB) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Selecione duas lojas acima para iniciar a comparação.
      </div>
    )
  }
  
  if (error) return <ErrorComponent componentName="StoreComparison" error={error} />;
  if (isLoading) return <LoadingComponent message="A carregar comparação..." />;

  return (
    <div className="p-4">
      {metrics.map((metric) => (
        <MetricComparisonRow
          key={metric.key}
          name={metric.name}
          valueA={(storeAData as any)[metric.key]}
          valueB={(storeBData as any)[metric.key]}
          format={metric.format}
          better={metric.better}
        />
      ))}
    </div>
  );
}


// --- PÁGINA PRINCIPAL (Layout Renovado) ---

export default function PaginaLojas() {
  
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSubBrand, setSelectedSubBrand] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('monthly'));
  
  const [storeA, setStoreA] = useState<string | null>(null);
  const [storeB, setStoreB] = useState<string | null>(null);
  
  const timeDimensions: any[] = [
    {
      dimension: 'sales.created_at',
      dateRange: dateRange, 
    },
  ];

  const baseFilters: any[] = [
    ...(selectedCity ? [{ 
      member: 'stores.city',
      operator: 'equals' as const,
      values: [selectedCity]
    }] : []),
    ...(selectedSubBrand ? [{ 
      member: 'stores.sub_brand_id',
      operator: 'equals' as const,
      values: [selectedSubBrand]
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
      <main className="font-sans p-4 md:p-8 bg-gray-50 min-h-screen">        
        {/* --- 1. FILTROS --- */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          {/* Alteração: 'space-y-4' removido, 'flex flex-wrap' adicionado */}
          <CardContent className="flex flex-wrap items-center gap-5">
            <DateFilterControl dateRange={dateRange} onDateChange={setDateRange} />
            <CityFilter selectedCity={selectedCity} onCityChange={setSelectedCity} />
            <SubBrandFilter selectedSubBrand={selectedSubBrand} onSubBrandChange={setSelectedSubBrand} />
          </CardContent>
        </Card>

        {/* --- 2. VISÃO GERAL --- */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Visão Geral do Período</CardTitle>
            <CardDescription>Performance agregada de todas as lojas que passam pelos filtros acima.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico Principal */}
            <div className="lg:col-span-1">
              <OwnVsFranchiseChart filters={completedFilters} timeDimensions={timeDimensions} />
            </div>
            {/* Top 5 Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Top5StoresByInvoicing filters={completedFilters} timeDimensions={timeDimensions} />
              <Top5StoresByGrowth filters={completedFilters} dateRange={dateRange} timeDimensions={timeDimensions} />
              <Top5StoresByCancellation filters={allFilters} timeDimensions={timeDimensions} />
              
              {/* Botão para Tabela Completa */}
              <Card className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                <Button asChild variant="ghost" className="h-full w-full text-lg">
                  <Link href="/lojas/tabela-completa">
                    Ampliar (Ver Tabela Completa) &rarr;
                  </Link>
                </Button>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* --- 3. COMPARAÇÃO DIRETA --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRightLeft className="mr-2 h-5 w-5" />
              Comparar Duas Lojas Diretamente
            </CardTitle>
            <CardDescription>Selecione duas lojas para uma análise 1-v-1 detalhada.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-center p-6 border-b">
            <div className="flex-1 w-full">
              <Label className="text-md font-semibold">Loja A</Label>
              <StoreSelector onStoreChange={setStoreA} excludeStore={storeB} selectedStore={storeA} />
            </div>
            <span className="font-bold text-2xl text-muted-foreground mx-4">vs.</span>
            <div className="flex-1 w-full">
              <Label className="text-md font-semibold">Loja B</Label>
              <StoreSelector onStoreChange={setStoreB} excludeStore={storeA} selectedStore={storeB} />
            </div>
          </CardContent>
          <StoreComparison 
            storeA={storeA} 
            storeB={storeB} 
            filters={completedFilters} 
            timeDimensions={timeDimensions}
          />
        </Card>

      </main>
    </CubeProvider>
  );
}
