'use client'; 
    
import cubeApi from '../../../lib/cube';
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useMemo, useState } from 'react'; 
import { useFilters } from '@/lib/filters-context';
import Link from 'next/link';
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";

type SortConfig = {
  member: string;
  order: 'asc' | 'desc';
};

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

function StoreRankingTable({ filters, dateRange, timeDimensions }: { filters: any[]; dateRange: [string, string]; timeDimensions: any[] }) {

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    member: 'sales.invoicing',
    order: 'desc'
  });

  const previousDateRange = getPreviousPeriod(dateRange);

  const serverSortOrder = useMemo(() => {
    if (sortConfig.member === 'growth') return undefined;
    return {
      [sortConfig.member]: sortConfig.order
    };
  }, [sortConfig]);

  const { resultSet: currentData, isLoading: isLoadingCurrent, error: errorCurrent } = useCubeQuery({
    measures: [
      'sales.invoicing',
      'sales.avg_ticket',
      'sales.cancellation_rate',
      'sales.avg_delivery_time'
    ],
    dimensions: ['stores.name'],
    filters: filters,
    timeDimensions: timeDimensions,
    order: serverSortOrder
  });
  
  const { resultSet: previousData, isLoading: isLoadingPrevious, error: errorPrevious } = useCubeQuery({
    measures: [
      'sales.invoicing',
    ],
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

    const previousMap = new Map(
      previousPivot.map(row => [row['stores.name'], row['sales.invoicing']])
    );

    const dataWithGrowth = currentPivot.map(currentRow => {
      const storeName = String((currentRow as any)['stores.name']);
      const currentInvoicing = parseFloat(String((currentRow as any)['sales.invoicing']));
      const previousInvoicing = parseFloat(String(previousMap.get(storeName))) || 0;
      
      let growth = 0;
      if (previousInvoicing > 0) {
        growth = ((currentInvoicing - previousInvoicing) / previousInvoicing) * 100;
      } else if (currentInvoicing > 0) {
        growth = 100.0;
      }
      
      return {
        ...(currentRow as any),
        growth: growth,
      };
    });

    if (sortConfig.member === 'growth') {
      dataWithGrowth.sort((a, b) => {
        const valA = a.growth;
        const valB = b.growth;
        return sortConfig.order === 'asc' ? valA - valB : valB - valA;
      });
    }
    
    return dataWithGrowth;

  }, [currentData, previousData, sortConfig]);

  const isLoading = isLoadingCurrent || isLoadingPrevious;

  if (errorCurrent) return <div>Erro (CurrentData): {errorCurrent.toString()}</div>;
  if (errorPrevious) return <div>Erro (PreviousData): {errorPrevious.toString()}</div>;

  const handleSort = (member: string) => {
    setSortConfig(currentConfig => {
      const isDesc = currentConfig.member === member && currentConfig.order === 'desc';
      return {
        member: member,
        order: isDesc ? 'asc' : 'desc'
      };
    });
  };

  const getSortIndicator = (member: string) => {
    if (sortConfig.member !== member) return null;
    return sortConfig.order === 'desc' ? ' 🔽' : ' 🔼';
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Ranking de Lojas (US04 / US13)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>A carregar ranking...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('stores.name')} className="cursor-pointer">
                  Loja {getSortIndicator('stores.name')}
                </TableHead>
                <TableHead onClick={() => handleSort('sales.invoicing')} className="cursor-pointer">
                  Faturamento {getSortIndicator('sales.invoicing')}
                </TableHead>
                <TableHead onClick={() => handleSort('growth')} className="cursor-pointer">
                  Crescimento % {getSortIndicator('growth')}
                </TableHead>
                <TableHead onClick={() => handleSort('sales.avg_ticket')} className="cursor-pointer">
                  Ticket Médio {getSortIndicator('sales.avg_ticket')}
                </TableHead>
                <TableHead onClick={() => handleSort('sales.cancellation_rate')} className="cursor-pointer">
                  Taxa de Cancelamento {getSortIndicator('sales.cancellation_rate')}
                </TableHead>
                <TableHead onClick={() => handleSort('sales.avg_delivery_time')} className="cursor-pointer">
                  Tempo de Entrega (min) {getSortIndicator('sales.avg_delivery_time')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(row['stores.name'])}</TableCell>
                  <TableCell>{String(row['sales.invoicing'])}</TableCell>
                  <TableCell>{row.growth.toFixed(1)}%</TableCell>
                  <TableCell>{String(row['sales.avg_ticket'])}</TableCell>
                  <TableCell>{String(row['sales.cancellation_rate'])}</TableCell>
                  <TableCell>{parseFloat(String(row['sales.avg_delivery_time'])).toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaginaTabelaCompletaLojas() {
  
  const { selectedStore, dateRange } = useFilters();

  const timeDimensions: any[] = [
    {
      dimension: 'sales.created_at',
      dateRange: dateRange, 
    },
  ];

  const completedFilters: any[] = [
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
  
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans">
        <div className="p-4">
          <Button asChild variant="outline">
            <Link href="/lojas">&larr; Voltar para o Resumo</Link>
          </Button>
        </div>
        
        <StoreRankingTable filters={completedFilters} dateRange={dateRange} timeDimensions={timeDimensions} />

      </main>
    </CubeProvider>
  );
}