'use client'; 
    
import cubeApi from '../lib/cube'; // O seu ficheiro de configuração da API
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; // Importando o 'useState'


function DataDisplay() {
  
  const [dateRange, setDateRange] = useState<[string, string]>([ 
    '2025-01-01', 
    '2025-12-31' 
  ]);

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.count',
      'sales.invoicing',  
      'sales.avg_ticket'  
    ],
    
    filters: [
      {
        member: 'sales.status', 
        operator: 'equals',
        values: ['COMPLETED'] 
      }
    ],
    
    timeDimensions: [
      {
        dimension: 'sales.createdAt', 
        dateRange: dateRange, 
      },
    ],
  });

  if (error) return <div>Erro: {error.toString()}</div>;

  const data = resultSet?.tablePivot()[0];

  return (
    <div style={{ fontFamily: 'Arial', margin: '20px' }}>
      
      <div>
        <label>De: </label>
        <input 
          type="date" 
          value={dateRange[0]}
          onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
        />
        <label style={{ marginLeft: '10px' }}>Até: </label>
        <input 
          type="date" 
          value={dateRange[1]}
          onChange={(e) => setDateRange([dateRange[0], e.target.value])}
        />
      </div>

      <hr style={{ margin: '20px 0' }} />

      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <div>
          <h2>Dados do Período Selecionado:</h2>

          <h3>Vendas Totais: {data ? data['sales.count'] : '...'}</h3>
          <h3>Faturamento (Invoicing): {data ? data['sales.invoicing'] : '...'}</h3>
          <h3>Ticket Médio (Avg. Ticket): {data ? data['sales.avg_ticket'] : '...'}</h3>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <CubeProvider cubeApi={cubeApi}>
      <DataDisplay />
    </CubeProvider>
  );
}