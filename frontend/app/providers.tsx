'use client';

import { CubeProvider } from '@cubejs-client/react';
import { FiltersProvider } from '@/lib/filters-context';
import cubeApi from '@/lib/cube';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <CubeProvider cubeApi={cubeApi}>
      <FiltersProvider>
        {children}
      </FiltersProvider>
    </CubeProvider>
  );
}