'use client';
import { useCubeQuery } from '@cubejs-client/react';
import { useFilters } from '@/lib/filters-context';

function StoreFilter() {
  const { selectedStore, setSelectedStore } = useFilters();
  const { resultSet, isLoading, error } = useCubeQuery({ dimensions: ['stores.name'] });

  if (isLoading) return <div>A carregar lojas...</div>;
  if (error) return <div>Erro (StoreFilter): {error.toString()}</div>;
  const stores = resultSet?.tablePivot() || [];

  return (
    <div className="mr-4">
      <label className="font-medium">Filtro de Loja (US04): </label>
      <select 
        value={selectedStore || ""}
        onChange={(e) => setSelectedStore(e.target.value || null)}
        className="border p-2 rounded"
      >
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

function DateFilter() {
  const { dateRange, setDateRange } = useFilters();

  return (
    <div>
      <label className="font-medium">Filtro de Data (US02): </label>
      <input 
        type="date" 
        value={dateRange[0]} 
        onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
        className="border p-2 rounded"
      />
      <label className="mx-2">Até:</label>
      <input 
        type="date" 
        value={dateRange[1]} 
        onChange={(e) => setDateRange([dateRange[0], e.target.value])} 
        className="border p-2 rounded"
      />
    </div>
  );
}

export function GlobalFilters() {
  return (
    <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center">
      <StoreFilter />
      <DateFilter />
    </div>
  );
}