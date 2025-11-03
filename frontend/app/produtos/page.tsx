'use client'; 
    
import cubeApi from '../../lib/cube';
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState, useMemo } from 'react'; 
import { useFilters } from '@/lib/filters-context';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, 
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"; 
import { 
  Loader2, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  ArrowUp, 
  ArrowDown, 
  ArrowDownUp,
  ChevronDown, 
  ChevronUp, 
} from 'lucide-react';

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


const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

// --- Componentes de UI (Inalterados) ---
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

interface ProductPageProps {
  filters: any; 
  timeDimensions: any;
}

function ProductRankingTable({ filters, timeDimensions }: ProductPageProps) {
  const [sortConfig, setSortConfig] = useState({ member: 'sales.invoicing', order: 'desc' as 'asc' | 'desc' });
  

  const [isExpanded, setIsExpanded] = useState(false);

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing', 'sales.count'],
    dimensions: ['products.grouped_name'],
    filters: filters,
    timeDimensions: timeDimensions,
    limit: isExpanded ? undefined : 5, 
    order: {
      [sortConfig.member]: sortConfig.order
    }
  });

  if (error) return <ErrorComponent componentName="ProductRankingTable" error={error} />;
  const products = resultSet?.tablePivot() || [];
  
  const handleSort = (member: string) => {
    setSortConfig(currentConfig => ({
      member: member,
      order: currentConfig.member === member && currentConfig.order === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  const getSortIndicator = (member: string) => {
    if (sortConfig.member !== member) {
      return <ArrowDownUp className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.order === 'desc' 
      ? <ArrowDown className="ml-2 h-4 w-4" /> 
      : <ArrowUp className="ml-2 h-4 w-4" />;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Ranking de Produtos</CardTitle>
        <CardDescription>
          {isExpanded 
            ? "Ranking de todos os produtos por faturamento ou quantidade."
            : "Ranking dos Top 5 produtos por faturamento ou quantidade."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingComponent message="A carregar ranking de produtos..." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead onClick={() => handleSort('sales.invoicing')} className="cursor-pointer">
                  <div className="flex items-center">
                    Faturamento {getSortIndicator('sales.invoicing')}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('sales.count')} className="cursor-pointer">
                   <div className="flex items-center">
                    Quantidade {getSortIndicator('sales.count')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(row['products.grouped_name'])}</TableCell>
                  <TableCell>{currencyFormatter.format(Number(row['sales.invoicing']))}</TableCell>
                  <TableCell>{numberFormatter.format(Number(row['sales.count']))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {/* Footer adicionado com o botão de expandir */}
      <CardFooter className="flex justify-center">
        <Button 
          variant="ghost" 
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isLoading}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Ver mais
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
function TopCustomizations({ filters, timeDimensions }: ProductPageProps) {
  const { resultSet: addedSet, isLoading: isLoadingAdded } = useCubeQuery({
    measures: ['item_product_sales.count_added'],
    dimensions: ['items.name'],
    order: { 'item_product_sales.count_added': 'desc' },
    limit: 5,
    filters: filters,
    timeDimensions: timeDimensions,
  });

  const { resultSet: removedSet, isLoading: isLoadingRemoved } = useCubeQuery({
    measures: ['item_product_sales.count_removed'],
    dimensions: ['items.name'],
    order: { 'item_product_sales.count_removed': 'desc' },
    limit: 5,
    filters: filters,
    timeDimensions: timeDimensions,
  });
  
  const addedItems = addedSet?.tablePivot() || [];
  const removedItems = removedSet?.tablePivot() || [];
  const isLoading = isLoadingAdded || isLoadingRemoved;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Customizações (D10)</CardTitle>
        <CardDescription>Itens mais adicionados e removidos no período.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <PlusCircle className="mr-2 h-5 w-5" />
              Top 5 Itens Mais Adicionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <LoadingComponent /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qtd.</TableHead></TableRow></TableHeader>
                <TableBody>
                  {addedItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{String(item['items.name'])}</TableCell>
                      <TableCell>{numberFormatter.format(Number(item['item_product_sales.count_added']))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <MinusCircle className="mr-2 h-5 w-5" />
              Top 5 Itens Mais Removidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <LoadingComponent /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qtd.</TableHead></TableRow></TableHeader>
                <TableBody>
                  {removedItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{String(item['items.name'])}</TableCell>
                      <TableCell>{numberFormatter.format(Number(item['item_product_sales.count_removed']))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

function SeasonalProductChart({ filters, timeDimensions }: ProductPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { resultSet: productList, isLoading: isLoadingList } = useCubeQuery({
    dimensions: ['products.grouped_name'],
    order: { 'products.grouped_name': 'asc' }
  });

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.invoicing'],
    dimensions: ['sales.month'],
    timeDimensions: timeDimensions,
    filters: [
      ...filters,
      ...(selectedProduct ? [{
        member: 'products.grouped_name',
        operator: 'equals' as const,
        values: [selectedProduct]
      }] : [])
    ],
    order: { 'sales.month': 'asc' }
  }); 

  if (error) return <ErrorComponent componentName="SeasonalProductChart" error={error} />;
  
  const products = productList?.tablePivot() || [];
  const data = resultSet?.rawData() || [];

  return (
    <Card className="lg:col-span-1 h-full">
      <CardHeader>
        <CardTitle>Análise Sazonal (Anomalia #4)</CardTitle>
        <CardDescription>Faturamento mensal total. Selecione um produto para filtrar.</CardDescription>
        <Select onValueChange={(val) => setSelectedProduct(val === 'all' ? null : val)} value={selectedProduct || 'all'}>
          <SelectTrigger className="w-full lg:w-[300px] mt-2">
            <SelectValue placeholder="Filtrar por produto..." />
          </SelectTrigger>
          <SelectContent>
            {isLoadingList ? <SelectItem value="loading" disabled>A carregar produtos...</SelectItem> : 
              <>
                <SelectItem value="all">-- Todos os Produtos --</SelectItem>
                {products.map((p, i) => (
                  <SelectItem key={i} value={String(p['products.grouped_name'])}>
                    {String(p['products.grouped_name'])}
                  </SelectItem>
                ))}
              </>
            }
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-80">
        {isLoading ? <LoadingComponent /> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sales.month" />
              <YAxis tickFormatter={(val) => currencyFormatter.format(val).replace('R$', '')} />
              <Tooltip formatter={(val: number) => currencyFormatter.format(val)} />
              <Line type="monotone" dataKey="sales.invoicing" name="Faturamento" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// --- COMPONENTES DE FILTRO ---

function CategoryFilter({ onCategoryChange }: { onCategoryChange: (category: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['categories.name'] });
  if (error) return <div>Erro (CategoryFilter): {error.toString()}</div>;
  const categories = (resultSet?.tablePivot() || []).map(row => row['categories.name']).filter(c => c).sort();
  const uniqueCategories = [...new Set(categories)];

  return (
    <div className="flex-1 min-w-[180px]">
      <Label className="font-medium text-sm">Categoria:</Label>
      {isLoading ? <LoadingComponent message="Categorias..." /> : (
        <Select onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Todas as Categorias --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Todas as Categorias --</SelectItem>
            {uniqueCategories.map((cat, index) => (
              <SelectItem key={index} value={String(cat)}>
                {String(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function ChannelFilter({ onChannelChange }: { onChannelChange: (channel: string | null) => void }) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['channels.name'] });
  if (error) return <div>Erro (ChannelFilter): {error.toString()}</div>;
  
  const channels = (resultSet?.tablePivot() || [])
    .map(row => row['channels.name'])
    .filter(c => c)
    .sort();
  const uniqueChannels = [...new Set(channels)];

  return (
    <div className="flex-1 min-w-[180px]">
      <Label className="font-medium text-sm">Canal:</Label>
      {isLoading ? <LoadingComponent message="Canais..." /> : (
        <Select onValueChange={(value) => onChannelChange(value === 'all' ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Todos os Canais --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Todos os Canais --</SelectItem>
            {uniqueChannels.map((cat, index) => (
              <SelectItem key={index} value={String(cat)}>
                {String(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function DateFilter({ dateRange, onDateChange }: { dateRange: DateRange, onDateChange: (range: DateRange) => void }) {
  const setPreset = (preset: DateFilterPreset) => {
    onDateChange(getDateRangeFromPreset(preset));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 pt-4 lg:pt-0">
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

export default function PaginaProdutos() {
  
  const { selectedStore } = useFilters(); 
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [deliveryOnly, setDeliveryOnly] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>(getDateRangeFromPreset('monthly')); 

  const timeDimensions: any[] = [
    {
      dimension: 'sales.created_at',
      dateRange: dateRange, 
    },
  ];
  const baseFilters: any[] = [
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
    ...(selectedCategory ? [{ 
      member: 'categories.name',
      operator: 'equals' as const,
      values: [selectedCategory]
    }] : []),
    ...(selectedChannel ? [{ 
      member: 'channels.name',
      operator: 'equals' as const,
      values: [selectedChannel]
    }] : []),
    ...(deliveryOnly ? [{ 
      member: 'channels.type',
      operator: 'equals' as const,
      values: ['D']
    }] : [])
  ];
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans p-4 md:p-8 space-y-6 bg-gray-100 dark:bg-zinc-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Análise de Produtos (US14)</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <CategoryFilter onCategoryChange={setSelectedCategory} />
              <ChannelFilter onChannelChange={setSelectedChannel} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="delivery-only" 
                checked={deliveryOnly}
                onCheckedChange={setDeliveryOnly}
              />
              <Label htmlFor="delivery-only">Mostrar apenas Delivery</Label>
            </div>
            
            <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProductRankingTable filters={baseFilters} timeDimensions={timeDimensions} />
          <SeasonalProductChart filters={baseFilters} timeDimensions={timeDimensions} />
        </div>
        
        <TopCustomizations filters={baseFilters} timeDimensions={timeDimensions} />

      </main>
    </CubeProvider>
  );
}