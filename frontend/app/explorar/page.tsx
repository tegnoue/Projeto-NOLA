'use client'; 

import cubeApi from '../../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; 
import { Query } from '@cubejs-client/core'; // Importar Query
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
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
import { Button } from "@/components/ui/button"; // Importar
import { Loader2, AlertTriangle, Download, BarChart3, LineChart as LineIcon, List } from 'lucide-react'; // Importar

// --- Componentes Helper (Copie e cole) ---
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

type DateRange = [string, string];
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
// --- Fim dos Componentes Helper ---


// --- Construtor Principal ---
function QueryBuilder() {
  // 1. ESTADO DOS FILTROS (AGORA INTEGRADOS)
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(['2025-01-01', '2025-12-31']);
  
  // 2. ESTADO DOS SELETORES DE DADOS
  const [selectedMeasure, setSelectedMeasure] = useState<string>('sales.invoicing');
  const [selectedDimension, setSelectedDimension] = useState<string>('stores.name');
  
  // 3. ESTADO DA VISUALIZAÇÃO
  const [vizType, setVizType] = useState<'bar' | 'line' | 'table'>('bar');
  const [isExporting, setIsExporting] = useState(false);
  
  // CONSTRUÇÃO DA QUERY DINÂMICA
  const filters = [
    {
      member: 'sales.sale_status_desc',
      operator: 'equals' as const,
      values: ['COMPLETED']
    },
    // Adiciona filtros do estado
    ...(selectedStore ? [{
      member: 'stores.name',
      operator: 'equals' as const,
      values: [selectedStore]
    }] : []),
    ...(selectedChannel ? [{
      member: 'channels.name',
      operator: 'equals' as const,
      values: [selectedChannel]
    }] : [])
  ];

  const query: Query = {
    measures: [selectedMeasure],
    dimensions: [selectedDimension],
    filters: filters,
    timeDimensions: [
      {
        dimension: 'sales.created_at',
        dateRange: dateRange, 
      },
    ],
    order: {
      [selectedMeasure]: 'desc'
    },
    limit: 50
  };

  const { resultSet, isLoading, error } = useCubeQuery(query);

  // FUNÇÃO DE EXPORTAÇÃO (REUTILIZADA)
  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const exportQuery = { ...query, limit: undefined }; // Exporta sem limite
      // use the overload that accepts responseFormat as the 4th argument
      // cast to any so we can pass it into Blob (runtime will provide proper binary/string content)
      const fileContent: any = await cubeApi.load(exportQuery, undefined, undefined, format);
      const blob = new Blob([fileContent as unknown as BlobPart], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_nola.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="font-sans p-4 md:p-8 space-y-6 bg-gray-100 dark:bg-zinc-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Explorar Dados</h1>
      <CardDescription>
        Responda perguntas de negócio combinando métricas, dimensões e filtros.
        (Ex: "Faturamento" + "por Produto" + "no Canal iFood")
      </CardDescription>

      {/* --- CARD DE FILTROS --- */}
      <Card>
        <CardHeader>
          <CardTitle>1. Filtros Globais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
          <StoreFilter onStoreChange={setSelectedStore} />
          <ChannelFilter onChannelChange={setSelectedChannel} />
        </CardContent>
      </Card>

      {/* --- CARD DE CONSTRUÇÃO --- */}
      <Card>
        <CardHeader>
          <CardTitle>2. Construtor de Análise</CardTitle>
          <div className="flex flex-wrap gap-4 pt-4">
            {/* Métrica */}
            <div>
              <Label htmlFor="measure-select">Métrica (O quê?)</Label>
              <Select 
                value={selectedMeasure} 
                onValueChange={(val) => setSelectedMeasure(val)}
              >
                <SelectTrigger id="measure-select" className="w-[280px]">
                  <SelectValue placeholder="Selecione a Métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales.invoicing">Faturamento</SelectItem>
                  <SelectItem value="sales.count">Nº de Vendas</SelectItem>
                  <SelectItem value="sales.avg_ticket">Ticket Médio</SelectItem>
                  <SelectItem value="sales.avg_prep_time">Tempo de Preparo (Médio)</SelectItem>
                  <SelectItem value="sales.avg_delivery_time">Tempo de Entrega (Médio)</SelectItem>
                  <SelectItem value="item_product_sales.revenue">Receita de Itens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Dimensão */}
            <div>
              <Label htmlFor="dimension-select">Dimensão (Por onde?)</Label>
              <Select 
                value={selectedDimension} 
                onValueChange={(val) => setSelectedDimension(val)}
              >
                <SelectTrigger id="dimension-select" className="w-[280px]">
                  <SelectValue placeholder="Selecione a Dimensão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stores.name">Por Loja</SelectItem>
                  <SelectItem value="products.name">Por Produto</SelectItem>
                  <SelectItem value="items.name">Por Item</SelectItem>
                  <SelectItem value="sales.dayOfWeek">Por Dia da Semana</SelectItem>
                  <SelectItem value="sales.hourOfDay">Por Hora do Dia</SelectItem>
                  <SelectItem value="delivery_addresses.neighborhood">Por Bairro</SelectItem>
                  <SelectItem value="channels.name">Por Canal</SelectItem>
                  <SelectItem value="customers.age_range">Por Faixa Etária</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Gráfico */}
            <div>
              <Label htmlFor="viz-select">Visualização</Label>
              <Select 
                value={vizType} 
                onValueChange={(val) => setVizType(val as any)}
              >
                <SelectTrigger id="viz-select" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barra</SelectItem>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="table">Tabela</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        {/* --- CARD DE RESULTADO --- */}
        <CardContent className="min-h-[24rem] h-96">
          {isLoading && <LoadingComponent message="A carregar análise..." />}
          
          {error && <ErrorComponent componentName="Análise" error={error} />}
          
          {!isLoading && !error && resultSet && (
            <RenderViz 
              vizType={vizType}
              resultSet={resultSet}
              measure={selectedMeasure}
              dimension={selectedDimension}
            />
          )}
          
          {!isLoading && !error && !resultSet?.rawData().length && (
             <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado encontrado para a combinação selecionada.
             </div>
          )}
        </CardContent>

        {/* --- Botões de Exportação --- */}
        <CardContent className="flex justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting || isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('xlsx')}
            disabled={isExporting || isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para renderizar a visualização correta
function RenderViz({ vizType, resultSet, measure, dimension }: { vizType: string, resultSet: any, measure: string, dimension: string }) {
  
  const data = resultSet.rawData();
  
  if (vizType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dimension} angle={-30} textAnchor="end" height={80} interval={0} />
          <YAxis tickFormatter={(val) => numberFormatter.format(val)} />
          <Tooltip formatter={(val: number) => numberFormatter.format(val)} />
          <Legend />
          <Bar dataKey={measure} fill="#8884d8" name="Métrica" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  
  if (vizType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dimension} angle={-30} textAnchor="end" height={80} interval={0} />
          <YAxis tickFormatter={(val) => numberFormatter.format(val)} />
          <Tooltip formatter={(val: number) => numberFormatter.format(val)} />
          <Legend />
          <Line type="monotone" dataKey={measure} stroke="#8884d8" name="Métrica" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  
  if (vizType === 'table') {
    const columns = resultSet.tableColumns();
    const rows = resultSet.tablePivot();
    return (
      <div className="h-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: any) => (
                <TableHead key={col.key}>{col.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {columns.map((col: any) => (
                  <TableCell key={col.key}>
                    {String(row[col.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return null;
}

// --- Página Principal (Renderiza o Construtor) ---
export default function PaginaExplorar() {
  return (
    <CubeProvider cubeApi={cubeApi}>
      <QueryBuilder />
    </CubeProvider>
  );
}


// --- Componentes de Filtro (Reutilizados) ---

interface StoreFilterProps {
  onStoreChange: (store: string | null) => void;
}
function StoreFilter({ onStoreChange }: StoreFilterProps) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;

  const stores = resultSet?.tablePivot() || [];

  return (
    <div className="flex-1 min-w-[200px]">
      <Label className="font-medium text-sm">Loja:</Label>
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

// NOVO FILTRO DE CANAL
interface ChannelFilterProps {
  onChannelChange: (channel: string | null) => void;
}
function ChannelFilter({ onChannelChange }: ChannelFilterProps) {
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['channels.name'] });
  if (error) return <div>Erro (ChannelFilter): {error.toString()}</div>;

  const channels = resultSet?.tablePivot() || [];

  return (
    <div className="flex-1 min-w-[200px]">
      <Label className="font-medium text-sm">Canal:</Label>
      {isLoading ? (
        <LoadingComponent message="Canais..." />
      ) : (
        <Select onValueChange={(value) => onChannelChange(value === 'all' ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="-- Todos os Canais --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Todos os Canais --</SelectItem>
            {channels.map((channel, index) => (
              <SelectItem key={index} value={String(channel['channels.name'])}>
                {String(channel['channels.name'])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}


interface DateFilterProps {
  dateRange: [string, string];
  onDateChange: (newRange: [string, string]) => void;
}
function DateFilter({ dateRange, onDateChange }: DateFilterProps) {
  return (
    <div className="flex flex-wrap items-center space-x-2">
      <Label className="font-medium text-sm shrink-0">Período:</Label>
      <Input 
        type="date" 
        value={dateRange[0]} 
        onChange={(e) => onDateChange([e.target.value, dateRange[1]])}
        className="w-auto"
      />
      <span className="mx-2 text-muted-foreground">Até:</span>
      <Input 
        type="date" 
        value={dateRange[1]} 
        onChange={(e) => onDateChange([dateRange[0], e.target.value])} 
        className="w-auto"
      />
    </div>
  );
}