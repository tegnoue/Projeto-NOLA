'use client'; 
    
import cubeApi from '../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; 

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
    <div style={{ fontFamily: 'Arial', margin: '20px' }}>
      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px', border: '1px solid #eee', margin: '5px', minWidth: '200px', textAlign: 'center' }}>
            <h3>Vendas Totais</h3>
            <h1>{data ? data['sales.count'] : '...'}</h1>
          </div>
          <div style={{ padding: '10px', border: '1px solid #eee', margin: '5px', minWidth: '200px', textAlign: 'center' }}>
            <h3>Faturamento</h3>
            <h1>{data ? data['sales.invoicing'] : '...'}</h1>
          </div>
          <div style={{ padding: '10px', border: '1px solid #eee', margin: '5px', minWidth: '200px', textAlign: 'center' }}>
            <h3>Ticket Médio</h3>
            <h1>{data ? data['sales.avg_ticket'] : '...'}</h1>
          </div>
        </div>
      )}
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
    <div style={{ fontFamily: 'Arial', margin: '20px' }}>
      <h2>Top 10 Produtos por faturamento (no período)</h2>
      <ol>
        {products.map((product, index) => (
          <li key={index}>
            <strong>{product['products.name']}</strong>: {product['sales.invoicing']}
          </li>
        ))}
      </ol>
    </div>
  );
}

interface StoreFilterProps {
  onStoreChange: (store: string | null) => void;
}

function StoreFilter({ onStoreChange }: StoreFilterProps) {
  const { resultSet, isLoading, error } = useCubeQuery({
    dimensions: [
      'stores.name'
    ]
  });

  if (isLoading) return <div>A carregar lojas...</div>;
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;

  const stores = resultSet?.tablePivot() || [];

  return (
    <div style={{ fontFamily: 'Arial', margin: '20px', padding: '10px', background: '#f4f4f4' }}>
      <strong>Filtro Global (US04): </strong>
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
    <div style={{ padding: '20px', fontFamily: 'Arial', background: '#f4f4f4' }}>
      <strong>Filtro Global (US02): </strong>
      <label>De: </label>
      <input 
        type="date" 
        value={dateRange[0]}
        onChange={(e) => onDateChange([e.target.value, dateRange[1]])}
      />
      <label style={{ marginLeft: '10px' }}>Até: </label>
      <input 
        type="date" 
        value={dateRange[1]}
        onChange={(e) => onDateChange([dateRange[0], e.target.value])}
      />
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
      
      <StoreFilter onStoreChange={setSelectedStore} />
      <DateFilter dateRange={dateRange} onDateChange={setDateRange} />
      
      <DataDisplay selectedStore={selectedStore} dateRange={dateRange} />
      <hr/>
      <TopProductsPerInvoicing selectedStore={selectedStore} dateRange={dateRange} />
    </CubeProvider>
  );
}