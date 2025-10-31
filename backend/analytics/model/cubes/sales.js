cube(`sales`, {
  sql_table: `public.sales`,
  
  data_source: `default`,
  
  joins: {
    
  },
  
  dimensions: {
    status: {
      sql: `sale_status_desc`,
      type: `string`
    },
    
    createdAt: {
      sql: `created_at`,
      type: `time`
    },

    id: {
      sql: `id`,
      type: `number`,
      primary_key: true
    },
    
    cod_sale1: {
      sql: `cod_sale1`,
      type: `string`
    },
    
    cod_sale2: {
      sql: `cod_sale2`,
      type: `string`
    },
    
    customer_name: {
      sql: `customer_name`,
      type: `string`
    },
    
    delivery_fee: {
      sql: `delivery_fee`,
      type: `string`
    },
    
    discount_reason: {
      sql: `discount_reason`,
      type: `string`
    },
    
    increase_reason: {
      sql: `increase_reason`,
      type: `string`
    },
    
    origin: {
      sql: `origin`,
      type: `string`
    },
    
    sale_status_desc: {
      sql: `sale_status_desc`,
      type: `string`
    },
    
    service_tax_fee: {
      sql: `service_tax_fee`,
      type: `string`
    },
    
    total_amount: {
      sql: `total_amount`,
      type: `string`
    },
    
    total_amount_items: {
      sql: `total_amount_items`,
      type: `string`
    },
    
    total_discount: {
      sql: `total_discount`,
      type: `string`
    },
    
    total_increase: {
      sql: `total_increase`,
      type: `string`
    },
    
    value_paid: {
      sql: `value_paid`,
      type: `string`
    }
  },
  
  measures: {
    count: {
      type: `count`
    },
    
    people_quantity: {
      sql: `people_quantity`,
      type: `sum`
    },
    
    invoicing: {
      type: `sum`,
      sql: `total_amount`, 
      format: `currency`,
      title: `Faturamento`
    },
    
    avg_ticket: {
      type: `number`,
      sql: `${invoicing} / ${count}`, 
      format: `currency`,
      title: `Ticket Médio`
    }
  },
  
  pre_aggregations: {
    // Pre-aggregation definitions go here.
    // Learn more in the documentation: https://cube.dev/docs/caching/pre-aggregations/getting-started
  }
});
