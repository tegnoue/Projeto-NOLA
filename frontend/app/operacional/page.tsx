'use client'; 
    
import cubeApi from '../../lib/cube';
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; 

interface KpiProps {
  filters: any;
  timeDimensions: any;
}

function KpisOperacionais({ filters, timeDimensions }: KpiProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.avg_prep_time', 
      'sales.avg_delivery_time' 
    ],
    filters: filters,
    timeDimensions: timeDimensions,
  });

  if (error) return <div>Erro (KPIs): {error.toString()}</div>;
  const data = resultSet?.tablePivot()[0];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div style={{ padding: '10px', border: '1px solid #eee', margin: '5px', minWidth: '200px', textAlign: 'center' }}>
        <h3>Tempo Médio de Preparo (min)</h3>
        <h1>{isLoading ? '...' : (data ? parseFloat(String(data['sales.avg_prep_time'])).toFixed(1) : 'N/A')}</h1>
      </div>
      <div style={{ padding: '10px', border: '1px solid #eee', margin: '5px', minWidth: '200px', textAlign: 'center' }}>
        <h3>Tempo Médio de Entrega (min)</h3>
        <h1>{isLoading ? '...' : (data ? parseFloat(String(data['sales.avg_delivery_time'])).toFixed(1) : 'N/A')}</h1>
      </div>
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
    <div style={{ marginTop: '20px' }}>
      <h2>Top 5 Piores Bairros (Tempo de Entrega)</h2>
      <ol>
        {data.map((row, index) => (
          <li key={index}>
            <strong>{row['delivery_addresses.neighborhood']}</strong>: 
            {parseFloat(String(row['sales.avg_delivery_time'])).toFixed(1)} min
          </li>
        ))}
      </ol>
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
  
  const data = resultSet?.tablePivot() || [];

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Tempo de Entrega por Hora do Dia </h2>
      <ul style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc' }}>
        {data.map((row, index) => (
          <li key={index}>
            <strong>{row['sales.created_at.hour']}</strong>: 
            {parseFloat(String(row['sales.avg_delivery_time'])).toFixed(1)} min
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PaginaOperacional() {
  
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[string, string]>([
    '2025-01-01', 
    '2025-12-31'
  ]);


  const filters = [
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

  const timeDimensions = [
    {
      dimension: 'sales.created_at',
      dateRange: dateRange, 
    },
  ];
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <div style={{ fontFamily: 'Arial', margin: '20px' }}>
        <h1>Dashboard Operacional (US07)</h1>
        
        <div style={{ display: 'flex', padding: '10px', background: '#f4f4f4' }}>
          <StoreFilter onStoreChange={setSelectedStore} />
          <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
        </div>
        
        <hr />
        <KpisOperacionais filters={filters} timeDimensions={timeDimensions} />
        <hr />
        <RankingBairros filters={filters} timeDimensions={timeDimensions} />
        <hr />
        <TempoPorHora filters={filters} timeDimensions={timeDimensions} />

      </div>
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
    <div style={{ marginRight: '20px' }}>
      <strong>Filtro de Loja: </strong>
      <select onChange={(e) => onStoreChange(e.target.value || null)}>
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
      <strong>Filtro de Data: </strong>
      <label>De: </label>
      <input type="date" value={dateRange[0]} onChange={(e) => onDateChange([e.target.value, dateRange[1]])} />
      <label style={{ marginLeft: '10px' }}>Até: </label>
      <input type="date" value={dateRange[1]} onChange={(e) => onDateChange([dateRange[0], e.target.value])} />
    </div>
  );
}