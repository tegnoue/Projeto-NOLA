'use client'; 
    
import cubeApi from '../../lib/cube';
import { CubeProvider, useCubeQuery } from '@cubejs-client/react';
import React, { useState } from 'react'; 
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RelatorioClientes() {
  
  const [minFrequencia, setMinFrequencia] = useState('3');
  const [minRecencia, setMinRecencia] = useState('30');

  const { resultSet, isLoading, error } = useCubeQuery({
    dimensions: [
      'customers.customer_name',
      'customers.phone_number',
      'customers.email'
    ],
    measures: [
      'sales.frequency',
      'sales.days_since_last_purchase'
    ],
    filters: [
      {
        member: 'sales.frequency',
        operator: 'gte',
        values: [minFrequencia]
      },
      {
        member: 'sales.days_since_last_purchase',
        operator: 'gte',
        values: [minRecencia]
      }
    ],
    order: {
      'sales.days_since_last_purchase': 'desc'
    },
    limit: 100
  });

  if (error) return <div>Erro (RelatorioClientes): {error.toString()}</div>;
  
  const clientes = resultSet?.tablePivot() || [];

  return (
    <Card className="m-4">
      <CardHeader>
        
        <div className="flex space-x-4 pt-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="freq">Frequência {'>'}=</Label>
            <Input 
              id="freq"
              type="number" 
              value={minFrequencia}
              onChange={(e) => setMinFrequencia(e.target.value)}
              className="w-20"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="rec">Dias sem Comprar {'>'}=</Label>
            <Input 
              id="rec"
              type="number" 
              value={minRecencia}
              onChange={(e) => setMinRecencia(e.target.value)}
              className="w-20"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div>A carregar relatório...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome (customers.customer_name)</TableHead>
                <TableHead>Contacto (customers.phone_number)</TableHead>
                <TableHead>Nº Compras (sales.frequency)</TableHead>
                <TableHead>Dias sem Comprar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{String(cliente['customers.customer_name'])}</TableCell>
                  <TableCell>{String(cliente['customers.phone_number'])}</TableCell>
                  <TableCell>{String(cliente['sales.frequency'])}</TableCell>
                  <TableCell>{String(cliente['sales.days_since_last_purchase'])}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaginaClientes() {
  return (
    <CubeProvider cubeApi={cubeApi}>
      <main className="font-sans p-4">
        <h1 className="text-3xl font-bold">Relatório de Clientes (US11)</h1>
        <RelatorioClientes />
      </main>
    </CubeProvider>
  );
}