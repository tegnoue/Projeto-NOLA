const cubejs = require('@cubejs-client/core');
const fetch = require('node-fetch');

const cubeApi = cubejs(
  process.env.CUBEJS_API_SECRET || 'd1c911fdb7984f933f2ed6454290c13703d371737305d39dba588faabaeed0581dee9d52c04650722f01097881614c39045a1f0e980385b677592665efffd0c1',
  { 
    apiUrl: 'http://localhost:4000/cubejs-api/v1',
    transport: {
      request: (url, { method, headers, body }) => {
        return fetch(url, { method, headers, body });
      },
    },
  }
);

//teste para os principais KPI 

describe('Testes de Métricas de KPI (US01)', () => {

  test('Deve calcular o faturamento, contagem e ticket médio (apenas para vendas completas)', async () => {
    
    const query = {
      measures: [
        'sales.count',        
        'sales.invoicing', 
        'sales.avg_ticket'   
      ],
      filters: [
        {
          dimension: 'sales.status', 
          operator: 'equals',
          values: ['COMPLETED']
        }
      ]
    };

    const resultSet = await cubeApi.load(query);
    const data = resultSet.tablePivot()[0];

    expect(data).toBeDefined(); 
    expect(data['sales.count']).toBeDefined();
    expect(data['sales.invoicing']).toBeDefined();
    expect(data['sales.avg_ticket']).toBeDefined();


    expect(Number(data['sales.count'])).toBeGreaterThan(0);
    expect(Number(data['sales.invoicing'])).toBeGreaterThan(0);
    expect(Number(data['sales.avg_ticket'])).toBeGreaterThan(0);

    const faturamentoCalculado = parseFloat(data['sales.invoicing']);
    const contagemCalculada = parseFloat(data['sales.count']);
    const ticketMedioCalculado = faturamentoCalculado / contagemCalculada;

    expect(parseFloat(data['sales.avg_ticket'])).toBeCloseTo(ticketMedioCalculado);
  });

test('Deve retornar o Top 10 produtos por faturamento (US03)', async () => {
    
    const query = {
      measures: [
        'sales.invoicing'
      ],
      dimensions: [
        'products.name'
      ],
      order: {
        'sales.invoicing': 'desc' 
      },
      limit: 10, 
      filters: [
        {
          member: 'sales.status', 
          operator: 'equals',
          values: ['COMPLETED']
        }
      ]
    };

    const resultSet = await cubeApi.load(query);
    const data = resultSet.tablePivot();

    expect(data).toBeDefined();
    expect(data.length).toBe(10);

    expect(data[0]['products.name']).toBeDefined();
    expect(data[0]['sales.invoicing']).toBeDefined();

    const faturamentoProduto1 = parseFloat(data[0]['sales.invoicing']);
    const faturamentoProduto2 = parseFloat(data[1]['sales.invoicing']);

    expect(faturamentoProduto1).toBeGreaterThanOrEqual(faturamentoProduto2);
  });

});