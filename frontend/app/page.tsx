'use client'; 
    
import cubeApi from '../lib/cube'; // O seu ficheiro de configuração da API
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; // Importando o 'useState'

/**
 * Componente principal para exibir os dados.
 * (Nomes de "KPI" removidos, focado na funcionalidade)
 */
function DataDisplay() {
  
  // Estado para o seletor de datas (Implementando a US02)
  const [dateRange, setDateRange] = useState<[string, string]>([ // (Use <[string, string]> para TSX)
    '2024-01-01', // Data de início de exemplo
    '2024-03-31'  // Data de fim de exemplo
  ]);

  const { resultSet, isLoading, error } = useCubeQuery({
    measures: [
      'sales.count',
      'sales.invoicing',   // <-- 1. NOME NOVO (US01)
      'sales.avg_ticket'    // <-- 2. NOME NOVO (US01)
    ],
    
    // 3. CORREÇÃO DA SINTAXE PARA A v1.5.0
    // O seu servidor v1.5.0 espera 'member' aqui (isto causou o erro 'filters[0]')
    filters: [
      {
        member: 'sales.status', // Usando 'member'
        operator: 'equals',
        values: ['COMPLETED'] // Baseado no generate_data.py
      }
    ],
    
    // 3. CORREÇÃO DA SINTAXE PARA A v1.5.0
    // A v1.5.0 também espera 'member' para as dimensões de tempo
    timeDimensions: [
      {
        dimension: 'sales.createdAt', // Usando 'member' em vez de 'dimension'
        dateRange: dateRange, 
      },
    ],
  });

  if (error) return <div>Erro: {error.toString()}</div>;

  const data = resultSet?.tablePivot()[0];

  return (
    <div style={{ fontFamily: 'Arial', margin: '20px' }}>
      
      {/* Inputs para testar o seletor de data (US02) */}
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

      {/* Dados (US01) - Renderizados diretamente */}
      {isLoading ? (
        <div>A carregar dados...</div>
      ) : (
        <div>
          <h2>Dados do Período Selecionado:</h2>
          {/* Usando os novos nomes de métricas */}
          <h3>Vendas Totais: {data ? data['sales.count'] : '...'}</h3>
          <h3>Faturamento (Invoicing): {data ? data['sales.invoicing'] : '...'}</h3>
          <h3>Ticket Médio (Avg. Ticket): {data ? data['sales.avg_ticket'] : '...'}</h3>
        </div>
      )}
    </div>
  );
}

/**
 * Página principal (export default)
 */
export default function Home() {
  return (
    <CubeProvider cubeApi={cubeApi}>
      <DataDisplay />
    </CubeProvider>
  );
}