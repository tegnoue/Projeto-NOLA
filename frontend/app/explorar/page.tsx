'use client'; 
    
import cubeApi from '../../lib/cube'; 
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function QueryBuilder() {
  const [selectedStore] = useState<string | null>(null);
  const [dateRange] = useState<[string, string]>(['2025-01-01', '2025-12-31']);

  // ESTADO DOS SELETORES DE MÉTRICA/DIMENSÃO
  const [selectedMeasure, setSelectedMeasure] = useState<string>('sales.invoicing');
  const [selectedDimension, setSelectedDimension] = useState<string>('stores.name');
  
  // CONSTRUÇÃO DA QUERY
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
    // As métricas e dimensões vêm do estado (hardcoded)
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
  });

  if (error) return <Card className="m-4"><CardHeader><CardTitle>Erro na Consulta</CardTitle></CardHeader><CardContent className="text-red-500">{error.toString()}</CardContent></Card>;
  
  const data = resultSet?.rawData() || [];

  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl font-bold">Explorar Dados</h1>

      <Card className="m-4">
        <CardHeader>
          <CardTitle>Construtor de Análise</CardTitle>
          <div className="flex gap-4 pt-4">
            <div>
              <Label htmlFor="measure-select">Métrica</Label>
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
                  <SelectItem value="sales.avg_delivery_time">Tempo de Entrega (Médio)</SelectItem>
                  <SelectItem value="item_product_sales.revenue">Receita de Itens</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dimension-select">Dimensão</Label>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="h-96">
          {isLoading && <div>A carregar gráfico...</div>}
          
          {data.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={selectedDimension} />
                <YAxis />
                <Tooltip />
                <Bar dataKey={selectedMeasure} fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {!isLoading && data.length === 0 && (
             <div className="text-center py-10 text-gray-500">Nenhum dado encontrado para a combinação selecionada.</div>
          )}
          
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaginaExplorar() {
  return (
    <CubeProvider cubeApi={cubeApi}>
      <QueryBuilder />
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
      <Label className="font-medium">Filtro de Loja (US04): </Label>
      <Select 
        onValueChange={(value) => onStoreChange(value || null)}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="-- Todas as Lojas --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">-- Todas as Lojas --</SelectItem>
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

interface DateFilterProps {
  dateRange: [string, string];
  onDateChange: (newRange: [string, string]) => void;
}
function DateFilter({ dateRange, onDateChange }: DateFilterProps) {
  return (
    <div>
      <Label className="font-medium">Filtro de Data (US02): </Label>
      <div className="flex items-center space-x-2">
        <Input 
          type="date" 
          value={dateRange[0]} 
          onChange={(e) => onDateChange([e.target.value, dateRange[1]])}
          className="w-auto"
        />
        <span className="mx-2">Até:</span>
        <Input 
          type="date" 
          value={dateRange[1]} 
          onChange={(e) => onDateChange([dateRange[0], e.target.value])} 
          className="w-auto"
        />
      </div>
    </div>
  );
}