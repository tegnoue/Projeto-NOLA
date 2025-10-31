'use client';

import cubeApi from '../lib/cube'; 
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';

function SalesCount() {
  const { resultSet, isLoading, error } = useCubeQuery({
    measures: ['sales.people_quantity'],
  });

  if (isLoading) return <div>A carregar...</div>;
  if (error) return <div>Erro: {error.toString()}</div>;
  if (!resultSet) return null;

  const totalVendas = resultSet.tablePivot()[0]['sales.people_quantity'];

  return (
    <h1 style={{ fontSize: '4rem' }}>
      Total de Vendas: {totalVendas}
    </h1>
  );
}

export default function Home() {
  return (
    <CubeProvider cubeApi={cubeApi}>
      <SalesCount />
    </CubeProvider>
  );
}
